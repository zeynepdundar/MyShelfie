/**
 * Open Library dump'larından MyShelfie kitap kataloğunu üretir (TSV.gz).
 *
 *   pnpm --filter @shelfie/api catalog:build
 *   pnpm --filter @shelfie/api catalog:build -- --limit 500000
 *
 * Boyut: satır başına tablo + indeks ~450 B. Varsayılan 750k ≈ 350 MB; yenileme
 * sırasında eski ve yeni tablo bir arada durduğu için Neon free (1 GB) projesinde
 * ~1M üstüne çıkmayın.
 *
 * Girdi (data/openlibrary altında, `catalog:download` indirir):
 *   ol_dump_editions_latest.txt.gz   zorunlu
 *   ol_dump_authors_latest.txt.gz    zorunlu
 *   ol_dump_reading-log_latest.txt.gz, ol_dump_ratings_latest.txt.gz
 *                                    popülerlik için (yoksa herkes 0 puan)
 *   ol_dump_works_latest.txt.gz      yazarı baskıda değil eserde olan kayıtlar için (isteğe bağlı)
 *
 * Çıktı: data/catalog.tsv.gz → `catalog:load` bunu veritabanına yükler.
 *
 * Seçim kuralları:
 *   - Yalnızca ISBN'i (13 ya da 10→13) ve başlığı olan baskılar.
 *   - Dil: Türkçe ve İngilizce. Dil alanı boş ama ISBN'i Türk önekli (978-605,
 *     978-975) baskılar Türkçe sayılır.
 *   - Her eser + dil için tek baskı (kapaklı, sayfa/yıl bilgisi dolu olan seçilir).
 *   - Türkçe kayıtların hepsi alınır. İngilizce kayıtlar Open Library okuma
 *     listesi + puan sayısına göre sıralanır, toplam --limit'e göre kesilir.
 *     Hiç okunmamış İngilizce eserlerden yalnızca kapaklı olanlar yedek olarak
 *     tutulur ve kalan yer varsa eklenir.
 *
 * Dump'lar büyük (editions ~9 GB) ama satır satır okunur; bellekte yalnızca
 * seçilen adaylar durur. Varsayılan limit için ~3-4 GB RAM yeterli (script
 * --max-old-space-size=6144 ile çalışır). Süre: editions geçişi 20-40 dk.
 */
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { parseArgs } from "node:util";
import { createGunzip, createGzip } from "node:zlib";

import { CATALOG_TSV_COLUMNS, isTurkishIsbn, toIsbn13 } from "../../catalog/normalize.js";

const { values: args } = parseArgs({
  options: {
    dir: { type: "string", default: "data/openlibrary" },
    out: { type: "string", default: "data/catalog.tsv.gz" },
    limit: { type: "string", default: "750000" },
    "fallback-ratio": { type: "string", default: "0.5" },
  },
});

const DUMP_DIR = path.resolve(args.dir!);
const OUT_FILE = path.resolve(args.out!);
const LIMIT = Number(args.limit);
/** Popüler olmayan (kapaklı) İngilizce yedekler en fazla LIMIT * bu oran kadar tutulur. */
const FALLBACK_CAP = Math.floor(LIMIT * Number(args["fallback-ratio"]));

const dump = (name: string) => path.join(DUMP_DIR, `ol_dump_${name}_latest.txt.gz`);

type Lang = "eng" | "tur";

interface Candidate {
  editionId: number;
  workId: number | null;
  lang: Lang;
  isbn13: string;
  title: string;
  subtitle: string | null;
  authorIds: number[];
  authors: string;
  coverId: number | null;
  year: number | null;
  pages: number | null;
  publisher: string | null;
  popularity: number;
  quality: number;
}

// ---------------------------------------------------------------- yardımcılar

function lines(file: string) {
  return createInterface({
    input: createReadStream(file).pipe(createGunzip()),
    crlfDelay: Infinity,
  });
}

/** OL dump satırı: type \t key \t revision \t last_modified \t JSON */
function jsonColumn(line: string): string | null {
  let idx = -1;
  for (let i = 0; i < 4; i += 1) {
    idx = line.indexOf("\t", idx + 1);
    if (idx === -1) return null;
  }
  return line.slice(idx + 1);
}

/** "/works/OL123W" → 123, "/authors/OL9A" → 9, "/books/OL5M" → 5 */
function olNumber(key: unknown): number | null {
  if (typeof key !== "string") return null;
  const match = /OL(\d+)[AWM]$/.exec(key);
  return match ? Number(match[1]) : null;
}

function clean(text: unknown, max = 300): string | null {
  if (typeof text !== "string") return null;
  const value = text.replace(/[\t\r\n\\]+/g, " ").replace(/\s+/g, " ").trim();
  return value ? value.slice(0, max) : null;
}

function parseYear(text: unknown): number | null {
  if (typeof text !== "string") return null;
  const match = /\b(1[5-9]\d{2}|20\d{2})\b/.exec(text);
  return match ? Number(match[1]) : null;
}

function progress(label: string, count: number, extra = "") {
  if (count % 1_000_000 === 0) {
    console.log(`  ${label}: ${(count / 1e6).toFixed(0)}M satır ${extra}`);
  }
}

// ------------------------------------------------- 1. popülerlik (okuma log + puan)

async function loadPopularity(): Promise<Map<number, number>> {
  const scores = new Map<number, number>();

  for (const name of ["reading-log", "ratings"]) {
    const file = dump(name);
    if (!existsSync(file)) {
      console.warn(`! ${path.basename(file)} yok, popülerlik bu kaynak olmadan hesaplanıyor`);
      continue;
    }
    console.log(`→ ${path.basename(file)}`);
    let n = 0;
    for await (const line of lines(file)) {
      n += 1;
      const match = /^\/works\/OL(\d+)W/.exec(line);
      if (!match) continue;
      const id = Number(match[1]);
      scores.set(id, (scores.get(id) ?? 0) + 1);
    }
    console.log(`  ${n.toLocaleString()} satır`);
  }

  console.log(`  okunmuş/puanlanmış eser: ${scores.size.toLocaleString()}`);
  return scores;
}

// ------------------------------------------------------------- 2. baskılar

function detectLang(languages: unknown, isbn13: string): Lang | null {
  const keys = Array.isArray(languages)
    ? languages.map((l) => (l && typeof l === "object" ? (l as { key?: unknown }).key : null))
    : [];
  if (keys.includes("/languages/tur")) return "tur";
  if (keys.includes("/languages/eng")) return "eng";
  if (keys.length === 0 && isTurkishIsbn(isbn13)) return "tur";
  return null;
}

function pickIsbn(edition: Record<string, unknown>): string | null {
  for (const field of ["isbn_13", "isbn_10"]) {
    const list = edition[field];
    if (!Array.isArray(list)) continue;
    for (const raw of list) {
      const isbn = toIsbn13(typeof raw === "string" ? raw : null);
      if (isbn) return isbn;
    }
  }
  return null;
}

/** Aynı eserin baskıları arasında hangisi daha iyi? */
function qualityOf(c: Pick<Candidate, "coverId" | "pages" | "year" | "authorIds" | "subtitle">) {
  return (c.coverId ? 8 : 0) + (c.authorIds.length ? 4 : 0) + (c.pages ? 2 : 0) + (c.year ? 1 : 0);
}

async function collectEditions(popularity: Map<number, number>) {
  /** "w123|eng" ya da "e456|tur" (eseri olmayan baskı) → aday */
  const primary = new Map<string, Candidate>();
  const fallback = new Map<string, Candidate>();

  const file = dump("editions");
  console.log(`→ ${path.basename(file)}`);

  let n = 0;
  for await (const line of lines(file)) {
    n += 1;
    progress("editions", n, `(aday: ${primary.size.toLocaleString()} + yedek ${fallback.size.toLocaleString()})`);

    // JSON.parse pahalı; önce ucuz metin kontrolleriyle eleyelim.
    if (!line.includes('"isbn_')) continue;
    if (
      !line.includes('"/languages/eng"') &&
      !line.includes('"/languages/tur"') &&
      !line.includes('"978605') &&
      !line.includes('"978975') &&
      !line.includes('"605') &&
      !line.includes('"975')
    ) {
      continue;
    }

    const json = jsonColumn(line);
    if (!json) continue;

    let edition: Record<string, unknown>;
    try {
      edition = JSON.parse(json);
    } catch {
      continue;
    }

    const isbn13 = pickIsbn(edition);
    const title = clean(edition.title);
    if (!isbn13 || !title) continue;

    const lang = detectLang(edition.languages, isbn13);
    if (!lang) continue;

    const editionId = olNumber(edition.key);
    if (editionId === null) continue;

    const works = Array.isArray(edition.works) ? edition.works : [];
    const workId = olNumber((works[0] as { key?: unknown } | undefined)?.key);
    const score = workId !== null ? popularity.get(workId) ?? 0 : 0;

    const authorIds = (Array.isArray(edition.authors) ? edition.authors : [])
      .map((a) => olNumber((a as { key?: unknown })?.key))
      .filter((id): id is number => id !== null)
      .slice(0, 5);

    const covers = Array.isArray(edition.covers) ? edition.covers : [];
    const coverId = covers.find((c): c is number => typeof c === "number" && c > 0) ?? null;

    const pagesRaw = edition.number_of_pages;
    const pages = typeof pagesRaw === "number" && pagesRaw > 0 && pagesRaw < 20000 ? pagesRaw : null;
    const publishers = Array.isArray(edition.publishers) ? edition.publishers : [];

    const candidate: Candidate = {
      editionId,
      workId,
      lang,
      isbn13,
      title,
      subtitle: clean(edition.subtitle),
      authorIds,
      authors: "",
      coverId,
      year: parseYear(edition.publish_date),
      pages,
      publisher: clean(publishers[0], 120),
      popularity: score,
      quality: 0,
    };
    candidate.quality = qualityOf(candidate);

    const key = `${workId !== null ? `w${workId}` : `e${editionId}`}|${lang}`;
    const isPrimary = lang === "tur" || score > 0;

    if (isPrimary) {
      const existing = primary.get(key);
      if (!existing || candidate.quality > existing.quality) primary.set(key, candidate);
      continue;
    }

    // Popüler olmayan İngilizce: yalnızca kapaklı olanlar, sınırlı sayıda.
    if (!coverId) continue;
    const existing = fallback.get(key);
    if (existing) {
      if (candidate.quality > existing.quality) fallback.set(key, candidate);
    } else if (fallback.size < FALLBACK_CAP) {
      fallback.set(key, candidate);
    }
  }

  console.log(`  ${n.toLocaleString()} satır, aday ${primary.size.toLocaleString()}, yedek ${fallback.size.toLocaleString()}`);
  return { primary, fallback };
}

// ----------------------------------------------------------- 3. seçim

function select(primary: Map<string, Candidate>, fallback: Map<string, Candidate>) {
  const turkish: Candidate[] = [];
  const english: Candidate[] = [];
  for (const c of primary.values()) (c.lang === "tur" ? turkish : english).push(c);

  const byRank = (a: Candidate, b: Candidate) => b.popularity - a.popularity || b.quality - a.quality;
  english.sort(byRank);
  turkish.sort(byRank);

  const room = Math.max(0, LIMIT - turkish.length);
  const chosen = turkish.concat(english.slice(0, room));

  if (chosen.length < LIMIT) {
    const extra = [...fallback.values()].sort(byRank).slice(0, LIMIT - chosen.length);
    chosen.push(...extra);
  }

  console.log(
    `→ seçilen: ${chosen.length.toLocaleString()} (TR ${turkish.length.toLocaleString()}, ` +
      `EN ${(chosen.length - turkish.length).toLocaleString()})`,
  );
  if (turkish.length > LIMIT) console.warn("! Türkçe kayıtlar tek başına limiti aşıyor, hepsi yine de alındı");
  return chosen;
}

// ------------------------------------------- 4. yazar adı eksik olanlar için eserler

async function fillAuthorsFromWorks(chosen: Candidate[]) {
  const needing = new Map<number, Candidate[]>();
  for (const c of chosen) {
    if (c.authorIds.length || c.workId === null) continue;
    const list = needing.get(c.workId) ?? [];
    list.push(c);
    needing.set(c.workId, list);
  }
  if (!needing.size) return;

  const file = dump("works");
  if (!existsSync(file)) {
    console.warn(`! ${needing.size.toLocaleString()} eserin yazarı baskıda yok; works dump'ı olmadığı için boş kalacak`);
    return;
  }

  console.log(`→ ${path.basename(file)} (${needing.size.toLocaleString()} eserin yazarı aranıyor)`);
  let n = 0;
  for await (const line of lines(file)) {
    n += 1;
    progress("works", n);
    const match = /\t\/works\/OL(\d+)W\t/.exec(line.slice(0, 64));
    if (!match) continue;
    const targets = needing.get(Number(match[1]));
    if (!targets) continue;

    const json = jsonColumn(line);
    if (!json) continue;
    try {
      const work = JSON.parse(json) as { authors?: Array<{ author?: { key?: unknown } }> };
      const ids = (work.authors ?? [])
        .map((a) => olNumber(a?.author?.key))
        .filter((id): id is number => id !== null)
        .slice(0, 5);
      for (const c of targets) c.authorIds = ids;
    } catch {
      // bozuk satır, geç
    }
  }
}

// ------------------------------------------------------------ 5. yazar adları

async function resolveAuthorNames(chosen: Candidate[]) {
  const wanted = new Set<number>();
  for (const c of chosen) for (const id of c.authorIds) wanted.add(id);

  const names = new Map<number, string>();
  const file = dump("authors");
  console.log(`→ ${path.basename(file)} (${wanted.size.toLocaleString()} yazar)`);

  let n = 0;
  for await (const line of lines(file)) {
    n += 1;
    progress("authors", n);
    const match = /\t\/authors\/OL(\d+)A\t/.exec(line.slice(0, 64));
    if (!match) continue;
    const id = Number(match[1]);
    if (!wanted.has(id)) continue;

    const json = jsonColumn(line);
    if (!json) continue;
    try {
      const author = JSON.parse(json) as { name?: unknown; personal_name?: unknown };
      const name = clean(author.name, 120) ?? clean(author.personal_name, 120);
      if (name) names.set(id, name);
    } catch {
      // geç
    }
  }

  let missing = 0;
  for (const c of chosen) {
    c.authors = [...new Set(c.authorIds.map((id) => names.get(id)).filter(Boolean))].join(", ");
    if (!c.authors) missing += 1;
  }
  if (missing) console.log(`  yazarı bulunamayan kayıt: ${missing.toLocaleString()}`);
}

// ------------------------------------------------------------------ 6. çıktı

async function writeTsv(chosen: Candidate[]) {
  mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  const gzip = createGzip();
  const done = new Promise<void>((resolve, reject) => {
    gzip.pipe(createWriteStream(OUT_FILE)).on("finish", resolve).on("error", reject);
  });

  const cell = (v: string | number | null) => (v === null || v === "" ? "\\N" : String(v));
  gzip.write(`${CATALOG_TSV_COLUMNS.join("\t")}\n`);
  for (const c of chosen) {
    const row = [
      `OL${c.editionId}M`,
      c.workId !== null ? `OL${c.workId}W` : null,
      c.lang,
      c.isbn13,
      c.title,
      c.subtitle,
      c.authors,
      c.coverId,
      c.year,
      c.pages,
      c.publisher,
      c.popularity,
    ];
    if (!gzip.write(`${row.map(cell).join("\t")}\n`)) {
      await new Promise((resolve) => gzip.once("drain", resolve));
    }
  }
  gzip.end();
  await done;
  console.log(`✓ ${OUT_FILE}`);
}

// ------------------------------------------------------------------- ana akış

async function main() {
  for (const required of ["editions", "authors"]) {
    if (!existsSync(dump(required))) {
      console.error(`✗ ${dump(required)} bulunamadı. Önce: pnpm --filter @shelfie/api catalog:download`);
      process.exit(1);
    }
  }

  const started = Date.now();
  console.log(`Katalog: limit ${LIMIT.toLocaleString()}, dump klasörü ${DUMP_DIR}`);

  const popularity = await loadPopularity();
  const { primary, fallback } = await collectEditions(popularity);
  popularity.clear();

  const chosen = select(primary, fallback);
  primary.clear();
  fallback.clear();

  await fillAuthorsFromWorks(chosen);
  await resolveAuthorNames(chosen);
  await writeTsv(chosen);

  console.log(`Bitti: ${((Date.now() - started) / 60000).toFixed(1)} dk`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

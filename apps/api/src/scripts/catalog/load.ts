/**
 * catalog:build'in ürettiği data/catalog.tsv.gz dosyasını katalog veritabanına
 * yükler.
 *
 *   pnpm --filter @shelfie/api catalog:load
 *   pnpm --filter @shelfie/api catalog:load -- --file data/catalog.tsv.gz
 *
 * Hedef: CATALOG_DATABASE_URL. Tanımlı değilse yalnızca yerel bir DATABASE_URL
 * (localhost) kabul edilir — Neon free planında proje başına 1 GB sınır var ve
 * dolduğunda kullanıcı verisine yazma da durur. Bu yüzden katalog ayrı bir Neon
 * projesinde durur.
 *
 * Kesintisiz yenileme: veri önce catalog_books_next tablosuna yazılır,
 * indeksler kurulur, sonra tek transaction'da eski tabloyla yer değiştirir.
 * Aylık dump geldiğinde aynı komut tekrar çalıştırılabilir; arama hiç kesilmez.
 * Bu sırada iki tablo birden yer kaplar; depolama yetmezse --drop-first.
 */
import "dotenv/config";

import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { parseArgs } from "node:util";
import { createGunzip } from "node:zlib";

import pg from "pg";

import { CATALOG_TSV_COLUMNS, foldForSearch } from "../../catalog/normalize.js";

const { values: args } = parseArgs({
  options: {
    file: { type: "string", default: "data/catalog.tsv.gz" },
    batch: { type: "string", default: "2000" },
    /** Eski tabloyu baştan siler: yer açar ama yükleme bitene kadar arama 503 döner. */
    "drop-first": { type: "boolean", default: false },
  },
});

const FILE = path.resolve(args.file!);
const BATCH = Number(args.batch);

function targetUrl(): string {
  const catalogUrl = process.env.CATALOG_DATABASE_URL_UNPOOLED || process.env.CATALOG_DATABASE_URL;
  if (catalogUrl) return catalogUrl;

  const appUrl = process.env.DATABASE_URL ?? "";
  const host = (() => {
    try {
      return new URL(appUrl).hostname;
    } catch {
      return "";
    }
  })();
  if (host === "localhost" || host === "127.0.0.1") {
    console.log("CATALOG_DATABASE_URL yok; yerel DATABASE_URL kullanılıyor.");
    return appUrl;
  }

  console.error(
    "✗ CATALOG_DATABASE_URL tanımlı değil.\n" +
      "  Katalog uygulama veritabanına (Neon) yüklenmez: 1 GB sınırı dolarsa kullanıcı\n" +
      "  verisine yazma da durur. Neon'da ayrı bir proje açıp adresini apps/api/.env\n" +
      "  içine CATALOG_DATABASE_URL olarak ekleyin.",
  );
  process.exit(1);
}

const CREATE_NEXT = `
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  DROP TABLE IF EXISTS catalog_books_next;
  CREATE TABLE catalog_books_next (
    id             text PRIMARY KEY,          -- Open Library baskı anahtarı (OL123M)
    work_id        text,                      -- Open Library eser anahtarı (OL45W)
    lang           text NOT NULL,             -- 'eng' | 'tur'
    isbn13         text NOT NULL,
    title          text NOT NULL,
    subtitle       text,
    authors        text,                      -- virgülle ayrılmış adlar
    cover_id       integer,                   -- covers.openlibrary.org/b/id/{cover_id}-M.jpg
    published_year smallint,
    pages          integer,
    publisher      text,
    popularity     integer NOT NULL DEFAULT 0,
    search_text    text NOT NULL              -- foldForSearch(başlık + alt başlık + yazarlar)
  );
`;

const INSERT = `
  INSERT INTO catalog_books_next
    (id, work_id, lang, isbn13, title, subtitle, authors, cover_id,
     published_year, pages, publisher, popularity, search_text)
  SELECT * FROM unnest(
    $1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::text[],
    $8::integer[], $9::smallint[], $10::integer[], $11::text[], $12::integer[], $13::text[]
  )
  ON CONFLICT (id) DO NOTHING
`;

const FINALIZE = `
  CREATE INDEX catalog_books_next_isbn ON catalog_books_next (isbn13);
  CREATE INDEX catalog_books_next_search ON catalog_books_next USING gin (search_text gin_trgm_ops);
  ANALYZE catalog_books_next;
`;

const SWAP = `
  BEGIN;
  DROP TABLE IF EXISTS catalog_books;
  ALTER TABLE catalog_books_next RENAME TO catalog_books;
  ALTER INDEX catalog_books_next_pkey RENAME TO catalog_books_pkey;
  ALTER INDEX catalog_books_next_isbn RENAME TO catalog_books_isbn;
  ALTER INDEX catalog_books_next_search RENAME TO catalog_books_search;
  COMMIT;
`;

type Row = (string | null)[];

function parseLine(line: string): Row {
  return line.split("\t").map((cell) => (cell === "\\N" ? null : cell));
}

async function main() {
  if (!existsSync(FILE)) {
    console.error(`✗ ${FILE} yok. Önce: pnpm --filter @shelfie/api catalog:build`);
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: targetUrl() });
  await client.connect();
  const started = Date.now();

  try {
    if (args["drop-first"]) {
      console.log("→ eski catalog_books siliniyor (--drop-first)");
      await client.query("DROP TABLE IF EXISTS catalog_books");
    }

    console.log("→ catalog_books_next oluşturuluyor");
    await client.query(CREATE_NEXT);

    const input = createInterface({
      input: createReadStream(FILE).pipe(createGunzip()),
      crlfDelay: Infinity,
    });

    const columns = CATALOG_TSV_COLUMNS.length;
    let header = true;
    let batch: Row[] = [];
    let total = 0;

    const flush = async () => {
      if (!batch.length) return;
      // Kolon bazlı diziler: unnest($1, $2, …) tek sorguda binlerce satır ekler.
      const params: (string | null)[][] = Array.from({ length: columns + 1 }, () => []);
      for (const row of batch) {
        for (let i = 0; i < columns; i += 1) params[i].push(row[i] ?? null);
        const [title, subtitle, authors] = [row[4], row[5], row[6]];
        params[columns].push(foldForSearch([title, subtitle, authors].filter(Boolean).join(" ")));
      }
      await client.query(INSERT, params);
      total += batch.length;
      batch = [];
      if (total % 100_000 < BATCH) console.log(`  ${total.toLocaleString()} satır`);
    };

    for await (const line of input) {
      if (header) {
        header = false;
        if (line !== CATALOG_TSV_COLUMNS.join("\t")) {
          throw new Error("TSV başlığı beklenen kolonlarla uyuşmuyor; catalog:build'i yeniden çalıştırın.");
        }
        continue;
      }
      if (!line) continue;
      batch.push(parseLine(line));
      if (batch.length >= BATCH) await flush();
    }
    await flush();

    console.log("→ indeksler kuruluyor (birkaç dakika sürebilir)");
    await client.query(FINALIZE);

    console.log("→ tablo değiştiriliyor");
    await client.query(SWAP);

    const { rows } = await client.query<{ size: string }>(
      "SELECT pg_size_pretty(pg_total_relation_size('catalog_books')) AS size",
    );
    console.log(
      `✓ ${total.toLocaleString()} kitap yüklendi, tablo + indeks boyutu: ${rows[0]?.size} ` +
        `(${((Date.now() - started) / 60000).toFixed(1)} dk)`,
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    // Yarım kalan tablo yer kaplamasın (Neon'da depolama sınırı var).
    await client.query("DROP TABLE IF EXISTS catalog_books_next").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

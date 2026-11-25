import type { Book } from "@shelfie/types";

/* ============================================================================
   CSV içe aktarma — her şey tarayıcıda; sunucuya yalnızca son liste gider
   (POST /api/books/import).

   Okunan biçimler (başlık satırına bakılarak, büyük/küçük harf duyarsız):
     - MyShelfie'nin kendi dışa aktarımı (lib/exportCsv.ts):
         Title, Author, Pages, Start Date, End Date, Notes
     - Goodreads "Export Library":
         Title, Author, ISBN13, My Rating, Number of Pages, Year Published,
         Date Read, Date Added, Exclusive Shelf, My Review
     - StoryGraph dışa aktarımı:
         Title, Authors, ISBN/UID, Read Status, Star Rating,
         Last Date Read, Date Added, Review
   Ayraç virgül ya da noktalı virgül olabilir (Türkçe Excel ";" kullanır).
   ========================================================================== */

/** API tek istekte en fazla bu kadar kitap kabul ediyor. */
export const IMPORT_LIMIT = 2000;

export type ImportBook = {
  title: string;
  author: string;
  pages: number;
  isbn?: string;
  publishedYear?: number;
  rating?: number;
  notes?: string;
  startDate?: string;
  endDate?: string;
  isCompleted: boolean;
  wantToRead: boolean;
  isFavorite: boolean;
  dateAdded?: string;
};

export type RowProblem = { line: number; reason: "missingTitle" | "missingAuthor" };

export interface ImportPreview {
  books: ImportBook[];
  /** Kütüphanede ya da dosyada zaten olan, atlanan kitaplar. */
  duplicates: number;
  problems: RowProblem[];
  format: "myshelfie" | "goodreads" | "storygraph" | "generic";
}

export class CsvFormatError extends Error {
  constructor(readonly reason: "empty" | "noTitleColumn" | "noAuthorColumn" | "tooMany") {
    super(reason);
    this.name = "CsvFormatError";
  }
}

// ------------------------------------------------------------- CSV ayrıştırma

function detectDelimiter(firstLine: string) {
  const count = (ch: string) => {
    let n = 0;
    let quoted = false;
    for (const c of firstLine) {
      if (c === '"') quoted = !quoted;
      else if (c === ch && !quoted) n += 1;
    }
    return n;
  };
  return count(";") > count(",") ? ";" : ",";
}

/** RFC 4180: tırnak içinde ayraç, satır sonu ve "" kaçışı desteklenir. */
export function parseCsv(text: string): string[][] {
  const input = text.replace(/^﻿/, "");
  const delimiter = detectDelimiter(input.slice(0, input.search(/\r?\n|$/)));
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const c = input[i];
    if (quoted) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === delimiter) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && input[i + 1] === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += c;
    }
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

// ---------------------------------------------------------- hücre temizleme

/** Dışa aktarımın CSV injection koruması ('=…) ve Goodreads'in ="…" biçimi. */
function clean(value: string | undefined) {
  if (value === undefined) return "";
  let v = value.trim();
  const excel = /^="(.*)"$/.exec(v);
  if (excel) v = excel[1];
  if (/^'[=+\-@]/.test(v)) v = v.slice(1);
  return v.trim();
}

/** YYYY-MM-DD, YYYY/MM/DD, DD.MM.YYYY, DD/MM/YYYY → YYYY-MM-DD; değilse undefined. */
function toIsoDate(raw: string): string | undefined {
  const v = clean(raw);
  if (!v) return undefined;
  let y: number, m: number, d: number;
  let match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(v);
  if (match) {
    [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else if ((match = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(v))) {
    [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else {
    return undefined;
  }
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return undefined;
  }
  return date.toISOString().slice(0, 10);
}

function toInt(raw: string, min: number, max: number) {
  const n = Number.parseInt(clean(raw).replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) && n >= min && n <= max ? n : undefined;
}

function toIsbn(raw: string) {
  const v = clean(raw).replace(/[^0-9Xx]/g, "").toUpperCase();
  return v.length === 10 || v.length === 13 ? v : undefined;
}

// ----------------------------------------------------------- sütun eşleme

const ALIASES = {
  title: ["title", "book title"],
  author: ["author", "authors", "author l-f"],
  pages: ["pages", "number of pages", "page count"],
  isbn: ["isbn13", "isbn", "isbn/uid"],
  isbn10: ["isbn10"],
  year: ["year published", "original publication year", "published year"],
  rating: ["my rating", "star rating", "rating"],
  notes: ["notes", "my review", "review", "private notes"],
  startDate: ["start date", "date started", "started"],
  endDate: ["end date", "date read", "last date read", "finished"],
  dateAdded: ["date added"],
  shelf: ["exclusive shelf", "read status", "status"],
} as const;

type Field = keyof typeof ALIASES;

function mapColumns(header: string[]) {
  const normalized = header.map((h) => clean(h).toLowerCase());
  const index = {} as Record<Field, number>;
  // Takma adlar öncelik sırasıyla denenir: Goodreads'te hem "ISBN" hem
  // "ISBN13" varsa ISBN13 seçilir.
  for (const field of Object.keys(ALIASES) as Field[]) {
    const alias = (ALIASES[field] as readonly string[]).find((a) => normalized.includes(a));
    index[field] = alias ? normalized.indexOf(alias) : -1;
  }
  return { index, normalized };
}

function detectFormat(normalized: string[]): ImportPreview["format"] {
  if (normalized.includes("exclusive shelf")) return "goodreads";
  if (normalized.includes("read status") && normalized.includes("isbn/uid")) return "storygraph";
  if (normalized.join("|") === "title|author|pages|start date|end date|notes") return "myshelfie";
  return "generic";
}

/** Goodreads "to-read", StoryGraph "to-read"/"currently-reading"/"read"/"did-not-finish". */
function shelfOf(raw: string) {
  const v = clean(raw).toLowerCase().replace(/\s+/g, "-");
  if (v === "to-read" || v === "want-to-read") return "wantToRead";
  if (v === "read") return "read";
  return "other";
}

// ----------------------------------------------------- yineleme kontrolü

const keyText = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

/** "Kürk Mantolu Madonna" + "Sabahattin Ali" ile "kurk mantolu madonna" aynı kitap. */
const bookKey = (title: string, author: string) => `${keyText(title)}|${keyText(author).split(" ")[0] ?? ""}`;

// ------------------------------------------------------------------- ana iş

export function buildImport(text: string, existing: Pick<Book, "title" | "author" | "isbn">[]): ImportPreview {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new CsvFormatError("empty");

  const { index, normalized } = mapColumns(rows[0]);
  if (index.title < 0) throw new CsvFormatError("noTitleColumn");
  if (index.author < 0) throw new CsvFormatError("noAuthorColumn");

  const seen = new Set(existing.map((b) => bookKey(b.title, b.author)));
  const seenIsbn = new Set(existing.map((b) => b.isbn).filter(Boolean) as string[]);

  const books: ImportBook[] = [];
  const problems: RowProblem[] = [];
  let duplicates = 0;

  const get = (row: string[], field: Field) => (index[field] >= 0 ? row[index[field]] ?? "" : "");

  rows.slice(1).forEach((row, i) => {
    const line = i + 2;
    const title = clean(get(row, "title"));
    // StoryGraph birden çok yazarı virgülle yazar; olduğu gibi bırakılır.
    const author = clean(get(row, "author"));
    if (!title) return problems.push({ line, reason: "missingTitle" });
    if (!author) return problems.push({ line, reason: "missingAuthor" });

    const isbn = toIsbn(get(row, "isbn")) ?? toIsbn(get(row, "isbn10"));
    const key = bookKey(title, author);
    if (seen.has(key) || (isbn && seenIsbn.has(isbn))) {
      duplicates += 1;
      return;
    }
    seen.add(key);
    if (isbn) seenIsbn.add(isbn);

    const shelf = shelfOf(get(row, "shelf"));
    let endDate = toIsoDate(get(row, "endDate"));
    const startDate = toIsoDate(get(row, "startDate"));
    const dateAdded = toIsoDate(get(row, "dateAdded"));
    // Goodreads "read" rafındaki kitapların çoğunda okuma tarihi yok;
    // okunmuş sayılsın diye eklenme tarihi bitiş tarihi olarak kullanılır.
    if (!endDate && shelf === "read") endDate = dateAdded;

    const wantToRead = shelf === "wantToRead" && !endDate;
    const rating = toInt(get(row, "rating"), 1, 5);

    books.push({
      title: title.slice(0, 500),
      author: author.slice(0, 300),
      pages: toInt(get(row, "pages"), 0, 100_000) ?? 0,
      ...(isbn && { isbn }),
      ...(toInt(get(row, "year"), 0, 3000) !== undefined && { publishedYear: toInt(get(row, "year"), 0, 3000) }),
      ...(rating && { rating }),
      ...(clean(get(row, "notes")) && { notes: clean(get(row, "notes")).slice(0, 10_000) }),
      ...(!wantToRead && startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(dateAdded && { dateAdded }),
      isCompleted: Boolean(endDate),
      wantToRead,
      isFavorite: false,
    });
  });

  if (books.length > IMPORT_LIMIT) throw new CsvFormatError("tooMany");

  return { books, duplicates, problems, format: detectFormat(normalized) };
}

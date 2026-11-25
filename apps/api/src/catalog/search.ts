import pg from "pg";

import type { CatalogBook } from "@shelfie/types";

import { env, hasCatalog } from "../env.js";
import { serviceUnavailable } from "../http-error.js";
import { foldForSearch, openLibraryCoverUrl, toIsbn13 } from "./normalize.js";

/**
 * Kitap kataloğu araması. Katalog ayrı bir veritabanında (CATALOG_DATABASE_URL)
 * durabildiği için Prisma yerine küçük bir pg havuzu kullanılır; tablo Prisma
 * şemasında değil, `catalog:load` scripti kurar.
 */
let pool: pg.Pool | undefined;

function getPool(): pg.Pool {
  if (!hasCatalog) {
    throw serviceUnavailable("Katalog veritabanı yapılandırılmamış (CATALOG_DATABASE_URL).");
  }
  pool ??= new pg.Pool({ connectionString: env.catalogDatabaseUrl, max: 3 });
  return pool;
}

interface CatalogRow {
  id: string;
  work_id: string | null;
  lang: string;
  isbn13: string;
  title: string;
  subtitle: string | null;
  authors: string | null;
  cover_id: number | null;
  published_year: number | null;
  pages: number | null;
  publisher: string | null;
}

const COLUMNS = `id, work_id, lang, isbn13, title, subtitle, authors, cover_id,
  published_year, pages, publisher`;

function toDto(row: CatalogRow): CatalogBook {
  return {
    id: row.id,
    workId: row.work_id ?? undefined,
    language: row.lang === "tur" ? "tr" : "en",
    isbn: row.isbn13,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    authors: row.authors ? row.authors.split(", ") : [],
    coverUrl: openLibraryCoverUrl(row.cover_id),
    publishedYear: row.published_year ?? undefined,
    pages: row.pages ?? undefined,
    publisher: row.publisher ?? undefined,
  };
}

async function run(sql: string, params: unknown[]): Promise<CatalogRow[]> {
  try {
    const { rows } = await getPool().query<CatalogRow>(sql, params);
    return rows;
  } catch (error) {
    // 42P01: tablo yok → katalog henüz yüklenmemiş.
    if ((error as { code?: string }).code === "42P01") {
      throw serviceUnavailable("Katalog henüz yüklenmedi (pnpm --filter @shelfie/api catalog:load).");
    }
    throw error;
  }
}

export async function findByIsbn(raw: string): Promise<CatalogBook[]> {
  const isbn = toIsbn13(raw);
  if (!isbn) return [];
  const rows = await run(
    `SELECT ${COLUMNS} FROM catalog_books WHERE isbn13 = $1 ORDER BY popularity DESC LIMIT 5`,
    [isbn],
  );
  return rows.map(toDto);
}

/**
 * Başlık/yazar araması. Metin iki tarafta da foldForSearch ile katlanır
 * (İ/ı/ş/ğ… farkı yok), pg_trgm'in kelime benzerliğiyle eşleşir; eşit
 * benzerlikte daha çok okunan kitap öne çıkar.
 *
 * ISBN'e benzeyen sorgular (10/13 hane) doğrudan ISBN araması yapar.
 */
export async function searchCatalog(query: string, limit: number): Promise<CatalogBook[]> {
  if (/^[\d\s-]{10,17}[xX]?$/.test(query.trim())) {
    const byIsbn = await findByIsbn(query);
    if (byIsbn.length) return byIsbn.slice(0, limit);
  }

  const folded = foldForSearch(query);
  if (folded.length < 2) return [];

  const rows = await run(
    `SELECT ${COLUMNS}
       FROM catalog_books
      WHERE $1 <% search_text
      ORDER BY word_similarity($1, search_text) DESC, popularity DESC
      LIMIT $2`,
    [folded, limit],
  );
  return rows.map(toDto);
}

export async function disconnectCatalog() {
  await pool?.end();
  pool = undefined;
}

import type { CatalogBook } from "@shelfie/types";

import { ApiError, apiFetch, isApiEnabled } from "@/lib/api";
import {
  GoogleBooksError,
  findBookCover,
  hasGoogleBooksKey,
  searchGoogleBooks,
} from "@/lib/googleBooks";

/* ============================================================================
   Kitap arama
   Önce MyShelfie kataloğunda (/api/catalog, Open Library verisi) aranır.
   Katalog sonuç vermezse ya da ulaşılamazsa, anahtar tanımlıysa Google Books
   yedek olarak denenir. Arayüz hangi kaynaktan geldiğini bilmek zorunda değil.
   ========================================================================== */

export interface BookSearchResult {
  id: string;
  title: string;
  authors: string[];
  pages?: number;
  coverUrl?: string;
  isbn?: string;
  publishedYear?: number;
  source: "catalog" | "google";
}

/** Herhangi bir arama kaynağı yapılandırılmış mı? */
export const hasBookSearch = isApiEnabled || hasGoogleBooksKey;

/** Kaynak geçici olarak meşgul (tekrar denemek anlamlı). */
export function isTransientSearchError(error: unknown) {
  return (
    (error instanceof GoogleBooksError && error.isTransient) ||
    (error instanceof ApiError && (error.status === 429 || error.status === 503))
  );
}

function fromCatalog(book: CatalogBook): BookSearchResult {
  return {
    id: book.id,
    title: book.subtitle ? `${book.title}: ${book.subtitle}` : book.title,
    authors: book.authors,
    pages: book.pages,
    coverUrl: book.coverUrl,
    isbn: book.isbn,
    publishedYear: book.publishedYear,
    source: "catalog",
  };
}

async function searchCatalog(query: string, limit: number) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const books = await apiFetch<CatalogBook[]>(`/api/catalog/search?${params}`);
  return books.map(fromCatalog);
}

async function searchGoogle(query: string, limit: number): Promise<BookSearchResult[]> {
  const items = await searchGoogleBooks(query, limit);
  return items.map((item) => ({
    id: `google:${item.id}`,
    title: item.volumeInfo.title,
    authors: item.volumeInfo.authors ?? [],
    pages: item.volumeInfo.pageCount,
    coverUrl: item.volumeInfo.imageLinks?.thumbnail,
    source: "google",
  }));
}

export async function searchBooks(query: string, limit = 8): Promise<BookSearchResult[]> {
  let catalogError: unknown = null;

  if (isApiEnabled) {
    try {
      const results = await searchCatalog(query, limit);
      if (results.length || !hasGoogleBooksKey) return results;
    } catch (error) {
      console.warn("Katalog araması başarısız, Google Books deneniyor:", error);
      catalogError = error;
    }
  }

  if (hasGoogleBooksKey) {
    try {
      return await searchGoogle(query, limit);
    } catch (error) {
      // İkisi de çöktüyse kataloğun hatasını göster; Google sadece yedekti.
      throw catalogError ?? error;
    }
  }

  if (catalogError) throw catalogError;
  return [];
}

/** Kapağı olmayan kitaplar için kapak bulur (önce katalog, sonra Google). */
export async function findCover(title: string, author: string): Promise<string | undefined> {
  if (isApiEnabled) {
    try {
      const [match] = await searchCatalog(`${title} ${author}`.trim(), 1);
      if (match?.coverUrl) return match.coverUrl;
    } catch (error) {
      if (!hasGoogleBooksKey) throw error;
    }
  }
  return hasGoogleBooksKey ? findBookCover(title, author) : undefined;
}

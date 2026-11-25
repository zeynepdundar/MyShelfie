import type { CatalogBook } from "@shelfie/types";

import { apiFetch, isApiConfigured } from "@/lib/api";
import { hasGoogleBooksKey, searchGoogleBooks } from "@/lib/googleBooks";

/* ============================================================================
   Kitap arama — web › lib/bookSearch.ts ile aynı akış.
   Önce MyShelfie kataloğu (/api/catalog, Open Library verisi); sonuç yoksa
   ya da katalog ulaşılamazsa, anahtar tanımlıysa Google Books yedeği.
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
export const hasBookSearch = isApiConfigured || hasGoogleBooksKey;

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
  const books = await apiFetch<CatalogBook[]>(`/api/catalog/search?${params.toString()}`);
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

export async function searchBooks(query: string, limit = 12): Promise<BookSearchResult[]> {
  let catalogError: unknown = null;

  if (isApiConfigured) {
    try {
      const results = await searchCatalog(query, Math.min(limit, 20));
      if (results.length || !hasGoogleBooksKey) return results;
    } catch (error) {
      console.warn("[bookSearch] katalog araması başarısız, Google Books deneniyor:", error);
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

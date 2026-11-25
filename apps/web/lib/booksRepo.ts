import type { Book, Quote } from "@shelfie/types";

import { apiFetch } from "@/lib/api";

/* ============================================================================
   Kitap verisine erişim — tek kapı
   booksSlice yalnızca bu arayüzü bilir. Veri apps/api üzerinden Postgres'te
   durur (NEXT_PUBLIC_API_URL zorunlu). Firestore artık kullanılmıyor; eski
   kayıtlar migrate:firestore ile taşındı, kalıntıları hesap silinirken API siler.
   ========================================================================== */

export type NewBook = Omit<Book, "id" | "dateAdded">;
export type NewQuote = Pick<Quote, "text" | "page" | "notes">;

export interface BooksRepo {
  list(): Promise<Book[]>;
  add(book: NewBook): Promise<Book>;
  /** Güncellenmiş alanları döndürür; reducer bunları mevcut kitabın üstüne yazar. */
  update(bookId: string, updates: Partial<Book>): Promise<Partial<Book>>;
  remove(bookId: string): Promise<void>;
  addQuote(bookId: string, quote: NewQuote): Promise<Quote>;
}

/** API'nin kitap gövdesinde kabul etmediği, sunucunun yönettiği alanlar. */
function bookBody(book: Partial<Book>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, dateAdded, quotes, ...rest } = book;
  return rest;
}

export const booksRepo: BooksRepo = {
  list: () => apiFetch<Book[]>("/api/books"),

  add: (book) => apiFetch<Book>("/api/books", { method: "POST", body: bookBody(book) }),

  async update(bookId, updates) {
    const body = bookBody(updates);
    if (Object.keys(body).length === 0) return {};
    // Sunucu durum alanlarını tutarlı hâle getirebilir; tam kitabı geri al.
    return apiFetch<Book>(`/api/books/${encodeURIComponent(bookId)}`, {
      method: "PATCH",
      body,
    });
  },

  remove: (bookId) =>
    apiFetch<void>(`/api/books/${encodeURIComponent(bookId)}`, { method: "DELETE" }),

  addQuote: (bookId, quote) =>
    apiFetch<Quote>(`/api/books/${encodeURIComponent(bookId)}/quotes`, {
      method: "POST",
      body: quote,
    }),
};


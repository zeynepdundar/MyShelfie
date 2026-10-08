import type { Book, Quote } from "@shelfie/types";

import { apiFetch } from "@/lib/api";

export type NewBook = Omit<Book, "id" | "dateAdded" | "quotes">;
/** PATCH gövdesi: null alanı temizler (örn. endDate: null → okunmadı). */
export type BookPatch = { [K in keyof Book]?: Book[K] | null };

export type NewQuote = Pick<Quote, "text" | "page" | "notes">;

export interface Profile {
  id: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  isAnonymous: boolean;
  createdAt: string;
  counts: { books: number; completed: number; quotes: number };
}

/** Sunucunun yönettiği alanlar gövdeye girmez. */
function bookBody(book: BookPatch) {
  const { id: _id, dateAdded: _dateAdded, quotes: _quotes, ...rest } = book;
  return rest;
}

const enc = encodeURIComponent;

export const booksApi = {
  list: () => apiFetch<Book[]>("/api/books"),

  add: (book: NewBook) => apiFetch<Book>("/api/books", { method: "POST", body: bookBody(book) }),

  /** Sunucu durum alanlarını tutarlı hâle getirebilir; tam kitabı döndürür. */
  update: (bookId: string, updates: BookPatch) =>
    apiFetch<Book>(`/api/books/${enc(bookId)}`, { method: "PATCH", body: bookBody(updates) }),

  remove: (bookId: string) => apiFetch<void>(`/api/books/${enc(bookId)}`, { method: "DELETE" }),

  addQuote: (bookId: string, quote: NewQuote) =>
    apiFetch<Quote>(`/api/books/${enc(bookId)}/quotes`, { method: "POST", body: quote }),

  removeQuote: (bookId: string, quoteId: string) =>
    apiFetch<void>(`/api/books/${enc(bookId)}/quotes/${enc(quoteId)}`, { method: "DELETE" }),
};

export const meApi = {
  get: () => apiFetch<Profile>("/api/me"),
  /** Yalnızca API'deki veriyi siler; Firebase hesabını istemci ayrıca siler. */
  remove: () => apiFetch<void>("/api/me", { method: "DELETE" }),
};

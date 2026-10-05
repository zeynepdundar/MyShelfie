import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { Book, Quote } from "@shelfie/types";

import { apiFetch, isApiEnabled } from "@/lib/api";
import { auth, db } from "@/lib/firebase";

/* ============================================================================
   Kitap verisine erişim — tek kapı
   booksSlice yalnızca bu arayüzü bilir. İki uygulaması var:
     - apiRepo:       apps/api (Postgres) — NEXT_PUBLIC_API_URL tanımlıyken
     - firestoreRepo: users/{uid}/books — eski yol, API yayına alınana kadar
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

function currentUid() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  return user.uid;
}

/** Firestore `undefined` alanları reddediyor; boş opsiyonel alanlar hiç yazılmamalı. */
function withoutUndefined<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined)
  ) as T;
}

const firestoreRepo: BooksRepo = {
  async list() {
    const snapshot = await getDocs(collection(db, "users", currentUid(), "books"));
    return snapshot.docs.map((d) => d.data() as Book);
  },

  async add(bookData) {
    const id = Date.now().toString();
    const book: Book = { ...bookData, id, dateAdded: new Date().toISOString() };
    await setDoc(doc(db, "users", currentUid(), "books", id), withoutUndefined(book));
    return book;
  },

  async update(bookId, updates) {
    await updateDoc(doc(db, "users", currentUid(), "books", bookId), updates);
    return updates;
  },

  async remove(bookId) {
    await deleteDoc(doc(db, "users", currentUid(), "books", bookId));
  },

  async addQuote(bookId, input) {
    const quote: Quote = withoutUndefined({
      ...input,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    });
    // arrayUnion: başka sekmede eklenen alıntıların üstüne yazılmasın
    await updateDoc(doc(db, "users", currentUid(), "books", bookId), {
      quotes: arrayUnion(quote),
    });
    return quote;
  },
};

/** API'nin kitap gövdesinde kabul etmediği, sunucunun yönettiği alanlar. */
function bookBody(book: Partial<Book>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, dateAdded, quotes, ...rest } = book;
  return rest;
}

const apiRepo: BooksRepo = {
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

export const booksRepo: BooksRepo = isApiEnabled ? apiRepo : firestoreRepo;

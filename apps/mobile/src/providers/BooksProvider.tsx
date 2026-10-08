import type { Book, Quote } from "@shelfie/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

import { booksApi, type BookPatch, type NewBook, type NewQuote } from "@/lib/books";
import { useAuth } from "@/providers/AuthProvider";

/* Kitap verisinin tek kaynağı. Web'deki booksSlice'ın karşılığı; mobilde
   Redux yerine küçük bir reducer yeterli. Yazma işlemlerinde sunucunun
   döndürdüğü kitap esas alınır (durum alanlarını sunucu tutarlı hâle getirir). */

type Status = "idle" | "loading" | "ready" | "error";

interface State {
  books: Book[];
  status: Status;
  error: unknown;
  refreshing: boolean;
}

type Action =
  | { type: "reset" }
  | { type: "loading"; refreshing: boolean }
  | { type: "loaded"; books: Book[] }
  | { type: "failed"; error: unknown }
  | { type: "upsert"; book: Book }
  | { type: "removed"; bookId: string }
  | { type: "quoteAdded"; bookId: string; quote: Quote }
  | { type: "quoteRemoved"; bookId: string; quoteId: string };

const initial: State = { books: [], status: "idle", error: null, refreshing: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return initial;
    case "loading":
      return action.refreshing
        ? { ...state, refreshing: true }
        : { ...state, status: state.status === "ready" ? "ready" : "loading", error: null };
    case "loaded":
      return { books: action.books, status: "ready", error: null, refreshing: false };
    case "failed":
      return { ...state, status: state.status === "ready" ? "ready" : "error", error: action.error, refreshing: false };
    case "upsert": {
      const exists = state.books.some((b) => b.id === action.book.id);
      return {
        ...state,
        books: exists
          ? state.books.map((b) => (b.id === action.book.id ? { ...b, ...action.book } : b))
          : [action.book, ...state.books],
      };
    }
    case "removed":
      return { ...state, books: state.books.filter((b) => b.id !== action.bookId) };
    case "quoteAdded":
      return {
        ...state,
        books: state.books.map((b) =>
          b.id === action.bookId ? { ...b, quotes: [action.quote, ...(b.quotes ?? [])] } : b
        ),
      };
    case "quoteRemoved":
      return {
        ...state,
        books: state.books.map((b) =>
          b.id === action.bookId ? { ...b, quotes: (b.quotes ?? []).filter((q) => q.id !== action.quoteId) } : b
        ),
      };
  }
}

interface BooksValue extends State {
  reload: (options?: { refreshing?: boolean }) => Promise<void>;
  getBook: (bookId: string) => Book | undefined;
  addBook: (book: NewBook) => Promise<Book>;
  updateBook: (bookId: string, patch: BookPatch) => Promise<Book>;
  removeBook: (bookId: string) => Promise<void>;
  addQuote: (bookId: string, quote: NewQuote) => Promise<Quote>;
  removeQuote: (bookId: string, quoteId: string) => Promise<void>;
}

const BooksContext = createContext<BooksValue | null>(null);

export function BooksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [state, dispatch] = useReducer(reducer, initial);

  const reload = useCallback(
    async ({ refreshing = false }: { refreshing?: boolean } = {}) => {
      dispatch({ type: "loading", refreshing });
      try {
        dispatch({ type: "loaded", books: await booksApi.list() });
      } catch (error) {
        dispatch({ type: "failed", error });
      }
    },
    []
  );

  // Kullanıcı değişince (giriş/çıkış) liste baştan yüklenir.
  useEffect(() => {
    dispatch({ type: "reset" });
    if (uid) void reload();
  }, [uid, reload]);

  const value = useMemo<BooksValue>(
    () => ({
      ...state,
      reload,
      getBook: (bookId) => state.books.find((b) => b.id === bookId),
      addBook: async (input) => {
        const book = await booksApi.add(input);
        dispatch({ type: "upsert", book });
        return book;
      },
      updateBook: async (bookId, patch) => {
        const book = await booksApi.update(bookId, patch);
        dispatch({ type: "upsert", book });
        return book;
      },
      removeBook: async (bookId) => {
        await booksApi.remove(bookId);
        dispatch({ type: "removed", bookId });
      },
      addQuote: async (bookId, input) => {
        const quote = await booksApi.addQuote(bookId, input);
        dispatch({ type: "quoteAdded", bookId, quote });
        return quote;
      },
      removeQuote: async (bookId, quoteId) => {
        await booksApi.removeQuote(bookId, quoteId);
        dispatch({ type: "quoteRemoved", bookId, quoteId });
      },
    }),
    [state, reload]
  );

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
}

export function useBooks() {
  const value = useContext(BooksContext);
  if (!value) throw new Error("useBooks must be used inside BooksProvider");
  return value;
}

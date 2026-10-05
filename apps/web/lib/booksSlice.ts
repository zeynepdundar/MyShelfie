import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Book, Quote } from "@shelfie/types";

import { booksRepo, type NewBook, type NewQuote } from "@/lib/booksRepo";

/* Tek kaynak: @shelfie/types. Burada tekrar tanımlanmıyor, sadece yeniden ihraç
   ediliyor ki eski importlar çalışmaya devam etsin. */
export type { Book, Quote };

/* Verinin nereden geldiği (API ya da Firestore) lib/booksRepo.ts'de seçilir;
   bu dosya ikisini de aynı şekilde kullanır. */

interface BooksState {
  books: Book[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: BooksState = {
  books: [],
  status: "idle",
  error: null,
};

/* state.error bir hata KODU tutar (ör. "fetchFailed"); metne çeviri arayüzde
   messages/*.json › errors.books altından yapılır. */

/** Thunk gövdesini sarar: hatayı loglar ve verilen kodla reddeder. */
function withErrorCode<Arg, Result>(
  code: string,
  run: (arg: Arg) => Promise<Result>
) {
  return async (arg: Arg, { rejectWithValue }: { rejectWithValue: (v: string) => unknown }) => {
    try {
      return await run(arg);
    } catch (err) {
      console.error("[books]", err);
      return rejectWithValue(code) as never;
    }
  };
}

export const addBook = createAsyncThunk(
  "books/addBook",
  withErrorCode("addFailed", (bookData: NewBook) => booksRepo.add(bookData))
);

export const fetchUserBooks = createAsyncThunk(
  "books/fetchUserBooks",
  withErrorCode("fetchFailed", (_: void) => booksRepo.list())
);

export const updateBook = createAsyncThunk(
  "books/updateBook",
  withErrorCode(
    "updateFailed",
    async ({ bookId, updates }: { bookId: string; updates: Partial<Book> }) => ({
      bookId,
      updates: await booksRepo.update(bookId, updates),
    })
  )
);

export const deleteBook = createAsyncThunk(
  "books/deleteBook",
  withErrorCode("deleteFailed", async (bookId: string) => {
    await booksRepo.remove(bookId);
    return bookId;
  })
);

export const addQuote = createAsyncThunk(
  "books/addQuote",
  withErrorCode(
    "updateFailed",
    async ({ bookId, quote }: { bookId: string; quote: NewQuote }) => ({
      bookId,
      quote: await booksRepo.addQuote(bookId, quote),
    })
  )
);

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    clearBooks(state) {
      state.books = [];
      state.status = "idle";
      state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: BooksState) => {
      state.status = "loading";
      state.error = null;
    };
    const rejected =
      (fallback: string) =>
      (state: BooksState, action: { payload?: unknown }) => {
        state.status = "failed";
        state.error = (action.payload as string) || fallback;
      };

    builder
      .addCase(addBook.pending, pending)
      .addCase(addBook.fulfilled, (state, action) => {
        state.books.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(addBook.rejected, rejected("addFailed"))

      .addCase(fetchUserBooks.pending, pending)
      .addCase(fetchUserBooks.fulfilled, (state, action) => {
        state.books = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchUserBooks.rejected, rejected("fetchFailed"))

      .addCase(updateBook.pending, pending)
      .addCase(updateBook.fulfilled, (state, action) => {
        const { bookId, updates } = action.payload;
        const index = state.books.findIndex((book) => book.id === bookId);
        if (index !== -1) {
          state.books[index] = { ...state.books[index], ...updates };
        }
        state.status = "succeeded";
      })
      .addCase(updateBook.rejected, rejected("updateFailed"))

      .addCase(deleteBook.pending, pending)
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.books = state.books.filter((book) => book.id !== action.payload);
        state.status = "succeeded";
      })
      .addCase(deleteBook.rejected, rejected("deleteFailed"))

      .addCase(addQuote.pending, pending)
      .addCase(addQuote.fulfilled, (state, action) => {
        const { bookId, quote } = action.payload;
        const book = state.books.find((b) => b.id === bookId);
        if (book) book.quotes = [...(book.quotes ?? []), quote];
        state.status = "succeeded";
      })
      .addCase(addQuote.rejected, rejected("updateFailed"));
  },
});

export const { clearBooks, setError } = booksSlice.actions;
export default booksSlice.reducer;

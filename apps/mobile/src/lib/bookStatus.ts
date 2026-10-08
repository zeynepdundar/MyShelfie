import type { Book } from "@shelfie/types";

import type { BookPatch } from "@/lib/books";

/* web › lib/bookStatus.ts ile birebir aynı kural: bitiş tarihi olan kitap
   okunmuştur. Bu dosya ileride @shelfie/types yanına ortak pakete taşınabilir. */

export type BookStatusKey = "completed" | "wantToRead" | "inProgress";

type FinishFields = Pick<Book, "isCompleted" | "endDate" | "dateRead">;

export function isBookFinished(book: FinishFields): boolean {
  return Boolean(book.isCompleted || book.endDate || book.dateRead);
}

export function getBookStatus(book: FinishFields & Pick<Book, "wantToRead">): BookStatusKey {
  if (isBookFinished(book)) return "completed";
  if (book.wantToRead) return "wantToRead";
  return "inProgress";
}

/** Bugünün tarihi "YYYY-MM-DD" (yerel saate göre). */
export function today(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Bir durumu seçmek için API'ye gönderilecek alanlar. */
export function statusPatch(status: BookStatusKey, book: Pick<Book, "startDate">): BookPatch {
  switch (status) {
    case "completed":
      return { isCompleted: true, wantToRead: false, endDate: today() };
    case "wantToRead":
      return { isCompleted: false, wantToRead: true, endDate: null };
    case "inProgress":
      return {
        isCompleted: false,
        wantToRead: false,
        endDate: null,
        startDate: book.startDate ?? today(),
      };
  }
}

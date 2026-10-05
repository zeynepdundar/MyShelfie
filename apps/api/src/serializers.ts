import type { Book as BookDto, Quote as QuoteDto } from "@shelfie/types";

import type { Book, Quote } from "./generated/prisma/client.js";

/**
 * Veritabanı satırlarını web/mobil uygulamanın kullandığı @shelfie/types
 * biçimine çevirir. Böylece istemciler Firestore'dan API'ye geçerken aynı
 * şekli görür:
 *   - createdAt → dateAdded (ISO zaman)
 *   - @db.Date alanları → "YYYY-MM-DD"
 *   - boş (null) isteğe bağlı alanlar JSON'a hiç yazılmaz
 */

const day = (value: Date | null) =>
  value ? value.toISOString().slice(0, 10) : undefined;

const opt = <T>(value: T | null) => value ?? undefined;

export function toQuoteDto(quote: Quote): QuoteDto {
  return {
    id: quote.id,
    text: quote.text,
    page: opt(quote.page),
    notes: opt(quote.notes),
    dateAdded: quote.createdAt.toISOString(),
  };
}

export function toBookDto(book: Book & { quotes?: Quote[] }): BookDto {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    pages: book.pages,
    isbn: opt(book.isbn),
    publishedYear: opt(book.publishedYear),
    genre: opt(book.genre),
    rating: opt(book.rating),
    notes: opt(book.notes),
    coverUrl: opt(book.coverUrl),
    isCompleted: book.isCompleted,
    isFavorite: book.isFavorite,
    wantToRead: book.wantToRead,
    startDate: day(book.startDate),
    endDate: day(book.endDate),
    dateRead: day(book.dateRead) ?? null,
    dateAdded: book.createdAt.toISOString(),
    quotes: (book.quotes ?? []).map(toQuoteDto),
  };
}

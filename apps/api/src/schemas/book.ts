import { z } from "zod";

import { createQuoteSchema } from "./quote.js";

/**
 * Takvim tarihi: "2026-01-31" ya da tam ISO zaman damgası kabul edilir, gün
 * kısmı alınır ve UTC gece yarısı olarak saklanır (@db.Date). null alanı
 * temizler; hiç gönderilmezse dokunulmaz.
 */
const dateField = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((value, ctx) => {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;

    const day = value.slice(0, 10);
    const parsed = new Date(`${day}T00:00:00.000Z`);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(parsed.getTime())) {
      ctx.addIssue({ code: "custom", message: "Geçersiz tarih (YYYY-MM-DD)" });
      return z.NEVER;
    }
    return parsed;
  });

/** İsteğe bağlı metin; boş string ya da null alanı temizler. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value));

const bookFields = {
  title: z.string().trim().min(1, "Kitap adı zorunlu").max(500),
  author: z.string().trim().min(1, "Yazar zorunlu").max(300),
  pages: z.number().int().min(0).max(100_000),
  isbn: optionalText(20),
  publishedYear: z.number().int().min(0).max(3000).nullable().optional(),
  genre: optionalText(100),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  notes: optionalText(10_000),
  coverUrl: z
    .string()
    .trim()
    .url()
    .max(2_000)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  isCompleted: z.boolean(),
  isFavorite: z.boolean(),
  wantToRead: z.boolean(),
  startDate: dateField,
  endDate: dateField,
  dateRead: dateField,
};

export const createBookSchema = z.object({
  ...bookFields,
  pages: bookFields.pages.default(0),
  isCompleted: bookFields.isCompleted.default(false),
  isFavorite: bookFields.isFavorite.default(false),
  wantToRead: bookFields.wantToRead.default(false),
});

/** Güncellemede bütün alanlar isteğe bağlı, ama en az biri gönderilmeli. */
export const updateBookSchema = z
  .object(bookFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Güncellenecek en az bir alan gönderin",
  });

/**
 * Toplu içe aktarma (CSV import, Firestore'dan taşıma). Her kitap kendi
 * alıntılarını ve isteğe bağlı eklenme tarihini taşıyabilir.
 */
export const importBooksSchema = z.object({
  books: z
    .array(
      createBookSchema.extend({
        /** Kitabın eklendiği an; geçersizse yok sayılır, şimdiki zaman kullanılır. */
        dateAdded: z.string().optional(),
        quotes: z.array(createQuoteSchema).max(1_000).default([]),
      }),
    )
    .min(1, "En az bir kitap gönderin")
    .max(2_000, "Tek seferde en fazla 2000 kitap"),
});

export const bookQuerySchema = z.object({
  status: z
    .enum(["all", "completed", "inProgress", "wantToRead"])
    .default("all"),
  favorite: z.enum(["true", "false"]).optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type ImportBooksInput = z.infer<typeof importBooksSchema>;

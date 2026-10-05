import { z } from "zod";

const quoteFields = {
  text: z.string().trim().min(1, "Alıntı metni zorunlu").max(5_000),
  page: z.number().int().min(1).max(100_000).nullable().optional(),
  notes: z
    .string()
    .trim()
    .max(5_000)
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value)),
};

export const createQuoteSchema = z.object(quoteFields);

export const updateQuoteSchema = z
  .object(quoteFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Güncellenecek en az bir alan gönderin",
  });

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;

/** .env › EXPO_PUBLIC_* değerleri derleme anında uygulamaya gömülür. */

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").trim().replace(/\/+$/, "");

export const GOOGLE_BOOKS_API_KEY = (process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY ?? "").trim();

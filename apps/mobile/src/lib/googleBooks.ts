import type { GoogleBook } from "@shelfie/types";

import { GOOGLE_BOOKS_API_KEY } from "@/lib/config";

const ENDPOINT = "https://www.googleapis.com/books/v1/volumes";

/** Google Books anahtarsız isteklere kota vermiyor; anahtar zorunlu. */
export const hasGoogleBooksKey = GOOGLE_BOOKS_API_KEY.length > 0;

const toHttps = (url?: string) => (url ? url.replace(/^http:\/\//, "https://") : undefined);

export async function searchGoogleBooks(query: string, maxResults = 12): Promise<GoogleBook[]> {
  if (!hasGoogleBooksKey) throw new Error("EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY is not set");

  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
    printType: "books",
    key: GOOGLE_BOOKS_API_KEY,
  });

  const response = await fetch(`${ENDPOINT}?${params.toString()}`);
  if (!response.ok) throw new Error(`Google Books ${response.status}`);

  const data = (await response.json()) as { items?: GoogleBook[] };

  return (data.items ?? []).map((item) => ({
    ...item,
    volumeInfo: {
      ...item.volumeInfo,
      imageLinks: item.volumeInfo.imageLinks
        ? { thumbnail: toHttps(item.volumeInfo.imageLinks.thumbnail) }
        : undefined,
    },
  }));
}

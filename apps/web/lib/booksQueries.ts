import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { Book, Quote } from "@shelfie/types";

import { booksRepo, type NewBook, type NewQuote } from "@/lib/booksRepo";
import { useAppSelector } from "@/lib/hooks";
import type { ImportBook } from "@/lib/importCsv";

/* ============================================================================
   Kitap verisi — TanStack Query
   Liste tek bir sorguda durur: ["books", uid]. Değişiklikler (ekle, güncelle,
   sil, alıntı) sunucunun döndürdüğü veriyle önbelleği doğrudan günceller;
   listeyi baştan çekmek gerekmez. Favori/durum gibi küçük güncellemeler
   iyimser (optimistic): ekran hemen değişir, istek başarısız olursa geri alınır.

   Hata kodları eskisiyle aynı (messages/*.json › errors.books):
   fetchFailed, addFailed, updateFailed, deleteFailed.
   ========================================================================== */

export type { Book, Quote };

const EMPTY: Book[] = [];

export const booksKey = (uid: string | null) => ["books", uid] as const;

function useUid() {
  return useAppSelector((state) => state.auth.user?.uid ?? null);
}

function setBooks(
  client: QueryClient,
  uid: string | null,
  update: (books: Book[]) => Book[]
) {
  client.setQueryData<Book[]>(booksKey(uid), (books) => update(books ?? []));
}

/** Oturumdaki kullanıcının kitapları (alıntılarıyla). */
export function useBooks() {
  const uid = useUid();
  const query = useQuery({
    queryKey: booksKey(uid),
    queryFn: () => booksRepo.list(),
    enabled: uid !== null,
  });

  return {
    books: query.data ?? EMPTY,
    /** İlk yükleme: henüz hiç veri yok. Arka plan yenilemelerinde false kalır. */
    isLoading: uid !== null && query.isPending,
    error: query.isError ? ("fetchFailed" as const) : null,
    refetch: query.refetch,
  };
}

export function useAddBook() {
  const uid = useUid();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (book: NewBook) => booksRepo.add(book),
    onSuccess: (book) => setBooks(client, uid, (books) => [...books, book]),
    onError: (error) => console.error("[books] add", error),
  });
}

type UpdateVars = { bookId: string; updates: Partial<Book> };

export function useUpdateBook() {
  const uid = useUid();
  const client = useQueryClient();
  const key = booksKey(uid);

  return useMutation({
    mutationFn: ({ bookId, updates }: UpdateVars) => booksRepo.update(bookId, updates),
    onMutate: async ({ bookId, updates }) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Book[]>(key);
      setBooks(client, uid, (books) =>
        books.map((book) => (book.id === bookId ? { ...book, ...updates } : book))
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      console.error("[books] update", error);
      if (context?.previous) client.setQueryData(key, context.previous);
    },
    // Sunucu durum alanlarını tutarlı hâle getirebilir (bitiş tarihi → okundu);
    // döndürdüğü alanlar iyimser değerin üstüne yazılır.
    onSuccess: (saved, { bookId }) =>
      setBooks(client, uid, (books) =>
        books.map((book) => (book.id === bookId ? { ...book, ...saved } : book))
      ),
  });
}

export function useDeleteBook() {
  const uid = useUid();
  const client = useQueryClient();
  const key = booksKey(uid);

  return useMutation({
    mutationFn: (bookId: string) => booksRepo.remove(bookId),
    onMutate: async (bookId) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Book[]>(key);
      setBooks(client, uid, (books) => books.filter((book) => book.id !== bookId));
      return { previous };
    },
    onError: (error, _bookId, context) => {
      console.error("[books] delete", error);
      if (context?.previous) client.setQueryData(key, context.previous);
    },
  });
}

export function useAddQuote() {
  const uid = useUid();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, quote }: { bookId: string; quote: NewQuote }) =>
      booksRepo.addQuote(bookId, quote),
    onSuccess: (quote, { bookId }) =>
      setBooks(client, uid, (books) =>
        books.map((book) =>
          book.id === bookId ? { ...book, quotes: [...(book.quotes ?? []), quote] } : book
        )
      ),
    onError: (error) => console.error("[books] addQuote", error),
  });
}

/** Toplu ekleme (CSV): bitince liste sunucudan yeniden çekilir. */
export function useImportBooks() {
  const uid = useUid();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (books: ImportBook[]) => booksRepo.importBooks(books),
    onSuccess: () => client.invalidateQueries({ queryKey: booksKey(uid) }),
    onError: (error) => console.error("[books] import", error),
  });
}

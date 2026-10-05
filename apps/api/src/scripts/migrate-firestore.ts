/**
 * Firestore → Postgres taşıma betiği.
 *
 * Canlı MyShelfie verisi şu an Firestore'da: users/{uid}/books/{bookId},
 * alıntılar kitap belgesinin içinde `quotes` dizisi olarak duruyor. Bu betik
 * her kullanıcının kitaplarını ve alıntılarını Postgres'e kopyalar.
 *
 *   pnpm --filter @shelfie/api migrate:firestore -- --dry-run   # yalnızca sayar
 *   pnpm --filter @shelfie/api migrate:firestore                # yazar
 *
 * Gerekenler (apps/api/.env): DATABASE_URL ve FIREBASE_* servis hesabı.
 *
 * Tekrar çalıştırmak güvenli: kimlikler Firestore kimliklerinden türetildiği
 * için aynı kitap ikinci kez eklenmez, güncellenir; alıntıları baştan yazılır.
 * Firestore'daki veriye dokunulmaz (yalnızca okunur).
 */
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { getFirebaseApp } from "../firebase.js";
import { disconnectPrisma, getPrisma } from "../prisma.js";
import { createBookSchema, type CreateBookInput } from "../schemas/book.js";
import { createQuoteSchema, type CreateQuoteInput } from "../schemas/quote.js";
import { normalizeStatus, parseTimestamp } from "../services/books.js";

const dryRun = process.argv.includes("--dry-run");

type FirestoreBook = Record<string, unknown> & {
  quotes?: Array<Record<string, unknown>>;
  dateAdded?: string;
};

/** Firestore kimlikleri (Date.now()) kullanıcılar arasında çakışabilir; uid ile önekle. */
const bookIdFor = (uid: string, docId: string) => `fs_${uid}_${docId}`;
const quoteIdFor = (bookId: string, quoteId: string, index: number) =>
  `${bookId}_q${quoteId || index}`;

/**
 * Eski belgelerde alanlar eksik/yanlış tipte olabilir (ör. pages string).
 * API'nin doğrulama şemasından geçirilir; geçemeyen kitap atlanıp raporlanır.
 */
function toBookInput(raw: FirestoreBook) {
  const pages = Number(raw.pages);
  const rating = raw.rating == null ? undefined : Number(raw.rating);
  const year = raw.publishedYear == null ? undefined : Number(raw.publishedYear);

  return createBookSchema.safeParse({
    ...raw,
    pages: Number.isFinite(pages) && pages >= 0 ? Math.round(pages) : 0,
    rating: rating && rating >= 1 && rating <= 5 ? Math.round(rating) : undefined,
    publishedYear: Number.isFinite(year) ? year : undefined,
    isCompleted: Boolean(raw.isCompleted),
    isFavorite: Boolean(raw.isFavorite),
    wantToRead: Boolean(raw.wantToRead),
    // Firestore'da coverUrl bazen boş string ya da geçersiz olabiliyor
    coverUrl:
      typeof raw.coverUrl === "string" && /^https?:\/\//.test(raw.coverUrl)
        ? raw.coverUrl
        : undefined,
  });
}

function toQuoteInputs(raw: FirestoreBook) {
  const quotes: Array<CreateQuoteInput & { id: string; createdAt?: Date }> = [];

  (raw.quotes ?? []).forEach((quote, index) => {
    const page = Number(quote.page);
    const parsed = createQuoteSchema.safeParse({
      text: quote.text,
      page: Number.isInteger(page) && page >= 1 ? page : undefined,
      notes: typeof quote.notes === "string" ? quote.notes : undefined,
    });
    if (!parsed.success) return;
    quotes.push({
      ...parsed.data,
      id: typeof quote.id === "string" ? quote.id : String(index),
      createdAt: parseTimestamp(
        typeof quote.dateAdded === "string" ? quote.dateAdded : undefined,
      ),
    });
  });

  return quotes;
}

async function main() {
  const firebase = getFirebaseApp();
  const firestore = getFirestore(firebase);
  const auth = getAuth(firebase);
  const prisma = getPrisma();

  // Kullanıcı belgesi olmayıp yalnızca alt koleksiyonu olan uid'ler de gelsin
  // diye listDocuments kullanılıyor.
  const userRefs = await firestore.collection("users").listDocuments();
  console.log(`${userRefs.length} kullanıcı bulundu${dryRun ? " (dry run)" : ""}`);

  const totals = { users: 0, books: 0, quotes: 0, skippedBooks: 0, orphanUsers: 0 };

  for (const userRef of userRefs) {
    const uid = userRef.id;

    // Auth'ta artık olmayan kullanıcının verisi taşınmaz (hesap silinmiş).
    const authUser = await auth.getUser(uid).catch(() => null);
    if (!authUser) {
      totals.orphanUsers++;
      continue;
    }

    const snapshot = await userRef.collection("books").get();
    if (snapshot.empty) continue;

    const books: Array<{ id: string; data: CreateBookInput; createdAt?: Date; quotes: ReturnType<typeof toQuoteInputs> }> = [];

    for (const doc of snapshot.docs) {
      const raw = doc.data() as FirestoreBook;
      const parsed = toBookInput(raw);
      if (!parsed.success) {
        totals.skippedBooks++;
        console.warn(`  atlandı ${uid}/${doc.id}:`, parsed.error.flatten().fieldErrors);
        continue;
      }
      books.push({
        id: bookIdFor(uid, doc.id),
        data: parsed.data,
        createdAt: parseTimestamp(raw.dateAdded),
        quotes: toQuoteInputs(raw),
      });
    }

    totals.users++;
    totals.books += books.length;
    totals.quotes += books.reduce((sum, book) => sum + book.quotes.length, 0);

    if (dryRun) continue;

    const isAnonymous = authUser.providerData.length === 0;

    // Kullanıcı başına tek işlem: yarıda kalırsa o kullanıcı hiç yazılmamış olur.
    await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: uid },
        create: {
          id: uid,
          email: authUser.email ?? null,
          displayName: authUser.displayName ?? null,
          photoUrl: authUser.photoURL ?? null,
          isAnonymous,
          createdAt: parseTimestamp(authUser.metadata.creationTime),
        },
        update: {},
      });

      for (const book of books) {
        const fields = { ...book.data, ...normalizeStatus(book.data) };

        await tx.book.upsert({
          where: { id: book.id },
          create: {
            ...fields,
            id: book.id,
            userId: uid,
            ...(book.createdAt ? { createdAt: book.createdAt } : {}),
          },
          update: fields,
        });

        await tx.quote.deleteMany({ where: { bookId: book.id } });
        if (book.quotes.length > 0) {
          await tx.quote.createMany({
            data: book.quotes.map(({ id, createdAt, ...quote }, index) => ({
              ...quote,
              id: quoteIdFor(book.id, id, index),
              bookId: book.id,
              ...(createdAt ? { createdAt } : {}),
            })),
          });
        }
      }
    }, { timeout: 60_000 });

    console.log(`  ✓ ${uid}: ${books.length} kitap`);
  }

  console.log(
    `\nBitti${dryRun ? " (dry run — hiçbir şey yazılmadı)" : ""}: ` +
      `${totals.users} kullanıcı, ${totals.books} kitap, ${totals.quotes} alıntı. ` +
      `Atlanan kitap: ${totals.skippedBooks}, Auth'ta olmayan kullanıcı: ${totals.orphanUsers}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => disconnectPrisma());

import { Router } from "express";

import { currentUser } from "../middleware/auth.js";
import { param } from "../middleware/params.js";
import { parseBody, parseQuery, requireJson } from "../middleware/validate.js";
import { notFound } from "../http-error.js";
import { getPrisma } from "../prisma.js";
import {
  bookQuerySchema,
  createBookSchema,
  importBooksSchema,
  updateBookSchema,
} from "../schemas/book.js";
import { toBookDto } from "../serializers.js";
import {
  normalizeStatus,
  parseTimestamp,
  statusWhere,
} from "../services/books.js";
import { ensureUser } from "../services/users.js";
import { quotesRouter } from "./quotes.js";

export const booksRouter = Router();

/** Kitap yalnızca sahibine görünür; her sorgu userId ile daraltılır. */
const ownedBook = (userId: string, bookId: string) => ({ id: bookId, userId });

const withQuotes = { quotes: { orderBy: { createdAt: "desc" } } } as const;

booksRouter.get("/", async (req, res) => {
  const user = currentUser(req);
  const query = parseQuery(bookQuerySchema, req);

  const books = await getPrisma().book.findMany({
    where: {
      userId: user.uid,
      ...statusWhere(query.status),
      ...(query.favorite ? { isFavorite: query.favorite === "true" } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: withQuotes,
  });

  res.json(books.map(toBookDto));
});

booksRouter.post("/", requireJson, async (req, res) => {
  const user = currentUser(req);
  const data = parseBody(createBookSchema, req);

  await ensureUser(user);

  const book = await getPrisma().book.create({
    data: { ...data, ...normalizeStatus(data), userId: user.uid },
    include: withQuotes,
  });

  res.status(201).json(toBookDto(book));
});

/**
 * Toplu içe aktarma: CSV import ve Firestore'dan taşıma için.
 * Hepsi tek işlemde yazılır — biri hatalıysa hiçbiri eklenmez.
 */
booksRouter.post("/import", requireJson, async (req, res) => {
  const user = currentUser(req);
  const { books } = parseBody(importBooksSchema, req);
  const prisma = getPrisma();

  await ensureUser(user);

  const created = await prisma.$transaction(
    books.map(({ quotes, dateAdded, ...data }) => {
      const createdAt = parseTimestamp(dateAdded);
      return prisma.book.create({
        data: {
          ...data,
          ...normalizeStatus(data),
          ...(createdAt ? { createdAt } : {}),
          userId: user.uid,
          quotes: { create: quotes },
        },
        select: { id: true },
      });
    }),
  );

  res.status(201).json({ imported: created.length });
});

booksRouter.get("/:bookId", async (req, res) => {
  const user = currentUser(req);

  const book = await getPrisma().book.findFirst({
    where: ownedBook(user.uid, param(req, "bookId")),
    include: withQuotes,
  });

  if (!book) throw notFound("Kitap bulunamadı");

  res.json(toBookDto(book));
});

booksRouter.patch("/:bookId", requireJson, async (req, res) => {
  const user = currentUser(req);
  const bookId = param(req, "bookId");
  const data = parseBody(updateBookSchema, req);
  const prisma = getPrisma();

  const existing = await prisma.book.findFirst({
    where: ownedBook(user.uid, bookId),
    select: { isCompleted: true, wantToRead: true, endDate: true, dateRead: true },
  });

  if (!existing) throw notFound("Kitap bulunamadı");

  // Durum alanlarına dokunulmuyorsa (ör. yalnızca favori) normalize etmeye gerek yok.
  const touchesStatus = ["isCompleted", "wantToRead", "endDate", "dateRead"].some(
    (key) => key in data,
  );

  const book = await prisma.book.update({
    where: { id: bookId },
    data: touchesStatus ? { ...data, ...normalizeStatus(data, existing) } : data,
    include: withQuotes,
  });

  res.json(toBookDto(book));
});

booksRouter.delete("/:bookId", async (req, res) => {
  const user = currentUser(req);

  const { count } = await getPrisma().book.deleteMany({
    where: ownedBook(user.uid, param(req, "bookId")),
  });

  if (count === 0) throw notFound("Kitap bulunamadı");

  res.status(204).end();
});

// /api/books/:bookId/quotes
booksRouter.use("/:bookId/quotes", quotesRouter);

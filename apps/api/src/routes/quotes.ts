import { Router } from "express";

import { currentUser } from "../middleware/auth.js";
import { param } from "../middleware/params.js";
import { parseBody, requireJson } from "../middleware/validate.js";
import { notFound } from "../http-error.js";
import { getPrisma } from "../prisma.js";
import { createQuoteSchema, updateQuoteSchema } from "../schemas/quote.js";
import { toQuoteDto } from "../serializers.js";

/** mergeParams: üst router'daki :bookId buraya taşınsın diye. */
export const quotesRouter = Router({ mergeParams: true });

/** Alıntıya erişmeden önce kitabın gerçekten bu kullanıcıya ait olduğunu doğrular. */
async function assertBookOwnership(userId: string, bookId: string) {
  const book = await getPrisma().book.findFirst({
    where: { id: bookId, userId },
    select: { id: true },
  });

  if (!book) throw notFound("Kitap bulunamadı");
  return book.id;
}

quotesRouter.get("/", async (req, res) => {
  const user = currentUser(req);
  const bookId = await assertBookOwnership(user.uid, param(req, "bookId"));

  const quotes = await getPrisma().quote.findMany({
    where: { bookId },
    orderBy: { createdAt: "desc" },
  });

  res.json(quotes.map(toQuoteDto));
});

quotesRouter.post("/", requireJson, async (req, res) => {
  const user = currentUser(req);
  const bookId = await assertBookOwnership(user.uid, param(req, "bookId"));
  const data = parseBody(createQuoteSchema, req);

  const quote = await getPrisma().quote.create({ data: { ...data, bookId } });

  res.status(201).json(toQuoteDto(quote));
});

quotesRouter.patch("/:quoteId", requireJson, async (req, res) => {
  const user = currentUser(req);
  const bookId = await assertBookOwnership(user.uid, param(req, "bookId"));
  const quoteId = param(req, "quoteId");
  const data = parseBody(updateQuoteSchema, req);
  const prisma = getPrisma();

  // Alıntının bu kitaba ait olduğu aynı sorguda kontrol ediliyor.
  const { count } = await prisma.quote.updateMany({
    where: { id: quoteId, bookId },
    data,
  });

  if (count === 0) throw notFound("Alıntı bulunamadı");

  const quote = await prisma.quote.findUniqueOrThrow({ where: { id: quoteId } });

  res.json(toQuoteDto(quote));
});

quotesRouter.delete("/:quoteId", async (req, res) => {
  const user = currentUser(req);
  const bookId = await assertBookOwnership(user.uid, param(req, "bookId"));

  const { count } = await getPrisma().quote.deleteMany({
    where: { id: param(req, "quoteId"), bookId },
  });

  if (count === 0) throw notFound("Alıntı bulunamadı");

  res.status(204).end();
});

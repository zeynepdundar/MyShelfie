import { Router } from "express";

import { currentUser } from "../middleware/auth.js";
import { getPrisma } from "../prisma.js";
import { toBookDto } from "../serializers.js";
import { statusWhere } from "../services/books.js";
import { ensureUser } from "../services/users.js";

/** Oturumdaki kullanıcının hesabı: profil, veri dışa aktarma, silme. */
export const meRouter = Router();

meRouter.get("/", async (req, res) => {
  const user = currentUser(req);
  const prisma = getPrisma();

  await ensureUser(user);

  const [profile, books, completed, quotes] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.uid } }),
    prisma.book.count({ where: { userId: user.uid } }),
    prisma.book.count({ where: { userId: user.uid, ...statusWhere("completed") } }),
    prisma.quote.count({ where: { book: { userId: user.uid } } }),
  ]);

  res.json({
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
    photoUrl: profile.photoUrl,
    isAnonymous: profile.isAnonymous,
    createdAt: profile.createdAt.toISOString(),
    counts: { books, completed, quotes },
  });
});

/**
 * Kullanıcının bütün verisi tek JSON'da (KVKK/GDPR veri taşınabilirliği).
 * Biçim web'deki lib/accountData.ts › downloadUserData ile aynı.
 */
meRouter.get("/export", async (req, res) => {
  const user = currentUser(req);

  const books = await getPrisma().book.findMany({
    where: { userId: user.uid },
    orderBy: { createdAt: "asc" },
    include: { quotes: { orderBy: { createdAt: "asc" } } },
  });

  const date = new Date().toISOString().slice(0, 10);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="myshelfie-data-${date}.json"`,
  );
  res.json({
    app: "MyShelfie",
    exportedAt: new Date().toISOString(),
    account: {
      email: user.email,
      displayName: user.displayName,
      isAnonymous: user.isAnonymous,
    },
    books: books.map(toBookDto),
  });
});

/**
 * Kullanıcının veritabanındaki her şeyini siler (kitaplar ve alıntılar
 * cascade ile gider). Firebase Auth hesabını istemci siler — yeniden kimlik
 * doğrulama orada yapılıyor. Tekrar çağrılması zararsız: her zaman 204.
 */
meRouter.delete("/", async (req, res) => {
  const user = currentUser(req);

  await getPrisma().user.deleteMany({ where: { id: user.uid } });

  res.status(204).end();
});

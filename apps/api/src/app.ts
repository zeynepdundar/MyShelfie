import express, { type Express } from "express";
import cors from "cors";

import { env } from "./env.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { healthRouter } from "./routes/health.js";
import { booksRouter } from "./routes/books.js";
import { meRouter } from "./routes/me.js";

/**
 * Uygulamayı kurar ama dinlemeye başlamaz — testlerde de aynı örnek kullanılır.
 * Veritabanı ve Firebase bağlantıları tembel olduğu için burada hiçbir dış
 * servise bağlanılmaz.
 */
export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  // Barındırma ortamı (Render, Fly, Railway…) bir proxy arkasında çalıştırır.
  if (env.isProduction) app.set("trust proxy", 1);

  app.use(cors({ origin: env.corsOrigins }));
  // Toplu içe aktarma (2000 kitap + alıntılar) için 1 MB dar kalıyordu.
  app.use(express.json({ limit: "5mb" }));

  app.use(healthRouter);
  app.use("/api/me", requireAuth, meRouter);
  app.use("/api/books", requireAuth, booksRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

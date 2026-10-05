import type { NextFunction, Request, Response } from "express";

import { env } from "../env.js";
import { HttpError } from "../http-error.js";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: "NotFound",
    message: `${req.method} ${req.originalUrl} bulunamadı`,
  });
}

/** express.json() hataları: bozuk JSON, çok büyük gövde. */
function bodyParserError(error: unknown): HttpError | undefined {
  if (typeof error !== "object" || !error || !("type" in error)) return;
  const type = (error as { type: unknown }).type;
  if (type === "entity.parse.failed") return new HttpError(400, "Gövde geçerli JSON değil");
  if (type === "entity.too.large") return new HttpError(413, "İstek gövdesi çok büyük");
}

/** Bilinen Prisma hataları: kayıt yok (P2025), veritabanına ulaşılamıyor (P1001). */
function prismaError(error: unknown): HttpError | undefined {
  if (typeof error !== "object" || !error || !("code" in error)) return;
  const code = (error as { code: unknown }).code;
  if (code === "P2025") return new HttpError(404, "Kayıt bulunamadı");
  if (code === "P1001") return new HttpError(503, "Veritabanına şu an ulaşılamıyor");
}

/**
 * Tek hata çıkışı. Express 5 async handler'ların reddini buraya taşıdığı için
 * handler'larda try/catch gerekmez.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const known =
    error instanceof HttpError
      ? error
      : (bodyParserError(error) ?? prismaError(error));

  if (known) {
    res.status(known.status).json({
      error: known.status >= 500 ? "ServiceUnavailable" : "HttpError",
      message: known.message,
      ...(known.details ? { details: known.details } : {}),
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    error: "InternalServerError",
    message: "Beklenmeyen bir hata oluştu",
    ...(env.isProduction
      ? {}
      : { detail: error instanceof Error ? error.message : String(error) }),
  });
}

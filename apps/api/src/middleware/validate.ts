import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodTypeAny, type z } from "zod";

import { badRequest } from "../http-error.js";

function parseWith<T extends ZodTypeAny>(
  schema: T,
  value: unknown,
  message: string,
): z.infer<T> {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      const flat = error.flatten();
      throw badRequest(message, {
        ...flat.fieldErrors,
        ...(flat.formErrors.length ? { _: flat.formErrors } : {}),
      });
    }
    throw error;
  }
}

/** Gövde doğrulaması; hata durumunda 400 ve alan listesi döner. */
export const parseBody = <T extends ZodTypeAny>(schema: T, req: Request) =>
  parseWith(schema, req.body, "Geçersiz istek gövdesi");

/** Sorgu dizesi (?status=...) doğrulaması. */
export const parseQuery = <T extends ZodTypeAny>(schema: T, req: Request) =>
  parseWith(schema, req.query, "Geçersiz sorgu parametresi");

/** Gövdesi olan uçlarda JSON gelmediğinde anlaşılır hata verir. */
export function requireJson(req: Request, _res: Response, next: NextFunction) {
  if (!req.is("application/json")) {
    return next(badRequest("İstek gövdesi application/json olmalı"));
  }
  next();
}

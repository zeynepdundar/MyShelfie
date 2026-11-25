import { Router } from "express";
import { z } from "zod";

import { findByIsbn, searchCatalog } from "../catalog/search.js";
import { parseQuery } from "../middleware/validate.js";
import { param } from "../middleware/params.js";

/** Open Library'den üretilen kitap kataloğunda arama (Google Books yerine). */
export const catalogRouter = Router();

const searchQuerySchema = z.object({
  q: z.string().trim().min(2).max(200),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

catalogRouter.get("/search", async (req, res) => {
  const { q, limit } = parseQuery(searchQuerySchema, req);
  res.set("Cache-Control", "private, max-age=300");
  res.json(await searchCatalog(q, limit));
});

catalogRouter.get("/isbn/:isbn", async (req, res) => {
  res.set("Cache-Control", "private, max-age=3600");
  res.json(await findByIsbn(param(req, "isbn")));
});

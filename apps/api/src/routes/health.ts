import { Router } from "express";

import { hasDatabase, hasFirebaseCredentials, env } from "../env.js";
import { pingDatabase } from "../prisma.js";

export const healthRouter = Router();

/**
 * Kimlik doğrulaması istemez; hangi bağımlılığın hazır olduğunu da söyler.
 * Veritabanı yapılandırılmış ama ulaşılamıyorsa 503 döner ki barındırma
 * ortamının sağlık kontrolü bunu fark etsin.
 */
healthRouter.get("/health", async (_req, res) => {
  const database = !hasDatabase
    ? "missing"
    : (await pingDatabase())
      ? "ok"
      : "unreachable";

  res.status(database === "unreachable" ? 503 : 200).json({
    status: database === "unreachable" ? "degraded" : "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    dependencies: {
      database,
      firebase: hasFirebaseCredentials
        ? "configured"
        : env.devUserId
          ? "bypassed (DEV_USER_ID)"
          : "missing",
    },
  });
});

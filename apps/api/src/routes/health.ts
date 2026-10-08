import { Router } from "express";

import { hasDatabase, hasFirebaseCredentials, env } from "../env.js";
import { databaseHost, pingDatabase } from "../prisma.js";

export const healthRouter = Router();

/** Kök adres: tarayıcıda açılınca 404 yerine ne olduğunu söylesin. */
healthRouter.get("/", (_req, res) => {
  res.json({
    name: "MyShelfie API",
    status: "ok",
    health: "/health",
  });
});

/** Boş olan Firebase değişkenlerinin adları (değerleri değil). */
function missingFirebaseVars() {
  return Object.entries({
    FIREBASE_PROJECT_ID: env.firebase.projectId,
    FIREBASE_CLIENT_EMAIL: env.firebase.clientEmail,
    FIREBASE_PRIVATE_KEY: env.firebase.privateKey,
  })
    .filter(([, value]) => !value)
    .map(([name]) => name);
}

/**
 * Kimlik doğrulaması istemez; hangi bağımlılığın hazır olduğunu ve değilse
 * nedenini söyler (gizli değer döndürmeden). Veritabanı yapılandırılmış ama
 * ulaşılamıyorsa 503 döner ki barındırma ortamının sağlık kontrolü fark etsin.
 */
healthRouter.get("/health", async (_req, res) => {
  const ping = hasDatabase ? await pingDatabase() : null;
  const database = !hasDatabase ? "missing" : ping?.ok ? "ok" : "unreachable";

  const firebase = hasFirebaseCredentials
    ? "configured"
    : env.devUserId
      ? "bypassed (DEV_USER_ID)"
      : "missing";

  res.status(database === "unreachable" ? 503 : 200).json({
    status: database === "unreachable" ? "degraded" : "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    dependencies: {
      database,
      firebase,
    },
    ...(database !== "ok" || firebase === "missing"
      ? {
          diagnostics: {
            ...(hasDatabase ? { databaseHost: databaseHost() } : {}),
            ...(ping && !ping.ok ? { databaseError: ping.reason } : {}),
            ...(firebase === "missing"
              ? { missingFirebaseVars: missingFirebaseVars() }
              : {}),
          },
        }
      : {}),
  });
});

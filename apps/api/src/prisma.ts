import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/prisma/client.js";
import { env, hasDatabase } from "./env.js";
import { serviceUnavailable } from "./http-error.js";

/**
 * Prisma istemcisi ilk kullanımda kurulur. Böylece DATABASE_URL yokken de
 * sunucu açılır; yalnızca veritabanına dokunan istekler 503 döner.
 *
 * Prisma 7 Rust motoru kullanmıyor; Postgres'e `pg` sürücüsüyle
 * @prisma/adapter-pg üzerinden bağlanıyor.
 *
 * Geliştirmede tsx watch her değişiklikte modülü yeniden yüklediği için
 * istemci globalThis üzerinde saklanır, yoksa bağlantı havuzu çoğalır.
 */
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

let client: PrismaClient | undefined = globalForPrisma.prisma;

export function getPrisma(): PrismaClient {
  if (!hasDatabase) {
    throw serviceUnavailable(
      "Veritabanı yapılandırılmamış. apps/api/.env içinde DATABASE_URL tanımlayın.",
    );
  }

  if (!client) {
    client = new PrismaClient({
      adapter: new PrismaPg({ connectionString: env.databaseUrl }),
      log: env.isProduction ? ["error"] : ["warn", "error"],
    });
    if (!env.isProduction) globalForPrisma.prisma = client;
  }

  return client;
}

/** Bağlantı adresindeki sunucu adı (parola/kullanıcı olmadan) — teşhis için. */
export function databaseHost(): string | null {
  try {
    return new URL(env.databaseUrl).hostname || null;
  } catch {
    return null;
  }
}

/**
 * /health için: veritabanına gerçekten ulaşılabiliyor mu? Ulaşılamıyorsa
 * sebebi kısa bir kodla döner (ENOTFOUND, ECONNREFUSED, 28P01 = yanlış
 * parola…); tam hata sunucu loglarına yazılır. Adres/parola dönmez.
 */
export async function pingDatabase(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  if (!hasDatabase) return { ok: false, reason: "DATABASE_URL tanımlı değil" };
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (error) {
    console.error("[health] veritabanı bağlantısı başarısız:", error);
    const e = error as { code?: unknown; cause?: { code?: unknown }; message?: unknown };
    const code = e?.cause?.code ?? e?.code;
    const message = String(e?.message ?? error)
      .replace(/postgres(ql)?:\/\/[^\s"']+/gi, "<url>")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .pop()
      ?.slice(0, 200);
    return { ok: false, reason: [code, message].filter(Boolean).join(": ") };
  }
}

export async function disconnectPrisma() {
  await client?.$disconnect();
  client = undefined;
  globalForPrisma.prisma = undefined;
}

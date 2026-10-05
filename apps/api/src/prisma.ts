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

/** /health için: veritabanına gerçekten ulaşılabiliyor mu? */
export async function pingDatabase(): Promise<boolean> {
  if (!hasDatabase) return false;
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function disconnectPrisma() {
  await client?.$disconnect();
  client = undefined;
  globalForPrisma.prisma = undefined;
}

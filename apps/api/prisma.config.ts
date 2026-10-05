import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI ayarları. Prisma 7'den itibaren bağlantı adresi şemada değil
 * burada; .env'i de CLI kendisi okumadığı için dotenv yukarıda yükleniyor.
 *
 * Neon iki adres verir: DATABASE_URL (pooler, uygulama için) ve
 * DATABASE_URL_UNPOOLED (doğrudan bağlantı). Migration'lar pooler üzerinden
 * güvenilir çalışmadığı için varsa doğrudan adres kullanılır. Yerelde yalnızca
 * DATABASE_URL vardır.
 *
 * Adres yoksa boş bırakılır: `prisma generate` veritabanı olmadan
 * çalışabilsin (CI, ilk kurulum). migrate/studio komutları zaten adres ister.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "",
  },
});

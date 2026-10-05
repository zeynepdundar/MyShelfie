# MyShelfie

Okuma takip uygulaması. Monorepo olarak pnpm workspaces ile yönetiliyor.

```
apps/
  web/        Next.js 15 uygulaması (mevcut arayüz)
  api/        Node.js backend — Express + TypeScript, Prisma 7 + PostgreSQL
  mobile/     Expo uygulaması (henüz kurulmadı)
packages/
  types/      Book, Quote, GoogleBook — üç uygulamanın paylaştığı tipler
```

## Kurulum

```bash
pnpm install          # kökten, bütün workspace'ler için
```

## Veritabanı

```bash
docker compose up -d                    # yerel Postgres 16
cp apps/api/.env.example apps/api/.env
pnpm --filter @shelfie/api db:migrate   # tabloları oluşturur
```

Ayrıntılar: `apps/api/README.md`.

## Çalıştırma

```bash
pnpm dev:web          # Next.js — http://localhost:3000
pnpm dev:api          # Express  — http://localhost:4000

pnpm build            # bütün paketleri derler
pnpm typecheck        # bütün paketleri tip kontrolünden geçirir
```

Tek bir workspace'e komut göndermek için:

```bash
pnpm --filter @shelfie/web <komut>
```

## Notlar

- Paylaşılan tipler `@shelfie/types` paketinden gelir. Paket derlenmiş çıktı
  değil doğrudan TypeScript kaynağı yayınlar; içinde çalışma zamanı kodu
  olmadığı için Next ve Node bunu ek ayar olmadan kullanabiliyor. İleride
  pakete çalışma zamanı kodu girerse web tarafında `transpilePackages`
  gerekecek.
- `.npmrc` içindeki `node-linker=hoisted`, Expo/React Native'in sembolik
  linklerle sorun yaşamaması için baştan ayarlandı.

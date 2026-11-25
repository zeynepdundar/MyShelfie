# @shelfie/api

MyShelfie'nin backend'i. Express 5 + TypeScript, veri katmanı Prisma 7 +
PostgreSQL, kimlik doğrulama Firebase ID token'ları üzerinden.

## İlk kurulum

```bash
pnpm install                                  # repo kökünde; Prisma istemcisini de üretir
cp apps/api/.env.example apps/api/.env
docker compose up -d                          # repo kökünde, yerel Postgres 16
pnpm --filter @shelfie/api db:migrate         # tabloları oluşturur
pnpm dev:api                                  # http://localhost:4000
```

`curl localhost:4000/health` → `"database": "ok"` görmelisiniz.

Sunucu veritabanı ve Firebase kimlik bilgileri **olmadan da açılır**. Prisma
istemcisi ve Firebase uygulaması ilk kullanımda kurulur; eksik yapılandırma
sunucuyu düşürmez, yalnızca ilgili istek `503` döner.

## Veritabanı

Şema `prisma/schema.prisma`, bağlantı ayarı `prisma.config.ts` içinde
(Prisma 7 adresi şemada tutmuyor). Prisma 7 Rust motoru kullanmaz; Postgres'e
`pg` sürücüsüyle `@prisma/adapter-pg` üzerinden bağlanır. Üretilen istemci
`src/generated/prisma` altına yazılır ve git'e girmez.

| Tablo | İçerik |
| --- | --- |
| `users` | `id` = Firebase uid. E-posta, ad, fotoğraf, misafir mi |
| `books` | Kitap, okuma tarihleri, durum bayrakları, favori, not, kapak |
| `quotes` | Kitaba bağlı alıntılar (sayfa, not) |

Kullanıcı silinince kitapları, kitap silinince alıntıları da silinir
(`onDelete: Cascade`).

```bash
pnpm --filter @shelfie/api db:migrate   # şema değiştiyse yeni migration üretir ve uygular
pnpm --filter @shelfie/api db:deploy    # üretimde: bekleyen migration'ları uygular
pnpm --filter @shelfie/api db:studio    # tabloları tarayıcıda gör
pnpm --filter @shelfie/api db:reset     # yerel veritabanını sıfırla
```

### Durum kuralı

Web'deki `lib/bookStatus.ts` ile aynı: **bitiş tarihi olan kitap okunmuştur.**
API yazarken bayrakları buna göre tutarlı hâle getirir (`src/services/books.ts`):

- `endDate` gönderilirse `isCompleted = true`, `wantToRead = false`, `dateRead = endDate`
- `isCompleted: false` gönderilip tarih gönderilmezse bitiş tarihi temizlenir
- `dateRead` eski alan; `endDate` ile hep aynı tutulur

## Kimlik doğrulama

Her `/api/*` isteği `Authorization: Bearer <firebase id token>` bekler
(web'de `await auth.currentUser.getIdToken()`). Token doğrulanır, `req.user`
doldurulur ve bütün sorgular `userId` ile daraltılır — bir kullanıcı
başkasının kaydını göremez. Süresi dolan token `401` döner; istemci token'ı
yenileyip tekrar dener. Misafir (anonymous) hesaplar da çalışır; Google ya da
e-posta bağlandığında uid değişmediği için veriler aynen kalır.

Yerel geliştirmede servis hesabı olmadan denemek için `.env` içinde
`DEV_USER_ID=test-user` yeterli; token aranmaz. `NODE_ENV=production` iken bu
ayar yok sayılır.

## Uçlar

| Metot | Yol | Açıklama |
| --- | --- | --- |
| GET | `/health` | Durum; veritabanına gerçekten bağlanıp bakar (auth istemez) |
| GET | `/api/me` | Profil + sayılar (kitap, okunan, alıntı) |
| GET | `/api/me/export` | Bütün veri tek JSON dosyası olarak |
| DELETE | `/api/me` | Kullanıcının bütün verisini siler (Firebase hesabını istemci siler) |
| GET | `/api/books` | Kitaplar, alıntılarıyla. `?status=all\|completed\|inProgress\|wantToRead`, `?favorite=true\|false` |
| POST | `/api/books` | Kitap ekler |
| POST | `/api/books/import` | Toplu ekleme (CSV import): `{ books: [...] }`, en fazla 2000, hepsi ya da hiçbiri |
| GET | `/api/books/:bookId` | Tek kitap |
| PATCH | `/api/books/:bookId` | Kitabı günceller |
| DELETE | `/api/books/:bookId` | Kitabı siler |
| GET | `/api/catalog/search?q=…&limit=8` | Kitap kataloğunda başlık/yazar/ISBN araması (en fazla 20) |
| GET | `/api/catalog/isbn/:isbn` | ISBN-10 ya da 13 ile katalog kaydı |
| GET | `/api/books/:bookId/quotes` | Alıntılar |
| POST | `/api/books/:bookId/quotes` | Alıntı ekler |
| PATCH | `/api/books/:bookId/quotes/:quoteId` | Alıntıyı günceller |
| DELETE | `/api/books/:bookId/quotes/:quoteId` | Alıntıyı siler |

Yanıtlar `@shelfie/types` biçimindedir (`dateAdded`, tarihler `YYYY-MM-DD`),
yani web'deki `Book`/`Quote` tipleriyle birebir aynı şekil. Gövdeler zod ile
doğrulanır; hatalı istek `400` ve alan bazlı hata listesi döner:

```json
{ "error": "HttpError", "message": "Geçersiz istek gövdesi",
  "details": { "title": ["Kitap adı zorunlu"] } }
```

## Firestore'dan taşıma

Canlı veri şu an Firestore'da (`users/{uid}/books`, alıntılar kitap
belgesinin içinde). `.env`'de `DATABASE_URL` ve `FIREBASE_*` tanımlıyken:

```bash
pnpm --filter @shelfie/api migrate:firestore -- --dry-run   # yalnızca sayar
pnpm --filter @shelfie/api migrate:firestore                # kopyalar
```

Firestore'a yazmaz, yalnızca okur. Tekrar çalıştırmak güvenli: kimlikler
Firestore kimliklerinden türetildiği için kitaplar çoğalmaz. Auth'ta artık
olmayan kullanıcıların verisi taşınmaz.

## Durum

Web uygulaması kitap verisini hâlâ doğrudan Firestore'dan okuyor. Sıradaki
adım `booksSlice` ve `accountData`'yı bu uçlara bağlamak, ardından API'yi ve
veritabanını bir barındırma ortamına almak.

## Kitap kataloğu (Open Library)

Kitap eklerken yapılan arama Google Books yerine kendi kataloğumuzdan gelir
(`/api/catalog`). Katalog, Open Library'nin aylık ücretsiz (CC0) dump'larından
üretilir: Türkçe ve İngilizce, ISBN'li baskılar, her eser + dil için tek kayıt.
Türkçe kayıtların hepsi, İngilizceler Open Library'de en çok okunan/puanlanan
eserden başlayarak varsayılan 750 bin kayda kadar alınır.

Dump'ları indirmeden geliştirme için repoda gerçek Open Library verisinden
~700 kitaplık bir örnek var (`catalog-sample/`, ~390 TR + ~320 EN, en çok
okunanlar ve klasik Türk yazarları):

```bash
pnpm --filter @shelfie/api catalog:load:sample   # yerel DATABASE_URL'e catalog_books kurar
```

Tam katalog:

```bash
pnpm --filter @shelfie/api catalog:download   # ~13 GB, apps/api/data/openlibrary (git'e girmez)
pnpm --filter @shelfie/api catalog:build      # → data/catalog.tsv.gz (20-40 dk, ~4 GB RAM)
pnpm --filter @shelfie/api catalog:load       # → CATALOG_DATABASE_URL'deki catalog_books tablosu
```

- **Ayrı veritabanı:** Neon free planında proje başına 1 GB sınır var ve dolunca
  yazma durur. Katalog bu yüzden ayrı bir Neon projesinde durur:
  `CATALOG_DATABASE_URL` (ve yükleme için `CATALOG_DATABASE_URL_UNPOOLED`).
  Yerelde boş bırakılırsa `DATABASE_URL` kullanılır. Render'a da
  `CATALOG_DATABASE_URL` eklenmeli.
- **Boyut:** satır başına ~450 B (tablo + indeks); 750k ≈ 350 MB.
  `catalog:build -- --limit 500000` ile küçültülebilir.
- **Yenileme:** komutlar aylık tekrar çalıştırılabilir. Yükleme yeni tabloyu
  hazırlayıp tek transaction'da değiştirir, arama kesilmez. O sırada iki tablo
  birden yer kapladığı için depolama yetmezse `catalog:load -- --drop-first`.
- **Arama:** `pg_trgm` kelime benzerliği; metin `foldForSearch` ile katlanır
  (İ/ı/ş/ğ/ç/ö/ü farkı yok, "kurk mantolu" → Kürk Mantolu Madonna). 10/13
  haneli sorgular ISBN olarak aranır.
- **Kapaklar:** `covers.openlibrary.org/b/id/{cover_id}-M.jpg`. Görseller
  Open Library'den gelir, veritabanında yalnızca kapak numarası durur.

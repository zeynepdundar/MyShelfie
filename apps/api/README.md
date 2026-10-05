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

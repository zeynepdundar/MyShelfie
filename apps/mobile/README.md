# @shelfie/mobile

MyShelfie'nin iOS/Android uygulaması — Expo SDK 57 + React Native 0.86,
gezinme Expo Router ile. Veri her zaman `apps/api` üzerinden gelir (mobilde
Firestore yolu yok); giriş web ile aynı Firebase projesi (shelfie-7bb6c).

## Çalıştırma

```bash
pnpm install                          # repo kökünde
cp apps/mobile/.env.example apps/mobile/.env
# .env içinde EXPO_PUBLIC_API_URL ve EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY'i doldur
pnpm dev:mobile                       # = pnpm --filter @shelfie/mobile start
```

Terminaldeki QR kodu telefondaki **Expo Go** ile okut (Expo Go'nun SDK 57
sürümü olmalı). Simülatör için Expo açıkken `i` (iOS) ya da `a` (Android).

API'yi yerelde denerken telefon `localhost`a ulaşamaz; bilgisayarın yerel
ağ IP'sini yaz (`http://192.168.x.x:4000`). Canlı API için Render adresi.

## Yapı

```
src/
  app/                 Expo Router ekranları (her dosya bir ekran)
    _layout.tsx        fontlar, sağlayıcılar, giriş korumalı Stack
    welcome.tsx        karşılama: misafir başla / e-posta
    sign-in.tsx        e-posta ile giriş-kayıt (modal)
    link-account.tsx   misafir hesabı e-postaya bağla (modal)
    (tabs)/            Kütüphane · Hazinem · Hesabım
    book/[id].tsx      kitap detayı: durum, favori, puan, alıntılar
    add-book.tsx       Google Books araması ya da elle ekleme (modal)
    add-quote.tsx      alıntı ekleme (modal)
  components/          Glass (koyu cam kart), Button, Field, QuoteCard (çizgili yaprak)…
  providers/           AuthProvider (Firebase), BooksProvider (kitap durumu)
  lib/                 api istemcisi, books/me uçları, bookStatus kuralı, Google Books
  i18n/                tr/en metinleri, küçük tipli t() yardımcısı
  theme.ts             web'deki --sf-* paletinin aynısı
```

## Notlar

- **Durum kuralı** web ile aynı (`src/lib/bookStatus.ts`): bitiş tarihi olan
  kitap okunmuştur. Bu dosya ve web'deki kopyası ileride ortak bir pakete
  (`packages/core` gibi) taşınabilir.
- **Tek React**: web React 19.1, mobil React 19.2 kullanıyor. Hoisted
  düzende iki kopya olabileceği için `metro.config.js` `react`,
  `react-native` ve `react-dom`'u hep mobilin bağımlılıklarından çözer.
- **Firebase oturumu** AsyncStorage'da kalıcı (`src/lib/firebase.ts`).
  `firebase/auth` RN tiplerini yayınlamadığı için
  `src/firebase-auth-rn.d.ts` eksik tanımı ekliyor.
- **Paket eklerken** `npx expo install <paket>` kullan; SDK ile uyumlu
  sürümü seçer. Native kod içeren bir paket (ör. Google Sign-In) Expo Go'da
  çalışmaz, development build gerekir (`npx expo run:ios` ya da EAS).
- Bundle id / paket adı: `space.myshelfie.app` (`app.json`).

## Sıradakiler

- Google ile giriş (`@react-native-google-signin/google-signin` + dev build)
- Kitap düzenleme (tarih, not, sayfa), istatistik ekranı
- Fotoğraftan OCR ile alıntı ekleme
- EAS Build + App Store / Play Store yayını

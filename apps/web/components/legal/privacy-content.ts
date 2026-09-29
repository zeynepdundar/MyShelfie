/* ============================================================================
   Gizlilik Politikası metni
   Uzun ve yapılandırılmış olduğu için messages/*.json yerine burada duruyor.
   Metindeki {email} ve {controller}, lib/legal.ts'teki değerlerle doldurulur.
   Uygulama yeni bir veri toplamaya ya da yeni bir servis kullanmaya
   başlarsa (analytics, hata izleme, e-posta...) bu metin de güncellenmeli.
   ========================================================================== */

export interface PrivacyBlock {
  /** Kalın yazılan kısa başlık (liste maddesi için). */
  term?: string;
  text: string;
}

export interface PrivacySection {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: PrivacyBlock[];
  /** Listeden sonra gelen paragraflar. */
  after?: string[];
}

export interface PrivacyContent {
  title: string;
  intro: string;
  sections: PrivacySection[];
}

const tr: PrivacyContent = {
  title: "Gizlilik Politikası",
  intro:
    "Shelfie, okuduğun kitapları takip etmen için geliştirilmiş kişisel bir uygulamadır. Yalnızca uygulamanın çalışması için gereken verileri toplar. Reklam göstermez, verilerini satmaz ve seni izleyen analiz ya da reklam araçları kullanmaz. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve AB Genel Veri Koruma Tüzüğü (GDPR) kapsamında seni bilgilendirmek için hazırlanmıştır.",
  sections: [
    {
      id: "controller",
      title: "Veri sorumlusu",
      paragraphs: [
        "Kişisel verilerinin veri sorumlusu, Shelfie'yi bireysel olarak geliştiren {controller}'dır. Bu politikayla ilgili her soru ve talep için {email} adresine yazabilirsin.",
      ],
    },
    {
      id: "data",
      title: "Hangi verileri topluyoruz",
      items: [
        {
          term: "Hesap bilgileri",
          text: "Google ya da e-posta ile giriş yaparsan e-posta adresin, görünen adın ve Google hesabındaki profil fotoğrafının bağlantısı; ayrıca her hesap için oluşturulan bir kullanıcı kimliği. Şifren Firebase Authentication tarafından şifrelenmiş olarak saklanır, biz göremeyiz.",
        },
        {
          term: "Misafir hesap",
          text: "Misafir olarak başlarsan yalnızca rastgele bir kullanıcı kimliği oluşturulur. Ad ya da e-posta istenmez.",
        },
        {
          term: "Kütüphane içeriğin",
          text: "Eklediğin kitaplar (ad, yazar, sayfa sayısı, kapak görseli bağlantısı), okuma tarihleri, puanlar, notlar, alıntılar, favoriler ve okuma listen.",
        },
        {
          term: "Kitap aramaları",
          text: "Kitap eklerken yazdığın arama metni, sonuçları getirmek için Google Books'a gönderilir. Shelfie bu aramaları saklamaz.",
        },
        {
          term: "Teknik kayıtlar",
          text: "Uygulamayı sunan barındırma (hosting) sağlayıcısı ve Google, güvenlik ve hizmetin işletilmesi için IP adresi, tarayıcı bilgisi ve istek zamanı gibi standart sunucu kayıtları tutabilir.",
        },
      ],
    },
    {
      id: "purpose",
      title: "Verilerini neden ve hangi hukuki sebeple işliyoruz",
      items: [
        {
          term: "Hizmeti sunmak",
          text: "Hesabını oluşturmak, oturum açmanı sağlamak, kütüphaneni saklamak, istatistiklerini göstermek ve farklı cihazlardan erişebilmen için. Hukuki sebep: sözleşmenin kurulması ve ifası (KVKK m.5/2-c, GDPR m.6/1-b).",
        },
        {
          term: "Güvenlik",
          text: "Kötüye kullanımı önlemek ve hizmeti güvenli tutmak için. Hukuki sebep: meşru menfaat (KVKK m.5/2-f, GDPR m.6/1-f).",
        },
      ],
      after: [
        "Verilerini pazarlama, reklam ya da profil çıkarma amacıyla kullanmıyoruz.",
      ],
    },
    {
      id: "sharing",
      title: "Verilerini kimlerle paylaşıyoruz",
      paragraphs: [
        "Verilerin satılmaz. Yalnızca uygulamanın çalışması için kullanılan şu hizmet sağlayıcılar tarafından, bizim adımıza işlenir:",
      ],
      items: [
        {
          term: "Google Firebase",
          text: "Kimlik doğrulama (Firebase Authentication) ve verilerin saklandığı veritabanı (Cloud Firestore).",
        },
        {
          term: "Google Books",
          text: "Kitap aramaları ve kapak görselleri.",
        },
        {
          term: "Barındırma sağlayıcısı",
          text: "Uygulamanın internet üzerinden sunulması.",
        },
      ],
      after: [
        "Bu sağlayıcıların sunucuları Türkiye dışında (örneğin ABD ya da AB ülkelerinde) bulunabilir; bu nedenle verilerin yurt dışına aktarılır. Aktarım, sağlayıcıların veri işleme sözleşmeleri ve sundukları güvenceler çerçevesinde yapılır.",
        "Bunların dışında verilerin, yalnızca yasal bir zorunluluk olduğunda yetkili kurumlarla paylaşılabilir.",
      ],
    },
    {
      id: "retention",
      title: "Verilerini ne kadar saklıyoruz",
      paragraphs: [
        "Verilerin, hesabın açık olduğu sürece saklanır. Hesabını sildiğinde hesap bilgilerin ve kütüphanendeki bütün veriler hemen silinir. Hizmet sağlayıcıların yedeklerinde ya da kayıtlarında kalabilecek kopyalar, onların saklama süreleri sonunda silinir.",
        "Misafir hesap bu tarayıcıya bağlıdır: çıkış yaparsan ya da tarayıcı verilerini temizlersen hesaba bir daha erişemezsin. Misafir hesabını bırakmadan önce Hesabım sayfasından silmeni öneririz.",
      ],
    },
    {
      id: "cookies",
      title: "Çerezler ve tarayıcı depolaması",
      paragraphs: [
        "Shelfie yalnızca uygulamanın çalışması için zorunlu olanları kullanır:",
      ],
      items: [
        { term: "Dil tercihi", text: "Seçtiğin dili hatırlayan bir çerez (NEXT_LOCALE)." },
        { term: "Oturum", text: "Firebase'in giriş durumunu hatırlamak için tarayıcında tuttuğu bilgi." },
        { term: "Geçici bilgi", text: "Hesap silindikten sonra onay mesajını göstermek için bir kez kullanılan oturum depolaması." },
      ],
      after: [
        "Analiz, reklam ya da takip çerezi kullanmıyoruz; bu yüzden çerez onayı istemiyoruz.",
      ],
    },
    {
      id: "rights",
      title: "Hakların",
      paragraphs: [
        "KVKK'nın 11. maddesi ve GDPR kapsamında; verilerinin işlenip işlenmediğini öğrenme, bunlar hakkında bilgi isteme, işleme amacını ve aktarıldığı tarafları öğrenme, eksik ya da yanlış verilerin düzeltilmesini, verilerinin silinmesini ya da işlemenin kısıtlanmasını isteme, verilerini taşınabilir biçimde alma, işlemeye itiraz etme ve zarara uğradıysan bunun giderilmesini isteme haklarına sahipsin.",
        "Görünen adını Hesabım sayfasından değiştirebilir, hesabını ve bütün verilerini Hesabım › Hesabı sil ile hemen silebilirsin. Diğer talepler için {email} adresine yazabilirsin; talebine en geç 30 gün içinde yanıt verilir.",
        "Ayrıca Kişisel Verileri Koruma Kurulu'na ya da AB'de yaşıyorsan bulunduğun ülkenin veri koruma otoritesine şikâyette bulunabilirsin.",
      ],
    },
    {
      id: "security",
      title: "Güvenlik",
      paragraphs: [
        "Bağlantılar HTTPS ile şifrelenir. Veritabanı kuralları, her kullanıcının yalnızca kendi verisine erişebilmesini sağlar. Yine de internet üzerinden hiçbir sistem tamamen güvenli değildir; bir güvenlik ihlali fark edersek ilgili mevzuata göre bildirimde bulunuruz.",
      ],
    },
    {
      id: "children",
      title: "Çocuklar",
      paragraphs: [
        "Shelfie çocuklara yönelik değildir. 13 yaşından küçüksen Shelfie'yi kullanma. Bir çocuğa ait veri topladığımızı fark edersek bu verileri sileriz.",
      ],
    },
    {
      id: "changes",
      title: "Değişiklikler",
      paragraphs: [
        "Bu politikayı zaman zaman güncelleyebiliriz. Güncel metin her zaman bu sayfadadır; en üstteki tarih son değişikliği gösterir.",
      ],
    },
  ],
};

const en: PrivacyContent = {
  title: "Privacy Policy",
  intro:
    "Shelfie is a personal app for keeping track of the books you read. It only collects the data it needs to work. It doesn't show ads, doesn't sell your data, and doesn't use analytics or advertising tools that track you. This policy explains how your data is handled under the Turkish Personal Data Protection Law No. 6698 (KVKK) and the EU General Data Protection Regulation (GDPR).",
  sections: [
    {
      id: "controller",
      title: "Data controller",
      paragraphs: [
        "The data controller for your personal data is {controller}, who develops Shelfie as an individual. For any question or request about this policy, write to {email}.",
      ],
    },
    {
      id: "data",
      title: "What we collect",
      items: [
        {
          term: "Account details",
          text: "If you sign in with Google or email: your email address, display name, a link to your Google profile photo, and a user ID created for each account. Your password is stored encrypted by Firebase Authentication; we can't see it.",
        },
        {
          term: "Guest account",
          text: "If you start as a guest, only a random user ID is created. No name or email is asked for.",
        },
        {
          term: "Your library",
          text: "The books you add (title, author, page count, cover image link), reading dates, ratings, notes, quotes, favorites and your reading list.",
        },
        {
          term: "Book searches",
          text: "When you add a book, the search text you type is sent to Google Books to fetch results. Shelfie doesn't store these searches.",
        },
        {
          term: "Technical logs",
          text: "The hosting provider that serves the app and Google may keep standard server logs, such as IP address, browser information and request time, for security and operating the service.",
        },
      ],
    },
    {
      id: "purpose",
      title: "Why we process your data, and on what legal basis",
      items: [
        {
          term: "Providing the service",
          text: "To create your account, sign you in, store your library, show your statistics and let you access it from different devices. Legal basis: performance of a contract (KVKK Art. 5/2-c, GDPR Art. 6(1)(b)).",
        },
        {
          term: "Security",
          text: "To prevent abuse and keep the service secure. Legal basis: legitimate interests (KVKK Art. 5/2-f, GDPR Art. 6(1)(f)).",
        },
      ],
      after: ["We don't use your data for marketing, advertising or profiling."],
    },
    {
      id: "sharing",
      title: "Who we share your data with",
      paragraphs: [
        "Your data is never sold. It is processed on our behalf only by these service providers, which the app needs to work:",
      ],
      items: [
        {
          term: "Google Firebase",
          text: "Authentication (Firebase Authentication) and the database where your data is stored (Cloud Firestore).",
        },
        { term: "Google Books", text: "Book searches and cover images." },
        { term: "Hosting provider", text: "Serving the app over the internet." },
      ],
      after: [
        "These providers' servers may be located outside Türkiye (for example in the US or EU), so your data is transferred abroad. Transfers take place under the providers' data processing terms and the safeguards they offer.",
        "Beyond this, your data may only be shared with authorities where the law requires it.",
      ],
    },
    {
      id: "retention",
      title: "How long we keep your data",
      paragraphs: [
        "Your data is kept for as long as your account exists. When you delete your account, your account details and everything in your library are deleted immediately. Copies that may remain in the service providers' backups or logs are deleted at the end of their retention periods.",
        "A guest account is tied to this browser: if you sign out or clear your browser data, you can't get back into it. We recommend deleting a guest account from the Account page before leaving it.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies and browser storage",
      paragraphs: ["Shelfie only uses what the app needs to work:"],
      items: [
        { term: "Language", text: "A cookie that remembers your language (NEXT_LOCALE)." },
        { term: "Session", text: "Information Firebase keeps in your browser to remember that you're signed in." },
        { term: "Temporary", text: "Session storage used once to show a confirmation after you delete your account." },
      ],
      after: [
        "We don't use analytics, advertising or tracking cookies, so we don't ask for cookie consent.",
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      paragraphs: [
        "Under Article 11 of the KVKK and the GDPR, you have the right to know whether your data is processed, to request information about it, to learn the purpose of processing and who it is shared with, to have incomplete or incorrect data corrected, to have your data erased or its processing restricted, to receive your data in a portable format, to object to processing, and to claim compensation if you suffer damage.",
        "You can change your display name on the Account page, and delete your account and all your data immediately via Account › Delete account. For any other request, write to {email}; you'll get a reply within 30 days at the latest.",
        "You can also lodge a complaint with the Turkish Personal Data Protection Authority or, if you live in the EU, with your local data protection authority.",
      ],
    },
    {
      id: "security",
      title: "Security",
      paragraphs: [
        "Connections are encrypted with HTTPS. Database rules make sure each user can only access their own data. Still, no system on the internet is completely secure; if we become aware of a breach, we'll notify as required by law.",
      ],
    },
    {
      id: "children",
      title: "Children",
      paragraphs: [
        "Shelfie is not intended for children. If you're under 13, please don't use Shelfie. If we learn that we've collected data from a child, we'll delete it.",
      ],
    },
    {
      id: "changes",
      title: "Changes",
      paragraphs: [
        "We may update this policy from time to time. The current version is always on this page; the date at the top shows when it last changed.",
      ],
    },
  ],
};

export const privacyContent = { tr, en } as const;

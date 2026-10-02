/* ============================================================================
   Kullanım Koşulları metni
   TASLAKTIR: yayından önce gözden geçirilmeli. Gizlilik Politikası ile aynı
   yapıyı kullanır; {email} ve {controller} lib/legal.ts'teki değerlerle
   doldurulur. Ücretli bir özellik, reklam ya da yeni bir servis eklenirse
   bu metin de güncellenmeli.
   ========================================================================== */

import type { PrivacyContent } from "@/components/legal/privacy-content";

const tr: PrivacyContent = {
  title: "Kullanım Koşulları",
  intro:
    "Bu koşullar, MyShelfie web uygulamasının ve mobil uygulamalarının kullanımını düzenler. MyShelfie'yi kullanarak bu koşulları kabul etmiş olursun. Kabul etmiyorsan lütfen uygulamayı kullanma.",
  sections: [
    {
      id: "service",
      title: "Hizmet",
      paragraphs: [
        "MyShelfie, okuduğun kitapları, okuma ilerlemeni, favorilerini ve alıntılarını kaydetmeni sağlayan kişisel bir okuma günlüğüdür. {controller} tarafından bireysel olarak geliştirilir ve şu anda ücretsizdir.",
        "Uygulamayı geliştirmeye devam ettiğimiz için özellikler zamanla değişebilir, eklenebilir ya da kaldırılabilir.",
      ],
    },
    {
      id: "account",
      title: "Hesabın",
      items: [
        {
          term: "Misafir hesap",
          text: "Kayıt olmadan misafir olarak başlayabilirsin. Misafir hesap bu tarayıcıya ya da cihaza bağlıdır; hesabını kalıcı bir hesaba bağlamadan çıkış yaparsan ya da tarayıcı verilerini temizlersen kütüphanene bir daha erişemeyebilirsin.",
        },
        {
          term: "Kalıcı hesap",
          text: "Google ya da e-posta ile giriş yaptığında hesabının güvenliğinden ve giriş bilgilerini başkalarıyla paylaşmamaktan sen sorumlusun.",
        },
        {
          term: "Hesabı silme",
          text: "Hesabını ve bütün verilerini istediğin zaman Hesabım › Hesabı sil ile silebilirsin.",
        },
      ],
    },
    {
      id: "content",
      title: "İçeriğin",
      paragraphs: [
        "Eklediğin kitaplar, notlar ve alıntılar sana aittir. Bunları yalnızca hizmeti sana sunmak için saklar ve işleriz; ayrıntılar Gizlilik Politikası'ndadır.",
        "Kaydettiğin alıntılar kişisel kullanımın içindir. Başkalarının eserlerinden aldığın alıntıları paylaşırken telif haklarına saygı göstermek senin sorumluluğundadır.",
      ],
    },
    {
      id: "use",
      title: "Kabul edilebilir kullanım",
      paragraphs: ["MyShelfie'yi kullanırken şunları yapmamayı kabul edersin:"],
      items: [
        { text: "Hizmetin çalışmasını bozmaya, güvenliğini aşmaya ya da başka kullanıcıların verilerine erişmeye çalışmak." },
        { text: "Hizmeti otomatik araçlarla aşırı yükleyecek biçimde kullanmak." },
        { text: "Yasalara aykırı, başkalarının haklarını ihlal eden ya da zararlı içerik kaydetmek." },
      ],
      after: [
        "Bu koşulların ciddi biçimde ihlal edildiğini görürsek ilgili hesabı askıya alabilir ya da kapatabiliriz.",
      ],
    },
    {
      id: "third-party",
      title: "Üçüncü taraf hizmetler",
      paragraphs: [
        "Kitap bilgileri ve kapak görselleri Google Books'tan gelir; bu bilgilerin doğruluğunu garanti edemeyiz. Giriş ve veri saklama için Google Firebase kullanılır. Bu hizmetlerin kendi koşulları ve gizlilik politikaları geçerlidir.",
      ],
    },
    {
      id: "warranty",
      title: "Sorumluluğun sınırları",
      paragraphs: [
        "MyShelfie \"olduğu gibi\" sunulur. Hizmetin kesintisiz ya da hatasız çalışacağını garanti edemeyiz. Verilerini korumak için makul önlemleri alırız; yine de önemli bulduğun bilgilerin bir kopyasını ayrıca saklamanı öneririz.",
        "Yürürlükteki hukukun izin verdiği ölçüde, uygulamanın kullanımından ya da kullanılamamasından doğan dolaylı zararlardan sorumlu değiliz.",
      ],
    },
    {
      id: "changes",
      title: "Koşullardaki değişiklikler",
      paragraphs: [
        "Bu koşulları zaman zaman güncelleyebiliriz. Önemli bir değişiklik olduğunda bunu uygulama içinde duyururuz. Değişiklikten sonra uygulamayı kullanmaya devam etmen, güncel koşulları kabul ettiğin anlamına gelir.",
      ],
    },
    {
      id: "contact",
      title: "İletişim",
      paragraphs: ["Bu koşullarla ilgili soruların için {email} adresine yazabilirsin."],
    },
  ],
};

const en: PrivacyContent = {
  title: "Terms of Use",
  intro:
    "These terms govern your use of the MyShelfie web app and mobile apps. By using MyShelfie you agree to these terms. If you don't agree, please don't use the app.",
  sections: [
    {
      id: "service",
      title: "The service",
      paragraphs: [
        "MyShelfie is a personal reading journal that lets you keep track of the books you read, your reading progress, favorites and quotes. It is built independently by {controller} and is currently free.",
        "Because we keep developing the app, features may change, be added or be removed over time.",
      ],
    },
    {
      id: "account",
      title: "Your account",
      items: [
        {
          term: "Guest account",
          text: "You can start as a guest without signing up. A guest account is tied to this browser or device; if you sign out or clear your browser data before linking it to a permanent account, you may lose access to your library.",
        },
        {
          term: "Permanent account",
          text: "When you sign in with Google or email, you are responsible for keeping your account secure and not sharing your sign-in details.",
        },
        {
          term: "Deleting your account",
          text: "You can delete your account and all of its data at any time from Account › Delete account.",
        },
      ],
    },
    {
      id: "content",
      title: "Your content",
      paragraphs: [
        "The books, notes and quotes you add belong to you. We store and process them only to provide the service to you; see the Privacy Policy for details.",
        "Quotes you save are for your personal use. When you share passages from other people's works, respecting their copyright is your responsibility.",
      ],
    },
    {
      id: "use",
      title: "Acceptable use",
      paragraphs: ["When using MyShelfie you agree not to:"],
      items: [
        { text: "Try to disrupt the service, bypass its security or access other users' data." },
        { text: "Use automated tools in a way that overloads the service." },
        { text: "Store content that is unlawful, infringes others' rights or is harmful." },
      ],
      after: [
        "If we find a serious breach of these terms, we may suspend or close the account involved.",
      ],
    },
    {
      id: "third-party",
      title: "Third-party services",
      paragraphs: [
        "Book details and cover images come from Google Books, and we can't guarantee their accuracy. Google Firebase is used for sign-in and data storage. Those services' own terms and privacy policies apply.",
      ],
    },
    {
      id: "warranty",
      title: "Limits of liability",
      paragraphs: [
        "MyShelfie is provided \"as is\". We can't guarantee that the service will be uninterrupted or error-free. We take reasonable steps to protect your data, but we recommend keeping your own copy of anything important to you.",
        "To the extent permitted by applicable law, we are not liable for indirect damages arising from the use of, or inability to use, the app.",
      ],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      paragraphs: [
        "We may update these terms from time to time. We'll announce significant changes in the app. Continuing to use the app after a change means you accept the updated terms.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: ["If you have questions about these terms, write to {email}."],
    },
  ],
};

export const termsContent = { tr, en };

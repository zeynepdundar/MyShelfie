import { getPrisma } from "../prisma.js";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  isAnonymous: boolean;
};

/**
 * Kullanıcı kaydı Firebase'de oluşuyor; Postgres tarafında ilk istekte açılır.
 * Kitap eklerken yabancı anahtar hatası almamak için yazma işlemlerinden önce
 * çağrılır. Token'daki profil bilgisi boşsa veritabanındaki değer korunur.
 *
 * Bilerek önbelleğe alınmıyor: satır başka bir sunucu örneğinden ya da
 * elle silinmiş olabilir; yanlış "var" bilgisi kitap eklemeyi kırardı.
 */
export async function ensureUser(user: AuthUser) {
  await getPrisma().user.upsert({
    where: { id: user.uid },
    create: {
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      isAnonymous: user.isAnonymous,
    },
    update: {
      email: user.email ?? undefined,
      displayName: user.displayName ?? undefined,
      photoUrl: user.photoUrl ?? undefined,
      isAnonymous: user.isAnonymous,
    },
  });
}

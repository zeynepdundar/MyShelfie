import { collection, getDocs, writeBatch } from "firebase/firestore";
import type { Book } from "@shelfie/types";

import { db } from "@/lib/firebase";

/* ============================================================================
   Hesap verisi — dışa aktarma ve silme
   Kullanıcının bütün verisi users/{uid} altında duruyor:
     users/{uid}/books/{bookId}  → kitap + notlar + alıntılar + favori bilgisi
   Yeni bir alt koleksiyon eklenirse USER_COLLECTIONS'a da eklenmeli; yoksa
   hesap silindiğinde o veri Firestore'da sahipsiz kalır.
   ========================================================================== */

const USER_COLLECTIONS = ["books"] as const;

/** Firestore bir batch'te en fazla 500 işlem kabul ediyor; pay bırakıyoruz. */
const BATCH_LIMIT = 450;

/** Kullanıcının Firestore'daki bütün verisini siler. Kurallar gereği oturum açıkken çalışmalı. */
export async function deleteUserData(uid: string) {
  for (const name of USER_COLLECTIONS) {
    const snapshot = await getDocs(collection(db, "users", uid, name));

    for (let i = 0; i < snapshot.docs.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db);
      snapshot.docs
        .slice(i, i + BATCH_LIMIT)
        .forEach((document) => batch.delete(document.ref));
      await batch.commit();
    }
  }
}

interface ExportAccount {
  email: string | null;
  displayName: string | null;
  providers: string[];
}

/** Hesaptaki her şeyi tek bir JSON dosyası olarak indirir (KVKK/GDPR veri taşınabilirliği). */
export function downloadUserData(account: ExportAccount, books: Book[]) {
  const payload = {
    app: "MyShelfie",
    exportedAt: new Date().toISOString(),
    account,
    books,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `myshelfie-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Silme sonrası karşılama ekranında onay göstermek için kısa ömürlü işaret. */
export const ACCOUNT_DELETED_FLAG = "shelfie:account-deleted";

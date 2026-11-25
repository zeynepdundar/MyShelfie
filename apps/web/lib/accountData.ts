import type { Book } from "@shelfie/types";

import { apiFetch } from "@/lib/api";

/* ============================================================================
   Hesap verisi — dışa aktarma ve silme
   Bütün veri Postgres'te (apps/api). Silme isteği API'ye gider; API,
   geçişten önce Firestore'a yazılmış eski kopyaları da temizler.
   ========================================================================== */

/** Kullanıcının bütün verisini siler. Oturum açıkken çalışmalı (API token ister). */
export async function deleteUserData() {
  await apiFetch<void>("/api/me", { method: "DELETE" });
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

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocale, useTranslations } from "next-intl";
// Veri indirme şimdilik kapalı; açılınca Download ikonu geri eklenecek.
import { AlertTriangle, /* Download, */ Trash2, X } from "lucide-react";

import type { RootState } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import {
  deleteAccount,
  deleteVerificationFor,
  type AuthUser,
} from "@/lib/authSlice";
import { clearBooks } from "@/lib/booksSlice";
import { ACCOUNT_DELETED_FLAG /* , downloadUserData */ } from "@/lib/accountData";
import { Button } from "@/components/ui/button";
import { GlassCard, SectionHeader } from "@/components/ui/glass";

/** Firebase hata kodlarından kullanıcıya gösterilecek mesaj anahtarı. */
const ERROR_KEYS: Record<string, string> = {
  "auth/wrong-password": "wrongPassword",
  "auth/invalid-credential": "wrongPassword",
  "auth/missing-password": "wrongPassword",
  "auth/popup-closed-by-user": "popupClosed",
  "auth/cancelled-popup-request": "popupClosed",
  "auth/popup-blocked": "popupBlocked",
  "auth/user-mismatch": "userMismatch",
  "auth/too-many-requests": "tooManyRequests",
  "auth/network-request-failed": "network",
  "auth/requires-recent-login": "recentLogin",
};

/** "Verilerini indir" + "Hesabı sil" satırları; hesap sayfasının en altında durur. */
export function AccountDataSection({ user }: { user: AuthUser }) {
  const t = useTranslations("account.danger");
  const books = useSelector((state: RootState) => state.books.books);
  const [dialogOpen, setDialogOpen] = useState(false);

  /* VERİ İNDİRME — şimdilik kapalı. Açmak için bu bloğu, aşağıdaki
     "Verilerini indir" satırını, dialogdaki onDownload prop'unu ve
     importlardaki Download / downloadUserData'yı yorumdan çıkar.

  const download = () =>
    downloadUserData(
      {
        email: user.email,
        displayName: user.displayName,
        providers: user.isAnonymous ? ["anonymous"] : user.providers,
      },
      books
    );
  */

  return (
    <section className="min-w-0">
      <SectionHeader title={t("title")} description={t("hint")} />

      <GlassCard className="py-2">
        {/* Verilerini indir — şimdilik kapalı
        <div className="flex flex-col gap-3 border-b border-white/10 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">{t("export.title")}</p>
            <p className="mt-0.5 text-sm text-white/55">{t("export.hint")}</p>
          </div>
          <Button
            variant="outline"
            className="shrink-0 gap-2"
            onClick={download}
            disabled={books.length === 0}
          >
            <Download className="h-4 w-4" />
            {t("export.action")}
          </Button>
        </div>
        */}

        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">{t("delete.title")}</p>
            <p className="mt-0.5 text-sm text-white/55">
              {user.isAnonymous ? t("delete.hintGuest") : t("delete.hint")}
            </p>
          </div>
          <Button
            variant="destructive"
            className="shrink-0 gap-2"
            onClick={() => setDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            {t("delete.action")}
          </Button>
        </div>
      </GlassCard>

      {dialogOpen && (
        <DeleteAccountDialog
          user={user}
          bookCount={books.length}
          // onDownload={download}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </section>
  );
}

interface DeleteAccountDialogProps {
  user: AuthUser;
  bookCount: number;
  /** Verilmezse "silmeden önce indir" bağlantısı gösterilmez. */
  onDownload?: () => void;
  onClose: () => void;
}

function DeleteAccountDialog({
  user,
  bookCount,
  onDownload,
  onClose,
}: DeleteAccountDialogProps) {
  const t = useTranslations("account.danger.dialog");
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const titleId = useId();
  const confirmRef = useRef<HTMLInputElement>(null);

  const verification = deleteVerificationFor(user);
  const confirmWord = t("confirmWord");

  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmed =
    confirmText.trim().toLocaleUpperCase(locale) ===
    confirmWord.toLocaleUpperCase(locale);
  const canSubmit =
    confirmed && !busy && (verification !== "password" || password.length > 0);

  const close = () => {
    if (!busy) onClose();
  };

  // Escape ile kapanır (silme sürerken kapanmaz); açılınca onay alanına odaklanır
  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);

    try {
      await dispatch(deleteAccount({ password })).unwrap();
      dispatch(clearBooks());
      try {
        sessionStorage.setItem(ACCOUNT_DELETED_FLAG, "1");
      } catch {
        // Depolama kapalıysa onay mesajı gösterilmez; silme yine tamamlandı
      }
      // Oturum kapandığı için HomeLayout karşılama ekranına yönlendirir
    } catch (reason) {
      const code = typeof reason === "string" ? reason : "auth/unknown";
      setError(t(`errors.${ERROR_KEYS[code] ?? "unknown"}`));
      setBusy(false);
    }
  }

  return (
    <div
      className="sf-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={close}
    >
      <div className="sf-modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="sf-modal-header">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <h2 id={titleId} className="sf-title-section">
                {t("title")}
              </h2>
              <p className="sf-muted mt-1">{t("subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            aria-label={t("cancel")}
            className="sf-icon-button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="sf-modal-body">
            <div>
              <p className="sf-label">{t("whatGoes")}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                <li>{t("itemBooks", { count: bookCount })}</li>
                <li>{t("itemAccount")}</li>
              </ul>
            </div>

            {bookCount > 0 && onDownload && (
              <p className="text-sm">
                {t("exportFirst")}{" "}
                <button
                  type="button"
                  onClick={onDownload}
                  className="font-medium underline underline-offset-2 hover:opacity-80"
                >
                  {t("exportLink")}
                </button>
              </p>
            )}

            <label className="block">
              <span className="sf-label">
                {t.rich("confirmLabel", {
                  word: confirmWord,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </span>
              <input
                ref={confirmRef}
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                disabled={busy}
                className="sf-input mt-2"
              />
            </label>

            {verification === "password" && (
              <label className="block">
                <span className="sf-label">{t("passwordLabel")}</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={busy}
                  className="sf-input mt-2"
                />
              </label>
            )}

            {verification === "google" && (
              <p className="sf-muted">{t("googleNote")}</p>
            )}

            {error && (
              <p role="alert" className="sf-alert-error">
                {error}
              </p>
            )}
          </div>

          <div className="sf-modal-footer sm:justify-end">
            <Button type="button" variant="outline" onClick={close} disabled={busy}>
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!canSubmit}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {busy ? t("deleting") : t("submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Hesap silindikten sonra karşılama ekranında bir kez görünen onay. */
export function AccountDeletedNotice() {
  const t = useTranslations("account.danger");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(ACCOUNT_DELETED_FLAG)) {
        sessionStorage.removeItem(ACCOUNT_DELETED_FLAG);
        setVisible(true);
      }
    } catch {
      // Depolama erişilemiyorsa sessizce geç
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-white/15 bg-black/70 px-4 py-3 text-sm text-white backdrop-blur-xl"
    >
      <p className="flex-1">{t("deletedNotice")}</p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label={t("dismiss")}
        className="text-white/60 transition-colors hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

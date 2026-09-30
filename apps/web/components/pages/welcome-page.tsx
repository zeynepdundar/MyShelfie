"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { PrivacyLink } from "@/components/legal/privacy-link";

interface WelcomeScreenProps {
  /** Kayıt formu olmadan misafir olarak başlatır. */
  onGetStarted: () => void;
  /** Hesabı olan kullanıcıyı giriş ekranına götürür. */
  onSignIn: () => void;
  /** Misafir hesabı açılırken true. */
  starting?: boolean;
}

export function WelcomeScreen({
  onGetStarted,
  onSignIn,
  starting = false,
}: WelcomeScreenProps) {
  const t = useTranslations("welcome");

  return (
    <main className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-transparent text-white">
      {/* Kitaplık arka planı body üzerinden gelir; burada sadece okunabilirlik katmanı var. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,26,33,0.45)_0%,rgba(4,26,33,0.22)_50%,transparent_100%)]"
      />

      <header className="mx-auto flex w-full max-w-7xl items-center gap-3 px-6 py-8 sm:px-10 lg:px-16">
        <span className="flex size-10 items-center justify-center rounded-tile border border-white/20 bg-white/10 backdrop-blur-md">
          <Image src="/logo-books.svg" alt="" width={22} height={22} />
        </span>
        <span className="text-lg font-semibold tracking-tight">MyShelfie</span>
      </header>

      <section
        aria-labelledby="welcome-heading"
        className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20"
      >
        <div className="max-w-xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">{t("eyebrow")}</p>

          <h1 id="welcome-heading" className="text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t("titleStart")}
            <span className="block text-mint-bright">{t("titleEnd")}</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
            {t("description")}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              onClick={onGetStarted}
              disabled={starting}
              size="lg"
              className="w-full gap-3 sm:w-auto"
            >
              {starting ? t("starting") : t("getStarted")}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onSignIn}
              size="lg"
              className="w-full sm:w-auto"
            >
              {t("haveAccount")}
            </Button>
          </div>
          <p className="mt-3 text-sm text-white/55">
            {t("note")}
          </p>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6 pb-8 text-xs text-white/50 sm:px-10 lg:px-16">
        <span>© {new Date().getFullYear()} MyShelfie</span>
        <PrivacyLink />
      </footer>
    </main>
  );
}

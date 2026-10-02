"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, BarChart3, Check, Library, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL } from "@/lib/legal";
import {
  LibraryPreview,
  Screenshot,
  SearchPreview,
  StatsPreview,
  TreasuresPreview,
} from "@/components/landing/app-previews";

/* ============================================================================
   Landing sayfası ( / )
   Oturum açmamış ziyaretçiye gösterilir. Bölümler: üst menü → ilk ekran →
   üç temel fayda → özellik satırları → son çağrı → footer.
   ========================================================================== */

/**
 * Gerçek ekran görüntüleri. Bir dosyayı public/landing/ altına koyup yolunu
 * buraya yazarsan (ör. "/landing/library-en.png") o bölümde çizilmiş önizleme
 * yerine görüntü kullanılır. Boş bırakılanlar önizlemeyle gösterilir.
 */
const SCREENSHOTS: Record<"library" | "search" | "stats" | "treasures", string | undefined> = {
  library: undefined,
  search: undefined,
  stats: undefined,
  treasures: undefined,
};

const LOCALES = [
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
] as const;

interface LandingPageProps {
  /** Kayıt formu olmadan misafir olarak başlatır. */
  onGetStarted: () => void;
  /** Hesabı olan kullanıcıyı giriş ekranına götürür. */
  onSignIn: () => void;
  /** Misafir hesabı açılırken true. */
  starting?: boolean;
}

export function LandingPage({ onGetStarted, onSignIn, starting = false }: LandingPageProps) {
  const t = useTranslations("landing");

  const startButton = (size: "default" | "lg", className?: string) => (
    <Button
      type="button"
      onClick={onGetStarted}
      disabled={starting}
      size={size}
      className={cn("gap-3", className)}
    >
      {starting ? t("starting") : t("cta")}
      <ArrowRight aria-hidden className="size-4" />
    </Button>
  );

  return (
    <div className="relative isolate min-h-dvh w-full overflow-x-clip text-white">
      <LandingNav onGetStarted={onGetStarted} onSignIn={onSignIn} starting={starting} />

      {/* --- İlk ekran ------------------------------------------------------ */}
      <section
        aria-labelledby="landing-heading"
        className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-20 pt-10 sm:px-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-16 lg:pb-28 lg:pt-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-[linear-gradient(90deg,rgba(4,26,33,0.55)_0%,rgba(4,26,33,0.3)_55%,rgba(4,26,33,0.1)_100%)]"
        />
        <div className="max-w-xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
            {t("hero.eyebrow")}
          </p>
          <h1
            id="landing-heading"
            className="text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {t("hero.titleStart")}
            <span className="block text-mint-bright">{t("hero.titleEnd")}</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
            {t("hero.description")}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            {startButton("lg", "w-full sm:w-auto")}
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onSignIn}
              className="w-full sm:w-auto"
            >
              {t("hero.haveAccount")}
            </Button>
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
            {(["free", "noSignup", "languages"] as const).map((key) => (
              <li key={key} className="flex items-center gap-1.5">
                <Check aria-hidden className="h-4 w-4 text-mint-bright" />
                {t(`hero.points.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          {/* Önizlemenin arkasındaki sıcak ışık */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-accent-strong/15 blur-3xl"
          />
          <Screenshot src={SCREENSHOTS.library} label={t("previews.library")} className="lg:rotate-[0.6deg]">
            <LibraryPreview />
          </Screenshot>
        </div>
      </section>

      {/* --- Fotoğrafın üstüne kayan koyu cam zemin -------------------------- */}
      <div
        className="rounded-t-[2.5rem] border-t border-white/10"
        style={{
          background: "rgba(10, 8, 6, 0.8)",
          backdropFilter: "blur(28px) saturate(1.2)",
          WebkitBackdropFilter: "blur(28px) saturate(1.2)",
        }}
      >
        {/* --- Üç temel fayda ----------------------------------------------- */}
        <section
          aria-label={t("benefits.label")}
          className="mx-auto grid w-full max-w-7xl gap-4 px-6 pb-8 pt-16 sm:px-10 md:grid-cols-3 lg:px-16 lg:pt-20"
        >
          {(
            [
              { key: "organize", icon: Library },
              { key: "progress", icon: TrendingUp },
              { key: "habits", icon: BarChart3 },
            ] as const
          ).map(({ key, icon: Icon }) => (
            <div key={key} className="rounded-card border border-white/10 bg-white/[0.04] p-6">
              <span className="sf-icon-badge">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-lg font-semibold tracking-tight">{t(`benefits.${key}.title`)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{t(`benefits.${key}.body`)}</p>
            </div>
          ))}
        </section>

        {/* --- Özellik anlatımı --------------------------------------------- */}
        <section
          id="features"
          aria-labelledby="features-heading"
          className="mx-auto w-full max-w-7xl scroll-mt-24 px-6 py-16 sm:px-10 lg:px-16 lg:py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
              {t("features.eyebrow")}
            </p>
            <h2
              id="features-heading"
              className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {t("features.title")}
            </h2>
          </div>

          <div className="mt-16 flex flex-col gap-20 lg:mt-20 lg:gap-28">
            <FeatureRow
              index={1}
              title={t("features.library.title")}
              body={t("features.library.body")}
              preview={
                <Screenshot src={SCREENSHOTS.library} label={t("previews.library")}>
                  <LibraryPreview compact />
                </Screenshot>
              }
            />
            <FeatureRow
              index={2}
              reverse
              title={t("features.search.title")}
              body={t("features.search.body")}
              preview={
                <Screenshot src={SCREENSHOTS.search} label={t("previews.search")}>
                  <SearchPreview />
                </Screenshot>
              }
            />
            <FeatureRow
              index={3}
              title={t("features.stats.title")}
              body={t("features.stats.body")}
              preview={
                <Screenshot src={SCREENSHOTS.stats} label={t("previews.stats")}>
                  <StatsPreview />
                </Screenshot>
              }
            />
            <FeatureRow
              index={4}
              reverse
              title={t("features.treasures.title")}
              body={t("features.treasures.body")}
              preview={
                <Screenshot src={SCREENSHOTS.treasures} label={t("previews.treasures")}>
                  <TreasuresPreview />
                </Screenshot>
              }
            />
          </div>
        </section>

        {/* --- Son çağrı ---------------------------------------------------- */}
        <section aria-labelledby="final-heading" className="px-6 pb-20 sm:px-10 lg:px-16 lg:pb-28">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-panel border border-white/10 px-6 py-14 text-center sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-cover bg-center opacity-40"
              style={{ backgroundImage: "var(--sf-page-image)" }}
            />
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(4,26,33,0.55),rgba(10,8,6,0.85))]" />
            <h2 id="final-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("final.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/70">{t("final.body")}</p>
            <div className="mt-8 flex justify-center">{startButton("lg", "w-full sm:w-auto")}</div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </div>
  );
}

/* --- Üst menü ------------------------------------------------------------- */

function LandingNav({ onGetStarted, onSignIn, starting }: LandingPageProps) {
  const t = useTranslations("landing");
  const [scrolled, setScrolled] = useState(false);

  // Sayfa kaydırılınca menü koyu cama döner; en üstte fotoğrafla bütünleşir
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled ? "glass-dark border-white/10" : "border-transparent"
      )}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 sm:px-10 lg:px-16">
        <a href="#" className="flex shrink-0 items-center gap-2.5 sm:gap-3" onClick={() => window.scrollTo({ top: 0 })}>
          <span className="flex size-10 items-center justify-center rounded-tile border border-white/20 bg-white/10 backdrop-blur-md">
            <Image src="/logo-books.svg" alt="" width={22} height={22} />
          </span>
          <span className="text-base font-semibold tracking-tight sm:text-lg">MyShelfie</span>
        </a>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <a
            href="#features"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white sm:inline-flex"
          >
            {t("nav.features")}
          </a>
          <button
            type="button"
            onClick={onSignIn}
            className="whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white sm:px-4"
          >
            {t("nav.signIn")}
          </button>
          <Button type="button" onClick={onGetStarted} disabled={starting} className="ml-1 h-10 px-4 sm:h-11 sm:px-5">
            {starting ? t("starting") : t("nav.start")}
          </Button>
        </div>
      </nav>
    </header>
  );
}

/* --- Özellik satırı ------------------------------------------------------- */

function FeatureRow({
  index,
  title,
  body,
  preview,
  reverse = false,
}: {
  index: number;
  title: string;
  body: string;
  preview: ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
      <div className={cn("max-w-md", reverse && "lg:order-2 lg:justify-self-start")}>
        <span className="font-display text-5xl font-light italic text-accent-strong/80">
          {String(index).padStart(2, "0")}
        </span>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h3>
        <p className="mt-4 text-base leading-relaxed text-white/70">{body}</p>
      </div>
      <div className={cn("w-full max-w-xl", reverse ? "lg:order-1" : "lg:justify-self-end")}>{preview}</div>
    </div>
  );
}

/* --- Footer --------------------------------------------------------------- */

function LandingFooter() {
  const t = useTranslations("landing.footer");
  const legal = useTranslations("legal");
  const locale = useLocale();

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 text-sm text-white/60 sm:px-10 md:flex-row md:items-center lg:px-16">
        <div className="flex items-center gap-2">
          <Image src="/logo-books.svg" alt="" width={18} height={18} />
          <span>© {new Date().getFullYear()} MyShelfie</span>
        </div>

        <nav aria-label={t("label")} className="flex flex-wrap gap-x-5 gap-y-2 md:ml-auto">
          <Link href={`/${locale}/privacy`} className="transition-colors hover:text-white">
            {legal("privacyLink")}
          </Link>
          <Link href={`/${locale}/terms`} className="transition-colors hover:text-white">
            {legal("termsLink")}
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-white">
            {t("contact")}
          </a>
        </nav>

        <div className="sf-segmented" role="group" aria-label={t("language")}>
          {LOCALES.map((option) => (
            <Link
              key={option.code}
              href={`/${option.code}`}
              lang={option.code}
              aria-current={option.code === locale ? "true" : undefined}
              className="sf-segmented-item px-3 py-1 text-xs"
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

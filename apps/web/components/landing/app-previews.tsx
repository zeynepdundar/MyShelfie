"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Heart, Search, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { glassStyle } from "@/components/ui/glass";

/* ============================================================================
   Landing sayfasındaki uygulama önizlemeleri
   Uygulamanın gerçek bileşen stilleri (cam kartlar, sf-* sınıfları, defter
   yaprağı) ve gerçek metinleriyle çizilir; böylece dil değişince önizleme de
   değişir ve ekran görüntüsü güncellemek gerekmez.
   Gerçek bir ekran görüntüsü kullanmak istersen public/landing/ altına koyup
   landing-page.tsx'teki SCREENSHOTS nesnesine yolunu yazman yeterli.
   ========================================================================== */

type Locale = "en" | "tr";

interface SampleBook {
  title: Record<Locale, string>;
  author: string;
  color: string;
  status: "completed" | "inProgress" | "wantToRead";
  rating?: number;
  progress?: number;
}

/* Örnek kitaplar telif riski olmasın diye kapak görseli yerine tipografik
   kapakla çizilir. */
const BOOKS: SampleBook[] = [
  { title: { en: "Pride and Prejudice", tr: "Aşk ve Gurur" }, author: "Jane Austen", color: "#7a2e3a", status: "completed", rating: 5 },
  { title: { en: "Madonna in a Fur Coat", tr: "Kürk Mantolu Madonna" }, author: "Sabahattin Ali", color: "#0a5b6f", status: "inProgress", progress: 64 },
  { title: { en: "Crime and Punishment", tr: "Suç ve Ceza" }, author: "F. M. Dostoyevski", color: "#2c3e66", status: "completed", rating: 4 },
  { title: { en: "Middlemarch", tr: "Middlemarch" }, author: "George Eliot", color: "#8a6a12", status: "wantToRead" },
  { title: { en: "The Disconnected", tr: "Tutunamayanlar" }, author: "Oğuz Atay", color: "#3f5f3a", status: "inProgress", progress: 22 },
];

function useSampleLocale(): Locale {
  return useLocale() === "tr" ? "tr" : "en";
}

/* -------------------------------------------------------------------------- */

/** Önizlemenin dış çerçevesi: koyu cam pencere + adres çubuğu. */
export function AppFrame({
  children,
  label,
  className,
}: {
  children: ReactNode;
  /** Ekran okuyucular için: "MyShelfie kütüphane ekranı" */
  label: string;
  className?: string;
}) {
  return (
    <figure
      aria-label={label}
      className={cn(
        "overflow-hidden rounded-card border border-white/12 shadow-panel",
        className
      )}
      style={{
        background: "rgba(10, 8, 6, 0.62)",
        backdropFilter: "blur(24px) saturate(1.2)",
        WebkitBackdropFilter: "blur(24px) saturate(1.2)",
      }}
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3" aria-hidden>
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-white/20" />
          <span className="size-2.5 rounded-full bg-white/20" />
          <span className="size-2.5 rounded-full bg-white/20" />
        </span>
        <span className="mx-auto rounded-full bg-white/[0.07] px-4 py-1 text-[11px] text-white/45">
          myshelfie.space
        </span>
        <span className="w-[42px]" />
      </div>
      {/* Önizleme dekoratif: içindeki öğeler tıklanamaz ve odaklanmaz */}
      <div aria-hidden className="pointer-events-none select-none p-4 sm:p-5">
        {children}
      </div>
    </figure>
  );
}

/** Gerçek ekran görüntüsü varsa onu, yoksa çizilmiş önizlemeyi gösterir. */
export function Screenshot({
  src,
  label,
  children,
  className,
}: {
  src?: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  if (src) {
    return (
      <figure className={cn("overflow-hidden rounded-card border border-white/12 shadow-panel", className)}>
        <Image src={src} alt={label} width={1440} height={960} className="h-auto w-full" />
      </figure>
    );
  }
  return (
    <AppFrame label={label} className={className}>
      {children}
    </AppFrame>
  );
}

/* -------------------------------------------------------------------------- */

function MockCover({
  book,
  className,
  style,
}: {
  book: SampleBook;
  className?: string;
  style?: CSSProperties;
}) {
  const locale = useSampleLocale();
  return (
    <span
      className={cn(
        "relative flex shrink-0 flex-col justify-between overflow-hidden rounded-l-[2px] rounded-r-[4px] p-1.5 ring-1 ring-inset ring-white/10 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.85)]",
        className
      )}
      style={{ backgroundColor: book.color, ...style }}
    >
      <span className="relative z-10 line-clamp-3 font-display text-[9px] font-semibold leading-tight text-white/90">
        {book.title[locale]}
      </span>
      <span className="relative z-10 truncate text-[7px] uppercase tracking-wider text-white/60">
        {book.author}
      </span>
      <span className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-black/55 to-transparent" />
      <span className="absolute inset-y-0 left-[4px] w-px bg-white/20" />
      <span className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-black/25" />
    </span>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          className={cn("h-3 w-3 fill-current", step <= value ? "star-filled" : "star-empty")}
        />
      ))}
    </span>
  );
}

function StatusChip({ status }: { status: SampleBook["status"] }) {
  const t = useTranslations("book.status");
  const tone = {
    completed: "bg-mint/15 text-mint",
    inProgress: "bg-accent-strong/20 text-accent-soft",
    wantToRead: "bg-white/10 text-white/70",
  }[status];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", tone)}>
      {t(status)}
    </span>
  );
}

/* --- Kütüphane ----------------------------------------------------------- */

export function LibraryPreview({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("library");
  const locale = useSampleLocale();
  const books = compact ? BOOKS.slice(0, 4) : BOOKS;

  return (
    <div className="text-white">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-semibold tracking-tight">{t("title")}</p>
        <div className="sf-segmented text-xs">
          <span className="sf-segmented-item px-2.5 py-1 text-xs" aria-current="true">
            {t("filters.all")}
          </span>
          <span className="sf-segmented-item px-2.5 py-1 text-xs">{t("filters.inProgress")}</span>
          <span className="sf-segmented-item px-2.5 py-1 text-xs">{t("filters.completed")}</span>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {books.map((book) => (
          <li
            key={book.author}
            className="flex items-center gap-3 rounded-xl p-2.5"
            style={glassStyle}
          >
            <MockCover book={book} className="h-[60px] w-10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{book.title[locale]}</p>
              <p className="truncate text-xs text-white/55">{book.author}</p>
              {book.progress !== undefined && (
                <div className="mt-1.5 h-1 w-full max-w-[160px] overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-accent-strong" style={{ width: `${book.progress}%` }} />
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <StatusChip status={book.status} />
              {book.rating ? <Stars value={book.rating} /> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --- Kitap arama ---------------------------------------------------------- */

export function SearchPreview() {
  const t = useTranslations("addBook");
  const locale = useSampleLocale();
  const results = [BOOKS[0], BOOKS[3], BOOKS[2]];

  return (
    <div className="text-white">
      <p className="mb-3 text-lg font-semibold tracking-tight">{t("title")}</p>
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2.5">
        <Search className="h-4 w-4 text-white/50" />
        <span className="text-sm text-white">Jane Austen, George Eliot…</span>
        <span className="ml-auto h-4 w-px animate-pulse bg-accent-strong" />
      </div>
      <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
        {t("search.results")}
      </p>
      <ul className="flex flex-col gap-2">
        {results.map((book, index) => (
          <li
            key={book.author}
            className={cn(
              "flex items-center gap-3 rounded-xl p-2.5",
              index === 0 && "ring-1 ring-accent-strong/60"
            )}
            style={glassStyle}
          >
            <MockCover book={book} className="h-[54px] w-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{book.title[locale]}</p>
              <p className="truncate text-xs text-white/55">{book.author}</p>
            </div>
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-base font-semibold",
                index === 0 ? "bg-accent-strong text-on-accent" : "bg-white/10 text-white/70"
              )}
            >
              +
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --- İstatistikler -------------------------------------------------------- */

/* Aylık tamamlanan kitap sayısı (örnek veri). */
const MONTHLY = [1, 2, 1, 3, 2, 2, 4, 3, 1, 2, 3, 2];

export function StatsPreview() {
  const t = useTranslations("stats");
  const locale = useLocale();
  const months = MONTHLY.map((_, index) =>
    new Intl.DateTimeFormat(locale, { month: "narrow" }).format(new Date(2026, index, 1))
  );
  const max = Math.max(...MONTHLY);
  const total = MONTHLY.reduce((sum, value) => sum + value, 0);

  return (
    <div className="text-white">
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl p-3" style={glassStyle}>
          <p className="text-[10px] uppercase tracking-widest text-white/60">{t("completedThisYear")}</p>
          <p className="mt-1.5 font-display text-3xl font-light leading-none">{total}</p>
        </div>
        <div className="rounded-xl p-3" style={glassStyle}>
          <p className="text-[10px] uppercase tracking-widest text-white/60">{t("pagesThisYear")}</p>
          <p className="mt-1.5 font-display text-3xl font-light leading-none">
            {new Intl.NumberFormat(locale).format(8240)}
          </p>
        </div>
      </div>

      <div className="rounded-xl p-3" style={glassStyle}>
        <p className="mb-3 text-sm font-semibold">{t("yearlyStats")}</p>
        <div className="flex h-32 items-end gap-1.5">
          {MONTHLY.map((value, index) => (
            <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <div
                className="w-full rounded-t-[4px] bg-accent-strong"
                style={{ height: `${(value / max) * 100}%`, opacity: index === 6 ? 1 : 0.85 }}
              />
              <span className="text-[9px] text-white/55">{months[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- Hazinem (favoriler + alıntı) ----------------------------------------- */

export function TreasuresPreview() {
  const t = useTranslations("treasures");
  const locale = useSampleLocale();
  const favorites = [BOOKS[0], BOOKS[2], BOOKS[1], BOOKS[4]];

  return (
    <div className="text-white">
      <div className="mb-3 flex items-center gap-2">
        <Heart className="h-4 w-4 fill-current text-accent-strong" />
        <p className="text-sm font-semibold">{t("favorites.title")}</p>
      </div>
      <div className="mb-6 flex gap-3">
        {favorites.map((book) => (
          <MockCover key={book.author} book={book} className="h-[84px] w-14" />
        ))}
      </div>

      <p className="mb-4 text-sm font-semibold">{t("quotes.title")}</p>
      {/* Pride and Prejudice (1813) — kamu malı bir eserden alıntı */}
      <figure className="sf-paper !text-base" style={{ ["--paper-tilt" as string]: "-0.6deg" }}>
        <span aria-hidden className="sf-paper-mark">
          &ldquo;
        </span>
        <blockquote>
          {locale === "tr"
            ? "Ne derseniz deyin, okumak kadar keyifli bir şey yok!"
            : "I declare after all there is no enjoyment like reading!"}
        </blockquote>
        <figcaption className="sf-paper-caption mt-4">
          <span className="sf-paper-caption-title">{BOOKS[0].title[locale]}</span>
          <span className="sf-paper-caption-author"> · Jane Austen</span>
        </figcaption>
      </figure>
    </div>
  );
}

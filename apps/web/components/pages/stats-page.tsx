'use client';

import { useEffect, useMemo, useState } from "react";
import { AuthUser } from "@/lib/authSlice";
import type { Book } from "@shelfie/types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchUserBooks } from "@/lib/booksSlice";
import { CalendarDays } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { MyChart } from "../books/chartx";
import {
  GlassCard,
  SectionHeader,
  PageLoading,
  StatCard,
} from "@/components/ui/glass";
import { isBookFinished } from "@/lib/bookStatus";

interface StatsPageProps {
  user: AuthUser | null;
}


function getRelevantDate(book: Book) {
  return book.endDate || book.dateRead || book.dateAdded;
}

function getBookDate(book: Book) {
  const relevantDate = getRelevantDate(book);

  if (!relevantDate) {
    return null;
  }

  const parsedDate = new Date(relevantDate);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function StatsPage({ user }: StatsPageProps) {
  const t = useTranslations("stats");
  const locale = useLocale();
  const errorT = useTranslations("errors.books");
  const navT = useTranslations("nav");

  const dispatch = useAppDispatch();
  const { books, status, error } = useAppSelector((state) => state.books);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (user) {
      dispatch(fetchUserBooks());
    }
  }, [user, dispatch]);

  const availableYears = useMemo(() => {
    const years = new Set<number>([currentYear]);

    books.forEach((book) => {
      const bookDate = getBookDate(book);
      if (bookDate) {
        years.add(bookDate.getFullYear());
      }
    });

    return Array.from(years).sort((left, right) => right - left);
  }, [books, currentYear]);

  const completedBooks = books.filter((book) => isBookFinished(book));
  const favoriteBooks = books.filter((book) => book.isFavorite);
  const selectedYearCompletedBooks = completedBooks.filter((book) => {
    const bookDate = getBookDate(book);
    return bookDate !== null && bookDate.getFullYear() === selectedYear;
  });

  const pagesThisSelectedYear = selectedYearCompletedBooks.reduce(
    (sum, book) => sum + (book.pages || 0),
    0
  );
  const completionRate = books.length
    ? Math.round((completedBooks.length / books.length) * 100)
    : 0;
  const averagePagesPerCompletedBookInSelectedYear = selectedYearCompletedBooks.length
    ? Math.round(pagesThisSelectedYear / selectedYearCompletedBooks.length)
    : 0;

  if (status === "loading") {
    return <PageLoading label={navT("checkingSession")} />;
  }

  const summaryCards = [
    {
      title: t("stats.totalBooks"),
      value: books.length,
      note: `${books.length - completedBooks.length} ${t("inProgressBooks")}`,
    },
    {
      title: t("completedThisYear"),
      value: selectedYearCompletedBooks.length,
      note: `${selectedYear}`,
    },
    {
      title: t("pagesThisYear"),
      value: pagesThisSelectedYear.toLocaleString(locale),
      note: `${averagePagesPerCompletedBookInSelectedYear} avg / book`,
    },
    {
      title: t("stats.favoriteBooks"),
      value: favoriteBooks.length,
      note: `${completionRate}% ${t("completionRate")}`,
    },
  ];

  return (
    <div className="sf-page">
      <div className="sf-container">
        {/* Sayfa başlığı */}
        <header className="sf-page-header">
          <div>
            <h1 className="sf-title-page">{navT("stats")}</h1>
            <p className="sf-page-header-sub">{t("subtitle")}</p>
          </div>
        </header>

        {/* Özet istatistikler */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <StatCard
              key={card.title}
              label={card.title}
              value={card.value}
              note={card.note}
            />
          ))}
        </div>

        {status === "failed" && (
          <div className="sf-alert-error">
            {error && errorT.has(error) ? errorT(error) : errorT("unknown")}
          </div>
        )}

        {/* Yıllık grafik — başlık dışarıda, grafik cam kartın içinde */}
        <section className="min-w-0">
          <SectionHeader
            title={t("yearlyStats")}
            description={t("yearlyStatsHint")}
            action={
              <label className="sf-pill">
                <CalendarDays className="h-3.5 w-3.5 text-accent-strong" />
                <span>{t("chartYear")}</span>
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                  className="bg-transparent font-semibold text-white outline-none"
                  aria-label={t("chartYear")}
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year} className="bg-stone-900 text-white">
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            }
          />
          <GlassCard>
            <MyChart year={selectedYear} />
          </GlassCard>
        </section>
      </div>
    </div>
  );
}

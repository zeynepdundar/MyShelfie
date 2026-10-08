import type { Locale } from "@/i18n";

/** "YYYY-MM-DD" ya da ISO → "8 Eki 2026" / "Oct 8, 2026". */
export function formatDate(value: string | null | undefined, locale: Locale): string {
  if (!value) return "—";
  const day = value.slice(0, 10);
  const date = new Date(`${day}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

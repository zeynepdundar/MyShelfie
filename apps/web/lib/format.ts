/* Tarih ve sayı biçimleri uygulamanın seçili diline göre yapılır
   (tarayıcının diline ya da sabit "tr-TR"ye göre değil). */

/** "29 Eyl 2026" / "Sep 29, 2026". Geçersiz ya da boşsa null. */
export function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatNumber(value: number, locale: string) {
  return value.toLocaleString(locale);
}

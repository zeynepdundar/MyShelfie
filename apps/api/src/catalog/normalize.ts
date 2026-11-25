/**
 * Katalog için ortak yardımcılar. Hem içe aktarma scriptleri hem de API
 * aynı fonksiyonları kullanır; arama metni iki tarafta da aynı biçimde
 * katlanmazsa eşleşme kaçar.
 */

/**
 * Arama için metni sadeleştirir: Türkçe noktalı/noktasız i farkını, aksanları
 * (ş→s, ğ→g, ç→c, ö→o, ü→u, é→e) ve noktalamayı siler, küçük harfe çevirir.
 *
 * `toLocaleLowerCase("tr")` kullanılmıyor: İngilizce "I" harfini "ı" yapar.
 */
export function foldForSearch(input: string): string {
  return input
    .replace(/[İIı]/g, "i")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Tire/boşluk temizlenmiş, geçerli ISBN-13 döner; geçersizse null. */
export function toIsbn13(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const clean = raw.replace(/[^0-9Xx]/g, "").toUpperCase();

  if (clean.length === 13 && /^\d{13}$/.test(clean)) {
    return isbn13CheckDigit(clean.slice(0, 12)) === clean[12] ? clean : null;
  }

  if (clean.length === 10 && /^\d{9}[\dX]$/.test(clean)) {
    if (isbn10CheckDigit(clean.slice(0, 9)) !== clean[9]) return null;
    const body = `978${clean.slice(0, 9)}`;
    return body + isbn13CheckDigit(body);
  }

  return null;
}

function isbn13CheckDigit(first12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) sum += Number(first12[i]) * (i % 2 === 0 ? 1 : 3);
  return String((10 - (sum % 10)) % 10);
}

function isbn10CheckDigit(first9: string): string {
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(first9[i]) * (10 - i);
  const check = (11 - (sum % 11)) % 11;
  return check === 10 ? "X" : String(check);
}

/** Türkiye'ye ait ISBN-13 önekleri (978-605, 978-975). */
export function isTurkishIsbn(isbn13: string): boolean {
  return isbn13.startsWith("978605") || isbn13.startsWith("978975");
}

export function openLibraryCoverUrl(coverId: number | null | undefined, size: "S" | "M" | "L" = "M") {
  return coverId && coverId > 0 ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : undefined;
}

/** catalog:build'in yazdığı, catalog:load'un okuduğu TSV kolonları (sırası önemli). */
export const CATALOG_TSV_COLUMNS = [
  "id",
  "work_id",
  "lang",
  "isbn13",
  "title",
  "subtitle",
  "authors",
  "cover_id",
  "published_year",
  "pages",
  "publisher",
  "popularity",
] as const;

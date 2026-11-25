export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publishedYear?: number;
  genre?: string;
  rating?: number;
  notes?: string;
  isCompleted: boolean;
  pages: number;
  dateRead?: string | null;
  startDate?: string;
  endDate?: string;
  dateAdded: string;
  coverUrl?: string;
  isFavorite?: boolean;
  /** Sonra okumak üzere kaydedilen kitaplar. */
  wantToRead?: boolean;
  quotes?: Quote[];
}

export interface Quote {
  id: string;
  text: string;
  page?: number;
  dateAdded: string;
  notes?: string;
  bookTitle?: string;
  bookAuthor?: string;
}

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    pageCount?: number;
    imageLinks?: {
      thumbnail?: string;
    };
  };
}

/** MyShelfie kitap kataloğundaki bir baskı (Open Library verisi, /api/catalog). */
export interface CatalogBook {
  /** Open Library baskı anahtarı, ör. "OL7353617M" */
  id: string;
  /** Open Library eser anahtarı, ör. "OL45804W" */
  workId?: string;
  language: "en" | "tr";
  /** ISBN-13 */
  isbn: string;
  title: string;
  subtitle?: string;
  authors: string[];
  coverUrl?: string;
  publishedYear?: number;
  pages?: number;
  publisher?: string;
}

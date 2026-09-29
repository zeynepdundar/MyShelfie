import { notFound } from "next/navigation";

// Tanımlı olmayan her yol (/tr/olmayan-sayfa gibi) buraya düşer ve
// [locale]/not-found.tsx'i, yani uygulamanın kendi 404 sayfasını gösterir.
export default function CatchAllPage() {
  notFound();
}

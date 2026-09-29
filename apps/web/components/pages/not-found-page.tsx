"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass";

/**
 * Bulunamayan sayfa. Hem oturum açmış (sidebar içinde) hem de açmamış
 * (tam ekran) kullanıcıya gösterilir; bu yüzden kendi yüksekliğini ortalar.
 */
export function NotFoundPage() {
  const t = useTranslations("notFound");
  const locale = useLocale();
  const router = useRouter();

  const goBack = () => {
    // Doğrudan bu adrese gelindiyse geri gidilecek bir sayfa yok: ana sayfaya dön.
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${locale}`);
    }
  };

  return (
    <div className="flex min-h-dvh w-full items-center justify-center px-6 py-16">
      <GlassCard
        variant="dark"
        as="section"
        aria-labelledby="not-found-title"
        className="w-full max-w-lg p-8 text-center sm:p-10"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-tile border border-white/20 bg-white/10">
          <Image src="/logo-books.svg" alt="" width={24} height={24} />
        </span>

        <p
          aria-hidden
          className="mt-6 text-7xl font-semibold leading-none tracking-tight text-accent-strong sm:text-8xl"
        >
          404
        </p>

        <h1
          id="not-found-title"
          className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/65 sm:text-base">
          {t("description")}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
            <Link href={`/${locale}`}>
              <BookOpen className="size-4" aria-hidden />
              {t("home")}
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={goBack}
            className="w-full gap-2 sm:w-auto"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("back")}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/** Gizlilik Politikası'na giden küçük metin linki. */
export function PrivacyLink({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("legal");

  return (
    <Link
      href={`/${locale}/privacy`}
      className={cn(
        "underline underline-offset-2 transition-colors hover:text-white",
        className
      )}
    >
      {t("privacyLink")}
    </Link>
  );
}

/** Giriş ekranı gibi yerlerde: "Verilerinin nasıl işlendiğini … bulabilirsin." */
export function PrivacyNotice({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("legal");

  return (
    <p className={cn("text-xs leading-relaxed text-white/50", className)}>
      {t.rich("notice", {
        link: (chunks) => (
          <Link
            href={`/${locale}/privacy`}
            className="underline underline-offset-2 transition-colors hover:text-white"
          >
            {chunks}
          </Link>
        ),
      })}
    </p>
  );
}

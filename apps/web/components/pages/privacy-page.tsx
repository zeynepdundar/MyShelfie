"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { GlassCard } from "@/components/ui/glass";
import {
  privacyContent,
  type PrivacyBlock,
} from "@/components/legal/privacy-content";
import {
  DATA_CONTROLLER,
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_LAST_UPDATED,
} from "@/lib/legal";

/** Metindeki {email} ve {controller} yer tutucularını doldurur. */
function fill(text: string): ReactNode[] {
  return text.split(/(\{email\}|\{controller\})/).map((part, index) => {
    if (part === "{email}") {
      return (
        <a
          key={index}
          href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
          className="font-medium text-accent-strong underline underline-offset-2 hover:opacity-80"
        >
          {PRIVACY_CONTACT_EMAIL}
        </a>
      );
    }
    if (part === "{controller}") {
      return <strong key={index} className="font-semibold text-white">{DATA_CONTROLLER}</strong>;
    }
    return part;
  });
}

function BlockList({ items }: { items: PrivacyBlock[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span
            aria-hidden
            className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-strong"
          />
          <p>
            {item.term && (
              <strong className="font-semibold text-white">{item.term}: </strong>
            )}
            {fill(item.text)}
          </p>
        </li>
      ))}
    </ul>
  );
}

/**
 * Gizlilik Politikası. Oturum açmadan da görülebilir; bu yüzden kendi
 * üst çubuğunu (logo + geri) taşır.
 */
export function PrivacyPage() {
  const locale = useLocale();
  const t = useTranslations("legal");
  const content = privacyContent[locale === "tr" ? "tr" : "en"];

  const updated = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
    new Date(`${PRIVACY_LAST_UPDATED}T12:00:00`)
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-6 lg:pt-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-white">
          <span className="flex size-9 items-center justify-center rounded-tile border border-white/20 bg-white/10 backdrop-blur-md">
            <Image src="/logo-books.svg" alt="" width={20} height={20} />
          </span>
          <span className="font-semibold tracking-tight">Shelfie</span>
        </Link>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("backHome")}
        </Link>
      </div>

      <GlassCard variant="dark" as="article" className="p-6 sm:p-10">
        <header className="border-b border-white/10 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {t("lastUpdated", { date: updated })}
          </p>
          <p className="mt-5 text-base leading-relaxed text-white/80">
            {content.intro}
          </p>
        </header>

        <nav aria-label={t("contents")} className="border-b border-white/10 py-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
            {t("contents")}
          </p>
          <ol className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {content.sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  <span className="mr-2 tabular-nums text-white/35">{index + 1}.</span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-9 pt-8 text-[15px] leading-relaxed text-white/75">
          {content.sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-8">
              <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
                <span className="mr-2 tabular-nums text-accent-strong">{index + 1}.</span>
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.paragraphs?.map((paragraph, i) => (
                  <p key={i}>{fill(paragraph)}</p>
                ))}
                {section.items && <BlockList items={section.items} />}
                {section.after?.map((paragraph, i) => (
                  <p key={`after-${i}`}>{fill(paragraph)}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

import type { Metadata } from "next";

import { PrivacyPage } from "@/components/pages/privacy-page";
import { privacyContent } from "@/components/legal/privacy-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = privacyContent[locale === "tr" ? "tr" : "en"];
  return { title: `${content.title} · Shelfie` };
}

export default function Privacy() {
  return <PrivacyPage />;
}

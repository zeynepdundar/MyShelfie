import type { Metadata } from "next";

import { TermsPage } from "@/components/pages/terms-page";
import { termsContent } from "@/components/legal/terms-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = termsContent[locale === "tr" ? "tr" : "en"];
  return { title: `${content.title} · MyShelfie` };
}

export default function Terms() {
  return <TermsPage />;
}

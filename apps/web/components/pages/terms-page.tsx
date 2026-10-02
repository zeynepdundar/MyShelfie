"use client";

import { LegalDocumentPage } from "@/components/legal/legal-document";
import { termsContent } from "@/components/legal/terms-content";
import { TERMS_LAST_UPDATED } from "@/lib/legal";

/** Kullanım Koşulları. */
export function TermsPage() {
  return <LegalDocumentPage content={termsContent} lastUpdated={TERMS_LAST_UPDATED} />;
}

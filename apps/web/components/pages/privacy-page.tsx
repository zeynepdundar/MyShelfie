"use client";

import { LegalDocumentPage } from "@/components/legal/legal-document";
import { privacyContent } from "@/components/legal/privacy-content";
import { PRIVACY_LAST_UPDATED } from "@/lib/legal";

/** Gizlilik Politikası. */
export function PrivacyPage() {
  return <LegalDocumentPage content={privacyContent} lastUpdated={PRIVACY_LAST_UPDATED} />;
}

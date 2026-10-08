import type { Metadata } from "next";
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import ReduxProvider from '@/components/providers/redux-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import '../globals.css';
import { HomeLayout } from "@/components/layout/HomeLayout";


/** Sitenin herkese açık adresi. Paylaşım önizlemelerindeki mutlak linkler buradan üretilir. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://myshelfie.space";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  const lang = locale === "tr" ? "tr" : "en";
  const description = t("description");
  // Paylaşım önizlemesi (LinkedIn, WhatsApp, X...): görseller public/og/ altında
  const image = {
    url: `/og/${lang}.jpg`,
    width: 1200,
    height: 630,
    alt: "MyShelfie",
  };

  return {
    metadataBase: new URL(SITE_URL),
    title: "MyShelfie",
    description,
    openGraph: {
      type: "website",
      siteName: "MyShelfie",
      title: "MyShelfie",
      description,
      url: `/${lang}`,
      locale: lang === "tr" ? "tr_TR" : "en_US",
      alternateLocale: lang === "tr" ? "en_US" : "tr_TR",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: "MyShelfie",
      description,
      images: [image.url],
    },
    alternates: {
      languages: { en: "/en", tr: "/tr" },
    },
    icons: {
      icon: "/logo-books.svg",
      shortcut: "/logo-books.svg",
      apple: "/logo-books.svg",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReduxProvider>
            <AuthProvider>
              <HomeLayout>{children}</HomeLayout>
            </AuthProvider>
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );  
}

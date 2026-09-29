import type { Metadata } from "next";
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import ReduxProvider from '@/components/providers/redux-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import '../globals.css';
import { HomeLayout } from "@/components/layout/HomeLayout";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: "Shelfie",
    description: t("description"),
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
  params: { locale: 'en' | 'tr' };
}>) {
  const { locale } = await Promise.resolve(params as any);
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

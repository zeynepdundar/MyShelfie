import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import en, { type Messages } from "./en";
import tr from "./tr";

/* Küçük, bağımlılıksız i18n. Web next-intl kullanıyor; anahtar adları ve
   metinler oradakiyle aynı tonda tutuldu. Anahtarlar tipli: t("library.title"). */

export type Locale = "en" | "tr";
export const LOCALES: Locale[] = ["tr", "en"];
export const LOCALE_LABELS: Record<Locale, string> = { tr: "Türkçe", en: "English" };

const dictionaries: Record<Locale, Messages> = { en, tr };
const STORAGE_KEY = "myshelfie.locale";

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<Messages>;
type Params = Record<string, string | number>;

function lookup(dict: Messages, key: string): string {
  const value = key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], dict);
  return typeof value === "string" ? value : key;
}

function format(template: string, params?: Params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}

function deviceLocale(): Locale {
  const code = getLocales()[0]?.languageCode;
  return code === "tr" ? "tr" : "en";
}

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: Params) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(deviceLocale);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "en" || saved === "tr") setLocaleState(saved);
      })
      .catch(() => undefined);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => format(lookup(dictionaries[locale], key), params),
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}

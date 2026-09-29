import {getRequestConfig} from 'next-intl/server';

import nextIntlConfig from '../next-intl.config';

type AppLocale = (typeof nextIntlConfig.locales)[number];

function isAppLocale(value: string | undefined): value is AppLocale {
  return nextIntlConfig.locales.includes(value as AppLocale);
}

// next-intl 4: dil, URL'deki [locale] segmentinden `requestLocale` ile gelir.
// Eski `locale` parametresi burada hep undefined olduğu için her sayfa
// İngilizce mesajlarla açılıyordu.
export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = isAppLocale(requested) ? requested : nextIntlConfig.defaultLocale;
  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages
  };
});

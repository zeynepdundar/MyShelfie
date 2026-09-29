import createMiddleware from 'next-intl/middleware';
import nextIntlConfig from './next-intl.config';

export default createMiddleware(nextIntlConfig);

export const config = {
  // Statik dosyalar (.svg, .jpg…) ve Next'in iç yolları hariç her yol.
  // Böylece /olmayan-sayfa gibi dil öneki olmayan adresler de /en/... altına
  // yönlendirilir ve uygulamanın kendi 404 sayfasını görür.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};



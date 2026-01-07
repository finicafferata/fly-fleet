import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './config';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Never redirect to '/es' for default locale
  localePrefix: 'as-needed'
});

export const config = {
  // Match only internationalized pathnames
  // Exclude: api routes, admin routes, admin-login, Next.js internals, static files, and metadata files
  matcher: [
    '/',
    '/(es|en|pt)/:path*',
    '/((?!api|admin|admin-login|_next|_vercel|icon$|apple-icon$|favicon|.*\\..*).*)'
  ]
};
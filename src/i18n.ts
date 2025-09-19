import {getRequestConfig} from 'next-intl/server';
import { defaultLocale } from './config';

export default getRequestConfig(async ({locale}) => {
  // Handle case where locale is undefined (fallback to default)
  const validLocale = locale || defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
    timeZone: 'America/Argentina/Buenos_Aires'
  };
});
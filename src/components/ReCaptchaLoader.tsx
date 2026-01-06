'use client';

import { useEffect } from 'react';
import Script from 'next/script';

/**
 * ReCaptchaLoader Component
 *
 * Loads Google reCAPTCHA v3 script globally.
 * Must be included in the app layout to enable reCAPTCHA verification.
 */
export function ReCaptchaLoader() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      console.warn('⚠️ NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set');
    }
  }, [siteKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
      strategy="lazyOnload"
      onLoad={() => {
        console.log('✅ reCAPTCHA script loaded');
      }}
      onError={(e) => {
        console.error('❌ Failed to load reCAPTCHA script:', e);
      }}
    />
  );
}

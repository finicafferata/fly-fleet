'use client';

import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface UseRecaptchaReturn {
  executeRecaptcha: (action?: string) => Promise<string>;
  isReady: boolean;
  error: string | null;
}

/**
 * useRecaptcha Hook
 *
 * Provides reCAPTCHA v3 integration for form submissions.
 *
 * @param action - The action name for reCAPTCHA (e.g., 'quote', 'contact')
 * @returns Object with executeRecaptcha function, ready status, and error
 *
 * @example
 * ```tsx
 * const { executeRecaptcha, isReady } = useRecaptcha('quote');
 *
 * const handleSubmit = async () => {
 *   const token = await executeRecaptcha();
 *   // Use token in API call
 * };
 * ```
 */
export function useRecaptcha(defaultAction: string = 'submit'): UseRecaptchaReturn {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      setError('reCAPTCHA site key not configured');
      console.error('❌ NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set');
      return;
    }

    // Wait for grecaptcha to be available
    const checkRecaptcha = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsReady(true);
          setError(null);
          console.log('✅ reCAPTCHA ready');
        });
      } else {
        // Retry after 100ms
        setTimeout(checkRecaptcha, 100);
      }
    };

    checkRecaptcha();
  }, [siteKey]);

  const executeRecaptcha = useCallback(
    async (action: string = defaultAction): Promise<string> => {
      if (!siteKey) {
        throw new Error('reCAPTCHA site key not configured');
      }

      if (!window.grecaptcha) {
        throw new Error('reCAPTCHA not loaded');
      }

      if (!isReady) {
        throw new Error('reCAPTCHA not ready');
      }

      try {
        const token = await window.grecaptcha.execute(siteKey, { action });
        console.log('✅ reCAPTCHA token generated for action:', action);
        return token;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ reCAPTCHA execution failed:', errorMessage);
        setError(errorMessage);
        throw new Error(`reCAPTCHA execution failed: ${errorMessage}`);
      }
    },
    [siteKey, isReady, defaultAction]
  );

  return {
    executeRecaptcha,
    isReady,
    error,
  };
}

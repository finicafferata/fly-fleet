'use client';

import { useEffect, useState } from 'react';

/**
 * ReCAPTCHA Debug Component
 *
 * Shows diagnostic information about reCAPTCHA configuration.
 * REMOVE THIS COMPONENT IN PRODUCTION - FOR DEBUGGING ONLY
 */
export function ReCaptchaDebug() {
  const [diagnostics, setDiagnostics] = useState<any>({});

  useEffect(() => {
    const checkEnv = () => {
      // Check if process exists
      const hasProcess = typeof process !== 'undefined';

      // Try to get the site key
      let siteKey = 'undefined';
      try {
        // @ts-ignore
        siteKey = process?.env?.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'not found';
      } catch (e) {
        siteKey = 'error accessing';
      }

      // Check if grecaptcha loaded
      const hasGrecaptcha = typeof window.grecaptcha !== 'undefined';

      // Check scripts
      const recaptchaScripts = Array.from(document.scripts)
        .filter(s => s.src.includes('recaptcha'))
        .map(s => ({ src: s.src, loaded: true }));

      setDiagnostics({
        hasProcess,
        siteKey,
        hasGrecaptcha,
        scripts: recaptchaScripts,
        timestamp: new Date().toISOString(),
        location: window.location.href,
      });
    };

    // Check immediately
    checkEnv();

    // Check after delay (in case scripts load later)
    setTimeout(checkEnv, 2000);
    setTimeout(checkEnv, 5000);
  }, []);

  if (process.env.NODE_ENV === 'production' && !window.location.search.includes('debug=true')) {
    // Only show in production if ?debug=true is in URL
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      background: '#1e1e1e',
      color: '#00ff00',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '11px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 9999,
      border: '2px solid #00ff00',
      borderRadius: '4px',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#ffff00' }}>
        🔍 reCAPTCHA Debug Info
      </div>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(diagnostics, null, 2)}
      </pre>
    </div>
  );
}

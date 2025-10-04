'use client';

import { useCallback, useRef } from 'react';

export const useAnnouncer = () => {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (typeof window === 'undefined') return;

    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);

    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, []);

  return { announce, announcerRef };
};

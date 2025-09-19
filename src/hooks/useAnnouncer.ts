'use client';

import { useCallback, useRef } from 'react';

export interface AnnouncementOptions {
  priority?: 'polite' | 'assertive';
  delay?: number;
  clear?: boolean;
}

/**
 * Hook for making screen reader announcements
 * Provides WCAG-compliant live region announcements
 */
export function useAnnouncer() {
  const politeRef = useRef<HTMLDivElement | null>(null);
  const assertiveRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback((
    message: string,
    options: AnnouncementOptions = {}
  ) => {
    const {
      priority = 'polite',
      delay = 100,
      clear = true
    } = options;

    const targetRef = priority === 'assertive' ? assertiveRef : politeRef;

    if (!targetRef.current) {
      // Create live region if it doesn't exist
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.setAttribute('class', 'sr-only');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';

      document.body.appendChild(liveRegion);
      targetRef.current = liveRegion;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Clear previous message if requested
    if (clear && targetRef.current.textContent) {
      targetRef.current.textContent = '';
    }

    // Announce new message after delay
    timeoutRef.current = setTimeout(() => {
      if (targetRef.current) {
        targetRef.current.textContent = message;
      }
    }, delay);
  }, []);

  const announcePolite = useCallback((message: string) => {
    announce(message, { priority: 'polite' });
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, { priority: 'assertive' });
  }, [announce]);

  const clear = useCallback(() => {
    if (politeRef.current) {
      politeRef.current.textContent = '';
    }
    if (assertiveRef.current) {
      assertiveRef.current.textContent = '';
    }
  }, []);

  return {
    announce,
    announcePolite,
    announceAssertive,
    clear
  };
}
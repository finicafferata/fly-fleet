'use client';

import React, { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
  clearAfter?: number;
  onMessageCleared?: () => void;
}

/**
 * Live region component for screen reader announcements
 * Provides ARIA live region functionality with automatic message clearing
 */
export function LiveRegion({
  message,
  priority = 'polite',
  atomic = true,
  relevant = 'text',
  className = '',
  clearAfter,
  onMessageCleared,
  ...props
}: LiveRegionProps & React.HTMLAttributes<HTMLDivElement>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (clearAfter && message) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout to clear message
      timeoutRef.current = setTimeout(() => {
        onMessageCleared?.();
      }, clearAfter);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter, onMessageCleared]);

  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={`absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 ${className}`.trim()}
      style={{
        clip: 'rect(0, 0, 0, 0)',
        clipPath: 'inset(50%)'
      }}
      {...props}
    >
      {message}
    </div>
  );
}
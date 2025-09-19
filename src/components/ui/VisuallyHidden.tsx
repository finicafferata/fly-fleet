'use client';

import React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

/**
 * Component that hides content visually but keeps it available to screen readers
 * Implements the standard screen reader only pattern
 */
export function VisuallyHidden({
  children,
  as: Component = 'span',
  className = '',
  ...props
}: VisuallyHiddenProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component
      className={`absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 ${className}`.trim()}
      style={{
        clip: 'rect(0, 0, 0, 0)',
        clipPath: 'inset(50%)'
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
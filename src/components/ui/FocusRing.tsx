'use client';

import React from 'react';
import { clsx } from 'clsx';

interface FocusRingProps {
  children: React.ReactNode;
  className?: string;
  focusClassName?: string;
  within?: boolean;
}

/**
 * Component that provides consistent focus ring styling
 * Supports both direct focus and focus-within patterns
 */
export function FocusRing({
  children,
  className = '',
  focusClassName,
  within = false,
  ...props
}: FocusRingProps & React.HTMLAttributes<HTMLDivElement>) {
  const defaultFocusClass = within
    ? 'focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'
    : 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

  const finalFocusClass = focusClassName || defaultFocusClass;

  return (
    <div
      className={clsx(
        'transition-shadow duration-200',
        finalFocusClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
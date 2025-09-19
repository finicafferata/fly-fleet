'use client';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    disabled,
    className,
    children,
    'aria-pressed': ariaPressed,
    'aria-expanded': ariaExpanded,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    const baseClasses = [
      // Base button styles
      'inline-flex items-center justify-center',
      'font-medium transition-all duration-200',
      'border border-transparent rounded-lg',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'select-none',

      // Minimum touch target for mobile accessibility
      'min-h-[44px]',
    ];

    const variantClasses = {
      primary: [
        'bg-navy-primary text-white',
        'hover:bg-opacity-90 active:bg-opacity-80',
        'disabled:hover:bg-navy-primary',
      ],
      secondary: [
        'bg-transparent text-navy-primary border-navy-primary',
        'hover:bg-navy-primary hover:text-white',
        'active:bg-opacity-90',
        'disabled:hover:bg-transparent disabled:hover:text-navy-primary',
      ],
      ghost: [
        'bg-transparent text-navy-primary',
        'hover:bg-neutral-light',
        'active:bg-neutral-medium active:bg-opacity-20',
        'disabled:hover:bg-transparent',
      ],
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const buttonClasses = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-pressed={ariaPressed}
        aria-expanded={ariaExpanded}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {loading ? (loadingText || 'Loading...') : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
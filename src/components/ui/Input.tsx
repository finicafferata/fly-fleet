'use client';

import React, { forwardRef, useId } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'error';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helpText,
    leftIcon,
    rightIcon,
    variant = 'default',
    className,
    id,
    required,
    ...props
  }, ref) => {
    const inputId = useId();
    const finalId = id || inputId;
    const helpTextId = `${finalId}-help`;
    const errorId = `${finalId}-error`;

    const hasError = Boolean(error);
    const finalVariant = hasError ? 'error' : variant;

    const inputClasses = clsx(
      // Base styles
      'w-full px-3 py-2.5 text-base',
      'border rounded-lg',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-neutral-medium',

      // Minimum touch target for mobile
      'min-h-[44px]',

      // Icon padding adjustments
      {
        'pl-10': leftIcon,
        'pr-10': rightIcon,
      },

      // Variant styles
      {
        'border-neutral-medium bg-white text-black focus:border-accent-blue focus:ring-accent-blue':
          finalVariant === 'default',
        'border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500':
          finalVariant === 'error',
      },

      className
    );

    const wrapperClasses = clsx('relative');

    const iconClasses = clsx(
      'absolute top-1/2 transform -translate-y-1/2',
      'text-neutral-medium pointer-events-none',
      'w-5 h-5'
    );

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={finalId}
            className={clsx(
              'block text-sm font-medium',
              hasError ? 'text-red-700' : 'text-navy-primary'
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className={wrapperClasses}>
          {leftIcon && (
            <div className={clsx(iconClasses, 'left-3')}>
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={finalId}
            className={inputClasses}
            aria-invalid={hasError}
            aria-describedby={clsx({
              [helpTextId]: helpText,
              [errorId]: hasError,
            })}
            aria-required={required}
            {...props}
          />

          {rightIcon && (
            <div className={clsx(iconClasses, 'right-3')}>
              {rightIcon}
            </div>
          )}
        </div>

        {helpText && !hasError && (
          <p
            id={helpTextId}
            className="text-sm text-neutral-medium"
          >
            {helpText}
          </p>
        )}

        {hasError && (
          <p
            id={errorId}
            className="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
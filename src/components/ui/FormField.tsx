'use client';

import React, { useId } from 'react';
import { clsx } from 'clsx';
import { VisuallyHidden } from './VisuallyHidden';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  descriptionClassName?: string;
  hideLabel?: boolean;
  inline?: boolean;
}

/**
 * Accessible form field component with proper labeling and error handling
 * Provides ARIA attributes and screen reader support
 */
export function FormField({
  label,
  children,
  error,
  description,
  required = false,
  className = '',
  labelClassName = '',
  errorClassName = '',
  descriptionClassName = '',
  hideLabel = false,
  inline = false,
  ...props
}: FormFieldProps & React.HTMLAttributes<HTMLDivElement>) {
  const fieldId = useId();
  const errorId = useId();
  const descriptionId = useId();

  const LabelComponent = hideLabel ? VisuallyHidden : 'label';

  return (
    <div
      className={clsx(
        'form-field',
        inline ? 'flex items-center space-x-3' : 'space-y-2',
        className
      )}
      {...props}
    >
      <LabelComponent
        htmlFor={fieldId}
        className={clsx(
          'block text-sm font-medium text-gray-900 dark:text-gray-100',
          inline && 'mb-0',
          labelClassName
        )}
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </LabelComponent>

      <div className={inline ? 'flex-1' : ''}>
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': clsx(
            description && descriptionId,
            error && errorId
          ).trim() || undefined,
          'aria-invalid': error ? 'true' : undefined,
          'aria-required': required ? 'true' : undefined,
          className: clsx(
            'w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
              : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'placeholder-gray-500 dark:placeholder-gray-400',
            (children as any).props?.className
          )
        } as any)}

        {description && (
          <p
            id={descriptionId}
            className={clsx(
              'mt-1 text-sm text-gray-600 dark:text-gray-400',
              descriptionClassName
            )}
          >
            {description}
          </p>
        )}

        {error && (
          <div
            id={errorId}
            role="alert"
            aria-live="polite"
            className={clsx(
              'mt-1 text-sm text-red-600 dark:text-red-400',
              'flex items-start space-x-1',
              errorClassName
            )}
          >
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
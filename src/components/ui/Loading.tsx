'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'current';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-accent-blue',
    white: 'text-white',
    current: 'text-current',
  };

  return (
    <svg
      className={clsx(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
      role="img"
      aria-hidden="false"
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
  );
};

export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = 'Loading...',
  className,
}) => {
  return (
    <div className={clsx('relative', className)}>
      {children}
      {isLoading && (
        <div
          className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10"
          aria-live="polite"
          aria-label={message}
        >
          <div className="flex flex-col items-center space-y-3">
            <Spinner size="lg" />
            <span className="text-sm font-medium text-navy-primary">
              {message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  disabled,
  className,
  onClick,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center px-4 py-2',
        'bg-accent-blue text-white rounded-lg',
        'hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue',
        'transition-colors duration-200',
        'min-h-[44px]',
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Spinner
          size="sm"
          color="white"
          className="mr-2"
        />
      )}
      {isLoading ? loadingText : children}
    </button>
  );
};

export interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className,
  variant = 'text',
}) => {
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  return (
    <div
      className={clsx(
        'animate-pulse bg-neutral-light',
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

export interface LoadingStateProps {
  type: 'spinner' | 'skeleton' | 'dots';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  message,
  size = 'md',
  className,
}) => {
  if (type === 'spinner') {
    return (
      <div className={clsx('flex flex-col items-center space-y-3', className)} aria-live="polite">
        <Spinner size={size} />
        {message && (
          <span className="text-sm font-medium text-navy-primary">
            {message}
          </span>
        )}
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={clsx('flex items-center space-x-1', className)} aria-live="polite">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={clsx(
                'bg-accent-blue rounded-full animate-pulse',
                {
                  'w-2 h-2': size === 'sm',
                  'w-3 h-3': size === 'md',
                  'w-4 h-4': size === 'lg',
                }
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.6s',
              }}
              aria-hidden="true"
            />
          ))}
        </div>
        {message && (
          <span className="ml-3 text-sm font-medium text-navy-primary">
            {message}
          </span>
        )}
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className={clsx('space-y-3', className)} aria-live="polite">
        <LoadingSkeleton height="1.5rem" width="75%" />
        <LoadingSkeleton height="1rem" width="100%" />
        <LoadingSkeleton height="1rem" width="60%" />
        {message && (
          <span className="text-sm font-medium text-navy-primary">
            {message}
          </span>
        )}
      </div>
    );
  }

  return null;
};
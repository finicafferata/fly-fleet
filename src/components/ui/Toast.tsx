'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onDismiss?: (id: string) => void;
  dismissible?: boolean;
}

export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onDismiss?: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onDismiss,
  dismissible = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!duration || isPaused) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss?.(id), 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onDismiss, isPaused]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(id), 300);
  };

  const typeConfig = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      role: 'status' as const,
      ariaLive: 'polite' as const,
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      role: 'alert' as const,
      ariaLive: 'assertive' as const,
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      role: 'alert' as const,
      ariaLive: 'assertive' as const,
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
      role: 'status' as const,
      ariaLive: 'polite' as const,
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={clsx(
        'max-w-sm w-full shadow-medium rounded-lg border pointer-events-auto transition-all duration-300 transform',
        config.bgColor,
        config.borderColor,
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      role={config.role}
      aria-live={config.ariaLive}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      tabIndex={0}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={clsx('flex-shrink-0', config.iconColor)}>
            {config.icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className={clsx('text-sm font-medium', config.titleColor)}>
                {title}
              </p>
            )}
            <p className={clsx('text-sm', config.messageColor, title && 'mt-1')}>
              {message}
            </p>
          </div>
          {dismissible && (
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className={clsx(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  config.iconColor,
                  'hover:opacity-75 focus:ring-accent-blue'
                )}
                onClick={handleDismiss}
                aria-label="Dismiss notification"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
  onDismiss,
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className={clsx(
        'fixed z-50 pointer-events-none',
        positionClasses[position]
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      <div className="flex flex-col space-y-3">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };
}
'use client';

import { useCallback, useRef, useEffect } from 'react';

export interface FocusOptions {
  preventScroll?: boolean;
  delay?: number;
  selector?: string;
}

/**
 * Hook for managing focus for accessibility
 * Provides utilities for focus trapping, restoration, and management
 */
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const trapContainerRef = useRef<HTMLElement | null>(null);

  // Store the currently focused element
  const storeFocus = useCallback(() => {
    if (document.activeElement && document.activeElement !== document.body) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, []);

  // Restore focus to previously stored element
  const restoreFocus = useCallback((options: FocusOptions = {}) => {
    const { preventScroll = false, delay = 0 } = options;

    const focusElement = () => {
      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        try {
          previousFocusRef.current.focus({ preventScroll });
        } catch (error) {
          console.warn('Failed to restore focus:', error);
        }
      }
    };

    if (delay > 0) {
      setTimeout(focusElement, delay);
    } else {
      focusElement();
    }
  }, []);

  // Focus a specific element by ref or selector
  const focusElement = useCallback((
    target: HTMLElement | string,
    options: FocusOptions = {}
  ) => {
    const { preventScroll = false, delay = 0 } = options;

    const doFocus = () => {
      let element: HTMLElement | null = null;

      if (typeof target === 'string') {
        element = document.querySelector(target) as HTMLElement;
      } else {
        element = target;
      }

      if (element) {
        try {
          element.focus({ preventScroll });
        } catch (error) {
          console.warn('Failed to focus element:', error);
        }
      }
    };

    if (delay > 0) {
      setTimeout(doFocus, delay);
    } else {
      doFocus();
    }
  }, []);

  // Focus the first focusable element in a container
  const focusFirst = useCallback((
    container: HTMLElement | string,
    options: FocusOptions = {}
  ) => {
    const containerElement = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container;

    if (!containerElement) return;

    const focusableElements = getFocusableElements(containerElement);
    if (focusableElements.length > 0) {
      focusElement(focusableElements[0], options);
    }
  }, [focusElement]);

  // Focus the last focusable element in a container
  const focusLast = useCallback((
    container: HTMLElement | string,
    options: FocusOptions = {}
  ) => {
    const containerElement = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container;

    if (!containerElement) return;

    const focusableElements = getFocusableElements(containerElement);
    if (focusableElements.length > 0) {
      focusElement(focusableElements[focusableElements.length - 1], options);
    }
  }, [focusElement]);

  // Set up focus trap within a container
  const trapFocus = useCallback((container: HTMLElement) => {
    trapContainerRef.current = container;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      trapContainerRef.current = null;
    };
  }, []);

  // Remove focus trap
  const releaseFocusTrap = useCallback(() => {
    trapContainerRef.current = null;
  }, []);

  return {
    storeFocus,
    restoreFocus,
    focusElement,
    focusFirst,
    focusLast,
    trapFocus,
    releaseFocusTrap
  };
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  const elements = Array.from(
    container.querySelectorAll(focusableSelectors)
  ) as HTMLElement[];

  return elements.filter(element => {
    return isVisible(element) && !element.hasAttribute('disabled');
  });
}

/**
 * Check if an element is visible
 */
function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
}
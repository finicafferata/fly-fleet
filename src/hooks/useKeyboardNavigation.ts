'use client';

import { useCallback, useEffect, useRef } from 'react';

export interface KeyboardNavigationOptions {
  container?: HTMLElement | null;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
  preventDefault?: boolean;
  onEscape?: () => void;
  onEnter?: (element: HTMLElement) => void;
  onSpace?: (element: HTMLElement) => void;
}

/**
 * Hook for implementing keyboard navigation patterns
 * Supports arrow key navigation, escape handling, and custom key actions
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    container,
    loop = true,
    orientation = 'both',
    preventDefault = true,
    onEscape,
    onEnter,
    onSpace
  } = options;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const navigateToIndex = useCallback((
    elements: HTMLElement[],
    currentIndex: number,
    direction: 'next' | 'previous'
  ) => {
    if (elements.length === 0) return -1;

    let newIndex = currentIndex;

    if (direction === 'next') {
      newIndex = currentIndex + 1;
      if (newIndex >= elements.length) {
        newIndex = loop ? 0 : elements.length - 1;
      }
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = loop ? elements.length - 1 : 0;
      }
    }

    elements[newIndex]?.focus();
    return newIndex;
  }, [loop]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const currentContainer = optionsRef.current.container || document.body;
    const focusableElements = getFocusableElementsForNavigation(currentContainer);

    if (focusableElements.length === 0) return;

    const currentIndex = focusableElements.findIndex(
      element => element === document.activeElement
    );

    if (currentIndex === -1) return;

    const currentElement = focusableElements[currentIndex];

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          if (preventDefault) event.preventDefault();
          navigateToIndex(focusableElements, currentIndex, 'next');
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          if (preventDefault) event.preventDefault();
          navigateToIndex(focusableElements, currentIndex, 'previous');
        }
        break;

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          if (preventDefault) event.preventDefault();
          navigateToIndex(focusableElements, currentIndex, 'next');
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          if (preventDefault) event.preventDefault();
          navigateToIndex(focusableElements, currentIndex, 'previous');
        }
        break;

      case 'Home':
        if (preventDefault) event.preventDefault();
        focusableElements[0]?.focus();
        break;

      case 'End':
        if (preventDefault) event.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
        break;

      case 'Escape':
        if (onEscape) {
          if (preventDefault) event.preventDefault();
          onEscape();
        }
        break;

      case 'Enter':
        if (onEnter && currentElement) {
          if (preventDefault) event.preventDefault();
          onEnter(currentElement);
        }
        break;

      case ' ':
        if (onSpace && currentElement) {
          if (preventDefault) event.preventDefault();
          onSpace(currentElement);
        }
        break;
    }
  }, [navigateToIndex, orientation, preventDefault, onEscape, onEnter, onSpace]);

  useEffect(() => {
    const targetContainer = container || document.body;
    targetContainer.addEventListener('keydown', handleKeyDown);

    return () => {
      targetContainer.removeEventListener('keydown', handleKeyDown);
    };
  }, [container, handleKeyDown]);

  const focusFirst = useCallback(() => {
    const currentContainer = optionsRef.current.container || document.body;
    const focusableElements = getFocusableElementsForNavigation(currentContainer);
    focusableElements[0]?.focus();
  }, []);

  const focusLast = useCallback(() => {
    const currentContainer = optionsRef.current.container || document.body;
    const focusableElements = getFocusableElementsForNavigation(currentContainer);
    focusableElements[focusableElements.length - 1]?.focus();
  }, []);

  const focusNext = useCallback(() => {
    const currentContainer = optionsRef.current.container || document.body;
    const focusableElements = getFocusableElementsForNavigation(currentContainer);
    const currentIndex = focusableElements.findIndex(
      element => element === document.activeElement
    );

    if (currentIndex !== -1) {
      navigateToIndex(focusableElements, currentIndex, 'next');
    }
  }, [navigateToIndex]);

  const focusPrevious = useCallback(() => {
    const currentContainer = optionsRef.current.container || document.body;
    const focusableElements = getFocusableElementsForNavigation(currentContainer);
    const currentIndex = focusableElements.findIndex(
      element => element === document.activeElement
    );

    if (currentIndex !== -1) {
      navigateToIndex(focusableElements, currentIndex, 'previous');
    }
  }, [navigateToIndex]);

  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious
  };
}

/**
 * Get focusable elements specifically for keyboard navigation
 */
function getFocusableElementsForNavigation(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
    '[role="menuitem"]:not([disabled])',
    '[role="option"]:not([disabled])',
    '[role="tab"]:not([disabled])',
    '[role="checkbox"]:not([disabled])',
    '[role="radio"]:not([disabled])'
  ].join(', ');

  const elements = Array.from(
    container.querySelectorAll(focusableSelectors)
  ) as HTMLElement[];

  return elements.filter(element => {
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      !element.hasAttribute('disabled')
    );
  });
}
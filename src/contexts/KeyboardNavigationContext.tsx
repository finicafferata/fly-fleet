'use client';

import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { useAccessibility } from './AccessibilityContext';

interface KeyboardNavigationContextType {
  isKeyboardUser: boolean;
  currentFocusIndex: number;
  registerNavigableElement: (element: HTMLElement, group?: string) => void;
  unregisterNavigableElement: (element: HTMLElement, group?: string) => void;
  moveFocus: (direction: 'next' | 'previous' | 'first' | 'last', group?: string) => void;
  activateElement: (element?: HTMLElement) => void;
  setNavigationMode: (mode: 'grid' | 'list' | 'tablist' | 'menu') => void;
  navigationMode: 'grid' | 'list' | 'tablist' | 'menu';
  enableRovingTabIndex: (group: string, orientation?: 'horizontal' | 'vertical' | 'both') => void;
  disableRovingTabIndex: (group: string) => void;
}

interface NavigableElement {
  element: HTMLElement;
  group: string;
  index: number;
}

interface RovingTabIndexGroup {
  orientation: 'horizontal' | 'vertical' | 'both';
  activeIndex: number;
  elements: HTMLElement[];
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | undefined>(undefined);

export function KeyboardNavigationProvider({ children }: { children: React.ReactNode }) {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [navigationMode, setNavigationMode] = useState<'grid' | 'list' | 'tablist' | 'menu'>('list');

  const { announce } = useAccessibility();
  const navigableElementsRef = useRef<Map<string, NavigableElement[]>>(new Map());
  const rovingTabIndexGroupsRef = useRef<Map<string, RovingTabIndexGroup>>(new Map());

  // Detect keyboard usage
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Consider user a keyboard user if they use navigation keys
      if (['Tab', 'Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      // Reset keyboard user status on mouse interaction
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Global keyboard event handler
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (!isKeyboardUser) return;

      // Handle global keyboard shortcuts
      switch (event.key) {
        case 'F6':
          event.preventDefault();
          // Navigate between page regions
          navigateToNextRegion(event.shiftKey);
          break;

        case 'Escape':
          // Close modals, dropdowns, etc.
          handleEscapeKey();
          break;
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isKeyboardUser]);

  const registerNavigableElement = useCallback((element: HTMLElement, group = 'default') => {
    const elements = navigableElementsRef.current.get(group) || [];
    const newElement: NavigableElement = {
      element,
      group,
      index: elements.length
    };

    elements.push(newElement);
    navigableElementsRef.current.set(group, elements);

    // Set up element event listeners
    element.addEventListener('focus', () => {
      setCurrentFocusIndex(newElement.index);
    });
  }, []);

  const unregisterNavigableElement = useCallback((element: HTMLElement, group = 'default') => {
    const elements = navigableElementsRef.current.get(group) || [];
    const filteredElements = elements.filter(item => item.element !== element);

    // Reindex remaining elements
    filteredElements.forEach((item, index) => {
      item.index = index;
    });

    navigableElementsRef.current.set(group, filteredElements);
  }, []);

  const moveFocus = useCallback((direction: 'next' | 'previous' | 'first' | 'last', group = 'default') => {
    const elements = navigableElementsRef.current.get(group) || [];
    if (elements.length === 0) return;

    let newIndex: number;

    switch (direction) {
      case 'next':
        newIndex = (currentFocusIndex + 1) % elements.length;
        break;
      case 'previous':
        newIndex = currentFocusIndex > 0 ? currentFocusIndex - 1 : elements.length - 1;
        break;
      case 'first':
        newIndex = 0;
        break;
      case 'last':
        newIndex = elements.length - 1;
        break;
      default:
        return;
    }

    const targetElement = elements[newIndex];
    if (targetElement) {
      targetElement.element.focus();
      setCurrentFocusIndex(newIndex);

      // Announce navigation for screen readers
      const elementDescription = getElementDescription(targetElement.element);
      announce(`Focused ${elementDescription}`, { priority: 'polite' });
    }
  }, [currentFocusIndex, announce]);

  const activateElement = useCallback((element?: HTMLElement) => {
    const target = element || document.activeElement as HTMLElement;
    if (!target) return;

    // Trigger click or appropriate activation
    if (target.tagName === 'BUTTON' || target.tagName === 'A') {
      target.click();
    } else if (target.tagName === 'INPUT') {
      const input = target as HTMLInputElement;
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = !input.checked;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Announce activation
    const description = getElementDescription(target);
    announce(`Activated ${description}`, { priority: 'assertive' });
  }, [announce]);

  const enableRovingTabIndex = useCallback((group: string, orientation: 'horizontal' | 'vertical' | 'both' = 'horizontal') => {
    const existingGroup = rovingTabIndexGroupsRef.current.get(group);
    if (existingGroup) {
      existingGroup.orientation = orientation;
      return;
    }

    const newGroup: RovingTabIndexGroup = {
      orientation,
      activeIndex: 0,
      elements: []
    };

    rovingTabIndexGroupsRef.current.set(group, newGroup);

    // Set up roving tab index behavior
    const handleKeyDown = (event: KeyboardEvent) => {
      const group = rovingTabIndexGroupsRef.current.get(group);
      if (!group || group.elements.length === 0) return;

      let handled = false;
      let newIndex = group.activeIndex;

      switch (event.key) {
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = (group.activeIndex + 1) % group.elements.length;
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = group.activeIndex > 0 ? group.activeIndex - 1 : group.elements.length - 1;
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = (group.activeIndex + 1) % group.elements.length;
            handled = true;
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = group.activeIndex > 0 ? group.activeIndex - 1 : group.elements.length - 1;
            handled = true;
          }
          break;
        case 'Home':
          newIndex = 0;
          handled = true;
          break;
        case 'End':
          newIndex = group.elements.length - 1;
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        updateRovingTabIndex(group, newIndex);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
  }, []);

  const disableRovingTabIndex = useCallback((group: string) => {
    rovingTabIndexGroupsRef.current.delete(group);
  }, []);

  const updateRovingTabIndex = useCallback((groupName: string, newActiveIndex: number) => {
    const group = rovingTabIndexGroupsRef.current.get(groupName);
    if (!group) return;

    // Update tab indices
    group.elements.forEach((element, index) => {
      element.setAttribute('tabindex', index === newActiveIndex ? '0' : '-1');
      if (index === newActiveIndex) {
        element.focus();
      }
    });

    group.activeIndex = newActiveIndex;
  }, []);

  const navigateToNextRegion = useCallback((reverse = false) => {
    const regions = [
      document.getElementById('main-navigation'),
      document.getElementById('main-content'),
      document.getElementById('footer')
    ].filter(Boolean) as HTMLElement[];

    if (regions.length === 0) return;

    const currentRegion = regions.find(region => region.contains(document.activeElement));
    let nextIndex = 0;

    if (currentRegion) {
      const currentIndex = regions.indexOf(currentRegion);
      nextIndex = reverse
        ? (currentIndex > 0 ? currentIndex - 1 : regions.length - 1)
        : (currentIndex + 1) % regions.length;
    }

    const nextRegion = regions[nextIndex];
    const firstFocusable = nextRegion.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;

    if (firstFocusable) {
      firstFocusable.focus();
      announce(`Navigated to ${getRegionName(nextRegion)}`, { priority: 'polite' });
    }
  }, [announce]);

  const handleEscapeKey = useCallback(() => {
    // Close any open modals, dropdowns, or overlays
    const modals = document.querySelectorAll('[role="dialog"], [aria-modal="true"]');
    const dropdowns = document.querySelectorAll('[aria-expanded="true"]');

    if (modals.length > 0) {
      const lastModal = modals[modals.length - 1] as HTMLElement;
      const closeButton = lastModal.querySelector('[aria-label*="close"], [aria-label*="Close"], .close') as HTMLElement;
      closeButton?.click();
      announce('Modal closed', { priority: 'polite' });
    } else if (dropdowns.length > 0) {
      dropdowns.forEach(dropdown => {
        (dropdown as HTMLElement).setAttribute('aria-expanded', 'false');
      });
      announce('Dropdown closed', { priority: 'polite' });
    }
  }, [announce]);

  const contextValue: KeyboardNavigationContextType = {
    isKeyboardUser,
    currentFocusIndex,
    registerNavigableElement,
    unregisterNavigableElement,
    moveFocus,
    activateElement,
    setNavigationMode,
    navigationMode,
    enableRovingTabIndex,
    disableRovingTabIndex
  };

  return (
    <KeyboardNavigationContext.Provider value={contextValue}>
      {children}
    </KeyboardNavigationContext.Provider>
  );
}

export function useKeyboardNavigation() {
  const context = useContext(KeyboardNavigationContext);
  if (context === undefined) {
    throw new Error('useKeyboardNavigation must be used within a KeyboardNavigationProvider');
  }
  return context;
}

// Utility functions
function getElementDescription(element: HTMLElement): string {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  const ariaLabel = element.getAttribute('aria-label');
  const textContent = element.textContent?.trim();

  if (ariaLabel) return ariaLabel;
  if (role) return `${role} ${textContent || ''}`.trim();
  if (textContent) return `${tagName} ${textContent}`;
  return tagName;
}

function getRegionName(region: HTMLElement): string {
  const ariaLabel = region.getAttribute('aria-label');
  const ariaLabelledBy = region.getAttribute('aria-labelledby');
  const id = region.id;

  if (ariaLabel) return ariaLabel;
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) return labelElement.textContent || '';
  }
  if (id) return id.replace(/-/g, ' ');

  return region.tagName.toLowerCase();
}

// Hook for keyboard event handling within components
export function useKeyboardEvents(
  handlers: {
    onEnter?: (event: KeyboardEvent) => void;
    onSpace?: (event: KeyboardEvent) => void;
    onEscape?: (event: KeyboardEvent) => void;
    onArrowUp?: (event: KeyboardEvent) => void;
    onArrowDown?: (event: KeyboardEvent) => void;
    onArrowLeft?: (event: KeyboardEvent) => void;
    onArrowRight?: (event: KeyboardEvent) => void;
    onHome?: (event: KeyboardEvent) => void;
    onEnd?: (event: KeyboardEvent) => void;
    onTab?: (event: KeyboardEvent) => void;
  },
  elementRef?: React.RefObject<HTMLElement>
) {
  useEffect(() => {
    const element = elementRef?.current || document;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          handlers.onEnter?.(event);
          break;
        case ' ':
        case 'Space':
          handlers.onSpace?.(event);
          break;
        case 'Escape':
          handlers.onEscape?.(event);
          break;
        case 'ArrowUp':
          handlers.onArrowUp?.(event);
          break;
        case 'ArrowDown':
          handlers.onArrowDown?.(event);
          break;
        case 'ArrowLeft':
          handlers.onArrowLeft?.(event);
          break;
        case 'ArrowRight':
          handlers.onArrowRight?.(event);
          break;
        case 'Home':
          handlers.onHome?.(event);
          break;
        case 'End':
          handlers.onEnd?.(event);
          break;
        case 'Tab':
          handlers.onTab?.(event);
          break;
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [handlers, elementRef]);
}
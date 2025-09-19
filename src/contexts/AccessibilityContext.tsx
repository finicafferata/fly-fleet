'use client';

import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { LiveRegion } from '../components/ui/LiveRegion';

interface AccessibilityContextType {
  announce: (message: string, options?: AnnouncementOptions) => void;
  announceAssertive: (message: string) => void;
  announcePolite: (message: string) => void;
  setScreenReaderMode: (enabled: boolean) => void;
  isScreenReaderMode: boolean;
  skipToContent: () => void;
  skipToNavigation: () => void;
  skipToFooter: () => void;
  setLiveRegionMessage: (message: string, priority?: 'polite' | 'assertive') => void;
}

interface AnnouncementOptions {
  priority?: 'polite' | 'assertive';
  delay?: number;
  clearAfter?: number;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [isScreenReaderMode, setIsScreenReaderMode] = useState(false);
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const politeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const assertiveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect screen reader usage
  useEffect(() => {
    const detectScreenReader = () => {
      // Check for screen reader indicators
      const hasScreenReaderClasses = document.documentElement.classList.contains('sr-only') ||
        document.documentElement.classList.contains('screen-reader');

      // Check for reduced motion preference (often enabled with screen readers)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Check for keyboard navigation
      const hasKeyboardFocus = document.activeElement !== document.body;

      // Set screen reader mode if any indicators are present
      setIsScreenReaderMode(hasScreenReaderClasses || prefersReducedMotion || hasKeyboardFocus);
    };

    // Initial detection
    detectScreenReader();

    // Listen for keyboard events (screen reader users typically navigate via keyboard)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' || event.key === 'Enter' || event.key.startsWith('Arrow')) {
        setIsScreenReaderMode(true);
      }
    };

    // Listen for focus events
    const handleFocus = () => {
      setIsScreenReaderMode(true);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focus', handleFocus, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focus', handleFocus, true);
    };
  }, []);

  const announce = useCallback((message: string, options: AnnouncementOptions = {}) => {
    const { priority = 'polite', delay = 0, clearAfter = 5000 } = options;

    const makeAnnouncement = () => {
      if (priority === 'assertive') {
        if (assertiveTimeoutRef.current) {
          clearTimeout(assertiveTimeoutRef.current);
        }
        setAssertiveMessage(message);

        if (clearAfter > 0) {
          assertiveTimeoutRef.current = setTimeout(() => {
            setAssertiveMessage('');
          }, clearAfter);
        }
      } else {
        if (politeTimeoutRef.current) {
          clearTimeout(politeTimeoutRef.current);
        }
        setPoliteMessage(message);

        if (clearAfter > 0) {
          politeTimeoutRef.current = setTimeout(() => {
            setPoliteMessage('');
          }, clearAfter);
        }
      }
    };

    if (delay > 0) {
      setTimeout(makeAnnouncement, delay);
    } else {
      makeAnnouncement();
    }
  }, []);

  const announceAssertive = useCallback((message: string) => {
    announce(message, { priority: 'assertive' });
  }, [announce]);

  const announcePolite = useCallback((message: string) => {
    announce(message, { priority: 'polite' });
  }, [announce]);

  const setLiveRegionMessage = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announce(message, { priority });
  }, [announce]);

  const skipToContent = useCallback(() => {
    const mainContent = document.getElementById('main-content') || document.querySelector('main');
    if (mainContent) {
      mainContent.focus({ preventScroll: false });
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      announce('Skipped to main content', { priority: 'polite' });
    }
  }, [announce]);

  const skipToNavigation = useCallback(() => {
    const navigation = document.getElementById('main-navigation') || document.querySelector('nav');
    if (navigation) {
      navigation.focus({ preventScroll: false });
      navigation.scrollIntoView({ behavior: 'smooth', block: 'start' });
      announce('Skipped to navigation', { priority: 'polite' });
    }
  }, [announce]);

  const skipToFooter = useCallback(() => {
    const footer = document.getElementById('footer') || document.querySelector('footer');
    if (footer) {
      footer.focus({ preventScroll: false });
      footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      announce('Skipped to footer', { priority: 'polite' });
    }
  }, [announce]);

  const contextValue: AccessibilityContextType = {
    announce,
    announceAssertive,
    announcePolite,
    setScreenReaderMode: setIsScreenReaderMode,
    isScreenReaderMode,
    skipToContent,
    skipToNavigation,
    skipToFooter,
    setLiveRegionMessage
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (politeTimeoutRef.current) {
        clearTimeout(politeTimeoutRef.current);
      }
      if (assertiveTimeoutRef.current) {
        clearTimeout(assertiveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}

      {/* Global Live Regions */}
      <LiveRegion
        message={politeMessage}
        priority="polite"
        onMessageCleared={() => setPoliteMessage('')}
      />

      <LiveRegion
        message={assertiveMessage}
        priority="assertive"
        onMessageCleared={() => setAssertiveMessage('')}
      />

      {/* Skip Links */}
      <div className="skip-links fixed top-0 left-0 z-50">
        <a
          href="#main-content"
          onClick={(e) => {
            e.preventDefault();
            skipToContent();
          }}
          className={`
            absolute top-0 left-0 bg-blue-600 text-white px-4 py-2 rounded-br-md
            transform -translate-y-full focus:translate-y-0 transition-transform
            focus:outline-none focus:ring-2 focus:ring-blue-300
            text-sm font-medium z-50
          `}
        >
          Skip to main content
        </a>
        <a
          href="#main-navigation"
          onClick={(e) => {
            e.preventDefault();
            skipToNavigation();
          }}
          className={`
            absolute top-0 left-20 bg-blue-600 text-white px-4 py-2 rounded-br-md
            transform -translate-y-full focus:translate-y-0 transition-transform
            focus:outline-none focus:ring-2 focus:ring-blue-300
            text-sm font-medium z-50
          `}
        >
          Skip to navigation
        </a>
        <a
          href="#footer"
          onClick={(e) => {
            e.preventDefault();
            skipToFooter();
          }}
          className={`
            absolute top-0 left-40 bg-blue-600 text-white px-4 py-2 rounded-br-md
            transform -translate-y-full focus:translate-y-0 transition-transform
            focus:outline-none focus:ring-2 focus:ring-blue-300
            text-sm font-medium z-50
          `}
        >
          Skip to footer
        </a>
      </div>

      {/* Screen Reader Announcements for Page Changes */}
      {isScreenReaderMode && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          id="page-status"
        >
          Screen reader mode detected. Enhanced accessibility features are active.
        </div>
      )}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// High-order component for adding accessibility features to pages
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    pageTitle?: string;
    skipToContentId?: string;
    announcePageLoad?: boolean;
  }
) {
  const WrappedComponent = (props: P) => {
    const { announce } = useAccessibility();
    const { pageTitle, announcePageLoad = true } = options || {};

    useEffect(() => {
      if (announcePageLoad && pageTitle) {
        // Announce page load to screen readers
        announce(`Page loaded: ${pageTitle}`, {
          priority: 'polite',
          delay: 500 // Small delay to ensure page is ready
        });
      }
    }, [announce, pageTitle, announcePageLoad]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withAccessibility(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for managing focus trapping (useful for modals, dropdowns)
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the container
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element
    firstElement?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus when trap is deactivated
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}
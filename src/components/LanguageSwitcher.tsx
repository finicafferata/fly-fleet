'use client';

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Select } from './ui/Select';

export interface Language {
  code: 'en' | 'es' | 'pt';
  name: string;
  nativeName: string;
  flag: string;
  label: string;
}

export interface LanguageSwitcherProps {
  currentLocale: 'en' | 'es' | 'pt';
  variant?: 'dropdown' | 'inline';
  className?: string;
  onLanguageChange?: (locale: string) => void;
  showFlags?: boolean;
  showNativeNames?: boolean;
  onPageReload?: () => void;
  onBreadcrumbUpdate?: (locale: string) => void;
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    label: 'English',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    label: 'Spanish',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    label: 'Portuguese',
  },
];

export function LanguageSwitcher({
  currentLocale,
  variant = 'dropdown',
  className,
  onLanguageChange,
  showFlags = true,
  showNativeNames = true,
  onPageReload,
  onBreadcrumbUpdate,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(
    languages.find(lang => lang.code === currentLocale) || languages[0]
  );
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [announcement, setAnnouncement] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Detect mobile device and high contrast mode
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update selected language when currentLocale changes
  useEffect(() => {
    const newLanguage = languages.find(lang => lang.code === currentLocale);
    if (newLanguage) {
      setSelectedLanguage(newLanguage);
    }
  }, [currentLocale]);

  // Focus management for menu
  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      menuItemRefs.current[activeIndex]?.focus();
    }
  }, [activeIndex, isOpen]);

  // Handle language selection with enhanced features
  const switchLanguage = async (languageCode: string) => {
    const language = languages.find(lang => lang.code === languageCode);
    if (!language) return;

    const previousLanguage = selectedLanguage;
    setSelectedLanguage(language);
    setIsOpen(false);
    setActiveIndex(-1);

    // Announce language change to screen readers
    const changeAnnouncement = `Language changed from ${previousLanguage.label} to ${language.label}`;
    setAnnouncement(changeAnnouncement);

    // Persist selection in localStorage with user preference respect
    try {
      localStorage.setItem('fly-fleet-locale', language.code);
      localStorage.setItem('fly-fleet-locale-timestamp', Date.now().toString());
    } catch (error) {
      console.warn('Could not save language preference:', error);
    }

    // Enhanced analytics tracking with A11y features
    const analyticsData = {
      from: currentLocale,
      to: language.code,
      timestamp: Date.now(),
      method: 'language-switcher',
      variant,
      deviceType: isMobile ? 'mobile' : 'desktop',
      accessibilityFeatures: {
        screenReaderUsed: 'speechSynthesis' in window,
        highContrastMode: window.matchMedia('(prefers-contrast: high)').matches,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        keyboardNavigation: activeIndex >= 0,
      },
      userJourney: {
        previousPage: document.referrer,
        currentPath: window.location.pathname,
        sessionId: sessionStorage.getItem('session-id') || 'anonymous',
      },
    };

    // Track analytics (placeholder for actual implementation)
    console.log('Language switch analytics:', analyticsData);

    // Update breadcrumbs for new language
    onBreadcrumbUpdate?.(language.code);

    // Call the main callback
    onLanguageChange?.(language.code);

    // Clear announcement after delay
    setTimeout(() => {
      setAnnouncement('');
    }, 3000);

    // Check if page reload is needed and notify
    if (onPageReload) {
      setAnnouncement('Page will reload to apply language changes');
      setTimeout(() => {
        onPageReload();
      }, 1000);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Enhanced keyboard navigation for menu
  const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        triggerRef.current?.focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        if (!isOpen) {
          setActiveIndex(0);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveIndex(0);
        } else {
          setActiveIndex(0);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveIndex(languages.length - 1);
        } else {
          setActiveIndex(languages.length - 1);
        }
        break;
    }
  };

  // Arrow key navigation within menu
  const handleMenuKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index + 1) % languages.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(index === 0 ? languages.length - 1 : index - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        switchLanguage(languages[index].code);
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        // Allow normal tab behavior to move focus out of menu
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Mobile variant with enhanced accessibility
  if (isMobile || variant === 'dropdown') {
    const selectOptions = languages.map(lang => ({
      value: lang.code,
      label: showFlags
        ? `${lang.flag} ${showNativeNames ? lang.nativeName : lang.name}`
        : showNativeNames
        ? lang.nativeName
        : lang.name,
    }));

    return (
      <div className={clsx('relative', className)}>
        <Select
          options={selectOptions}
          value={selectedLanguage.code}
          onChange={(value) => switchLanguage(value)}
          placeholder="Select language"
          aria-label="Choose language"
          className="min-w-[120px]"
        />

        {/* Live region for announcements */}
        {announcement && (
          <div
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {announcement}
          </div>
        )}
      </div>
    );
  }

  // Desktop inline variant with proper menu structure
  return (
    <div
      ref={dropdownRef}
      className={clsx('language-switcher relative inline-block', className)}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setActiveIndex(0);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className={clsx(
          'language-trigger inline-flex items-center space-x-2 px-3 py-2',
          'text-sm font-medium text-navy-primary',
          'border border-neutral-medium rounded-lg',
          'hover:bg-neutral-light hover:border-accent-blue',
          'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
          'transition-colors duration-200',
          'min-h-[44px]',
          // Navy blue active states
          isOpen && 'bg-accent-blue text-white border-accent-blue',
          // High contrast mode compatibility
          'contrast-more:border-black contrast-more:text-black'
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-labelledby="language-label"
      >
        <span id="language-label" className="sr-only">
          Current language: {selectedLanguage.label}, click to change language
        </span>

        {showFlags && (
          <span aria-hidden="true" className="text-lg">
            {selectedLanguage.flag}
          </span>
        )}

        <span aria-hidden="true">
          {(showNativeNames ? selectedLanguage.nativeName : selectedLanguage.name).toUpperCase()}
        </span>

        <svg
          className={clsx(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180',
            // Respect motion preferences
            'motion-reduce:transition-none'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          role="menu"
          className={clsx(
            'language-dropdown absolute top-full left-0 mt-1 z-50',
            'bg-white border border-neutral-medium rounded-lg shadow-medium',
            'min-w-full overflow-hidden',
            // High contrast mode compatibility
            'contrast-more:border-black contrast-more:bg-white'
          )}
          aria-label="Available languages"
        >
          {languages.map((language, index) => (
            <li role="none" key={language.code}>
              <button
                ref={(el) => (menuItemRefs.current[index] = el)}
                type="button"
                role="menuitem"
                onClick={() => switchLanguage(language.code)}
                onKeyDown={(e) => handleMenuKeyDown(e, index)}
                className={clsx(
                  'w-full px-3 py-3 text-left',
                  'flex items-center space-x-3',
                  'hover:bg-neutral-light',
                  'focus:outline-none focus:bg-accent-blue focus:text-white',
                  'transition-colors duration-150',
                  'min-h-[44px]',
                  // Navy blue active states
                  currentLocale === language.code && 'bg-neutral-light',
                  activeIndex === index && 'bg-accent-blue text-white',
                  // High contrast mode compatibility
                  'contrast-more:hover:bg-black contrast-more:hover:text-white'
                )}
                aria-current={currentLocale === language.code ? 'true' : 'false'}
                tabIndex={-1} // Managed by arrow key navigation
              >
                {showFlags && (
                  <span aria-hidden="true" className="text-lg">
                    {language.flag}
                  </span>
                )}

                <div className="flex flex-col">
                  <span className="font-medium">
                    {language.label}
                  </span>
                  {showNativeNames && language.name !== language.nativeName && (
                    <span className={clsx(
                      'text-xs',
                      activeIndex === index ? 'text-white/80' : 'text-neutral-medium'
                    )}>
                      {language.nativeName}
                    </span>
                  )}
                </div>

                {currentLocale === language.code && (
                  <>
                    <svg
                      className="w-4 h-4 ml-auto text-accent-blue"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="sr-only">(current)</span>
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Enhanced screen reader support */}
      <div className="sr-only" aria-live="polite">
        {isOpen
          ? 'Language menu expanded. Use arrow keys to navigate, Enter to select, Escape to close.'
          : announcement
        }
      </div>

      {/* Live region for language change announcements */}
      {announcement && (
        <div
          className="sr-only"
          aria-live="assertive"
          aria-atomic="true"
        >
          {announcement}
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { useAnnouncer } from '../hooks/useAnnouncer';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { LiveRegion } from './ui/LiveRegion';
import { VisuallyHidden } from './ui/VisuallyHidden';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  region: string;
  isPopular: boolean;
  accessibility?: {
    ariaLabel: string;
    ariaDescription: string;
    ariaRole: string;
    ariaPosInSet?: number;
    ariaSetSize?: number;
  };
}

interface AirportSearchResponse {
  query: string;
  locale: string;
  results: Airport[];
  count: number;
  cached: boolean;
  accessibility: {
    ariaLiveMessage: string;
    ariaAnnouncement: string;
    searchStatus: string;
    resultsDescription: string;
    keyboardInstructions: string;
    listRole: string;
    listLabel: string;
    hasResults: boolean;
    emptyStateMessage?: string;
    screenReaderSummary: string;
  };
}

interface AirportSearchProps {
  onSelect: (airport: Airport) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  locale?: 'es' | 'en' | 'pt';
  value?: Airport;
  name?: string;
  error?: string;
}

const getLocalizedText = (locale: string) => {
  const texts = {
    en: {
      otherAirport: 'Other Airport',
      airportPrefix: 'Airport',
      customAirportSelected: 'Selected custom airport'
    },
    es: {
      otherAirport: 'Otro Aeropuerto',
      airportPrefix: 'Aeropuerto',
      customAirportSelected: 'Aeropuerto personalizado seleccionado'
    },
    pt: {
      otherAirport: 'Outro Aeroporto',
      airportPrefix: 'Aeroporto',
      customAirportSelected: 'Aeroporto personalizado selecionado'
    }
  };
  return texts[locale as keyof typeof texts] || texts.en;
};

export function AirportSearch({
  onSelect,
  placeholder = 'City or Airport',
  label = '',
  required = false,
  disabled = false,
  className = '',
  locale = 'en',
  value,
  name,
  error,
  ...props
}: AirportSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchStatus, setSearchStatus] = useState<string>('');
  const [announcement, setAnnouncement] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { announce, announceAssertive } = useAnnouncer();
  const { focusElement } = useFocusManagement();
  const localizedText = getLocalizedText(locale);

  // Keyboard navigation for dropdown
  useKeyboardNavigation({
    container: listRef.current,
    orientation: 'vertical',
    onEscape: () => {
      setIsOpen(false);
      setSelectedIndex(-1);
      focusElement(inputRef.current!);
      announce('Search closed', { priority: 'polite' });
    },
    onEnter: (element) => {
      const index = parseInt(element.getAttribute('data-index') || '-1');
      if (index >= 0 && results[index]) {
        handleSelect(results[index]);
      }
    }
  });

  const searchAirports = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setSearchStatus('Searching airports...');

    try {
      const response = await fetch(
        `/api/airports?q=${encodeURIComponent(searchQuery)}&locale=${locale}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: AirportSearchResponse = await response.json();

      setResults(data.results);
      setIsOpen(true);
      setSelectedIndex(-1);

      // Update status and announcements
      setSearchStatus(data.accessibility.searchStatus);
      setAnnouncement(data.accessibility.ariaLiveMessage);

      // Announce results to screen readers
      if (data.results.length > 0) {
        announce(data.accessibility.screenReaderSummary, { priority: 'polite' });
      } else {
        announce(`No airports found for "${searchQuery}". Custom airport option available.`, { priority: 'polite' });
      }

    } catch (error) {
      console.error('Airport search error:', error);
      setResults([]);
      setIsOpen(false);
      setSearchStatus('error');
      announceAssertive('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [locale, announce, announceAssertive]);

  const debouncedSearch = useCallback((searchQuery: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchAirports(searchQuery);
    }, 300);
  }, [searchAirports]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  const handleSelect = (airport: Airport) => {
    setQuery(`${airport.code} - ${airport.name}`);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect(airport);

    // Announce selection
    announce(
      `Selected ${airport.code} - ${airport.name}, ${airport.city}, ${airport.country}`,
      { priority: 'assertive' }
    );
  };

  const handleCustomAirport = (customText: string) => {
    // Create a custom airport object
    const customAirport: Airport = {
      code: customText.toUpperCase(),
      name: `${customText.toUpperCase()} (Custom Airport)`,
      city: 'Custom Location',
      country: 'User Specified',
      region: 'Custom',
      isPopular: false,
      accessibility: {
        ariaLabel: `Custom airport: ${customText}`,
        ariaDescription: 'User-specified custom airport',
        ariaRole: 'option'
      }
    };

    // Set the display format without "(Custom Airport)" text
    setQuery(`${localizedText.airportPrefix}: ${customText.toUpperCase()}`);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect(customAirport);

    // Announce custom selection
    announce(
      `${localizedText.customAirportSelected}: ${customText}`,
      { priority: 'assertive' }
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const totalOptions = results.length + (results.length === 0 && query.trim() ? 1 : 0);

    if (!isOpen) {
      if (event.key === 'ArrowDown' && (results.length > 0 || query.trim())) {
        event.preventDefault();
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev < totalOptions - 1 ? prev + 1 : 0;
          const element = listRef.current?.querySelector(`[data-index="${newIndex}"]`) as HTMLElement;
          element?.focus();
          return newIndex;
        });
        break;

      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : totalOptions - 1;
          const element = listRef.current?.querySelector(`[data-index="${newIndex}"]`) as HTMLElement;
          element?.focus();
          return newIndex;
        });
        break;

      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < results.length && results[selectedIndex]) {
            // Regular airport selection
            handleSelect(results[selectedIndex]);
          } else if (selectedIndex === results.length && results.length === 0 && query.trim()) {
            // Custom airport selection
            handleCustomAirport(query.trim());
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
        break;
    }
  };

  const handleFocus = () => {
    if (query && (results.length > 0 || query.trim())) {
      setIsOpen(true);
    }
  };

  const handleBlur = (event: React.FocusEvent) => {
    // Close dropdown if focus moves outside the component
    if (!event.relatedTarget || !listRef.current?.contains(event.relatedTarget as Node)) {
      setTimeout(() => setIsOpen(false), 100);
    }
  };

  // Clear search timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const inputId = `airport-search-${Math.random().toString(36).substr(2, 9)}`;
  const listId = `airport-list-${Math.random().toString(36).substr(2, 9)}`;
  const statusId = `airport-status-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx('relative', className)} {...props}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-navy-primary mb-2"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-owns={isOpen ? listId : undefined}
          aria-describedby={clsx(
            statusId,
            error && `${inputId}-error`
          ).trim() || undefined}
          aria-invalid={error ? 'true' : undefined}
          className={clsx(
            'w-full px-3 py-2.5 border rounded-lg shadow-sm transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-navy-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[44px]', // Mobile accessibility
            error
              ? 'border-red-500 bg-red-50 text-red-900'
              : 'border-neutral-medium bg-white text-navy-primary',
            'placeholder:text-neutral-medium'
          )}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div
              className="animate-spin h-4 w-4 border-2 border-navy-primary border-t-transparent rounded-full"
              aria-hidden="true"
            />
            <VisuallyHidden>Searching airports</VisuallyHidden>
          </div>
        )}

        {isOpen && query.trim() && (
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={`Airport search results for ${query}`}
            className={clsx(
              'absolute z-50 mt-1 w-full',
              'bg-white border border-neutral-medium',
              'rounded-lg shadow-medium',
              'max-h-60 overflow-auto'
            )}
          >
            <VisuallyHidden aria-live="polite">
              {results.length > 0
                ? `${results.length} airport${results.length !== 1 ? 's' : ''} found.`
                : 'No airports found. Custom airport option available.'
              }
              Use arrow keys to navigate, Enter to select, Escape to close.
            </VisuallyHidden>

            {/* Show regular airport results */}
            {results.map((airport, index) => (
              <div
                key={airport.code}
                data-index={index}
                role="option"
                aria-selected={index === selectedIndex}
                aria-label={airport.accessibility?.ariaLabel ||
                  `${airport.code} - ${airport.name}, ${airport.city}, ${airport.country}`}
                aria-describedby={airport.accessibility?.ariaDescription}
                tabIndex={-1}
                className={clsx(
                  'px-3 py-3 cursor-pointer transition-colors duration-150',
                  'hover:bg-neutral-light',
                  'focus:bg-navy-primary focus:text-white',
                  'focus:outline-none min-h-[44px] flex items-center',
                  index === selectedIndex && 'bg-navy-primary text-white'
                )}
                onClick={() => handleSelect(airport)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div>
                  <div className={clsx(
                    'text-sm font-medium',
                    index === selectedIndex ? 'text-white' : 'text-navy-primary'
                  )}>
                    <span className="font-bold">{airport.code}</span> - {airport.name}
                  </div>
                  <div className={clsx(
                    'text-xs',
                    index === selectedIndex ? 'text-white/80' : 'text-neutral-medium'
                  )}>
                    {airport.city}, {airport.country}
                  </div>
                </div>
              </div>
            ))}

            {/* Show custom airport option when no results found */}
            {results.length === 0 && query.trim() && (
              <div
                data-index={results.length}
                role="option"
                aria-selected={results.length === selectedIndex}
                aria-label={`Use custom airport: ${query}`}
                tabIndex={-1}
                className={clsx(
                  'px-3 py-3 cursor-pointer transition-colors duration-150',
                  'hover:bg-navy-primary hover:text-white',
                  'focus:bg-navy-primary focus:text-white',
                  'focus:outline-none min-h-[44px] flex items-center',
                  'border-t border-neutral-light',
                  results.length === selectedIndex && 'bg-navy-primary text-white'
                )}
                onClick={() => handleCustomAirport(query.trim())}
                onMouseEnter={() => setSelectedIndex(results.length)}
              >
                <div className="flex items-center w-full">
                  <div className="mr-3 text-lg">✈️</div>
                  <div>
                    <div className={clsx(
                      'text-sm font-medium',
                      results.length === selectedIndex ? 'text-white' : 'text-navy-primary'
                    )}>
                      {localizedText.otherAirport}: <span className="font-bold">{query.trim().toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status region for screen readers */}
      <div
        id={statusId}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {searchStatus}
      </div>

      {/* Live region for announcements */}
      <LiveRegion
        message={announcement}
        priority="polite"
        clearAfter={3000}
        onMessageCleared={() => setAnnouncement('')}
      />

      {/* Error message */}
      {error && (
        <div
          id={`${inputId}-error`}
          role="alert"
          aria-live="polite"
          className="mt-1 text-sm text-red-600 flex items-start space-x-1"
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

      {/* Instructions for screen readers */}
      <VisuallyHidden>
        Airport search: Type to search for airports. Use arrow keys to navigate results,
        Enter to select, Escape to close dropdown.
      </VisuallyHidden>
    </div>
  );
}
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { useAccessibleIPDetection, ACCESSIBLE_COUNTRY_CODES } from '../../hooks/useAccessibleIPDetection';

export interface CountryCodeSelectorProps {
  value?: string;
  onChange?: (code: string) => void;
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  disabled?: boolean;
  showPrivacyNotice?: boolean;
}

export function CountryCodeSelector({
  value,
  onChange,
  locale = 'en',
  className,
  disabled = false,
  showPrivacyNotice = true,
}: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [announcement, setAnnouncement] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const {
    countryCode,
    isDetecting,
    detectionStatus,
    detectionMethod,
    setCountryCode,
    retryDetection,
    hasUserConsent,
    setUserConsent,
    detectedCountry,
  } = useAccessibleIPDetection(locale);

  const getContent = (locale: string) => {
    const content = {
      en: {
        selectCountry: 'Select country code',
        searchPlaceholder: 'Search countries...',
        autoDetected: 'Auto-detected',
        manual: 'Manually selected',
        retry: 'Retry detection',
        privacyNotice: 'We use your IP address to detect your country for phone number formatting. This data is not stored.',
        allowDetection: 'Allow location detection',
        currentSelection: 'Current selection',
        searchResults: 'Search results',
        noResults: 'No countries found',
        detecting: 'Detecting...',
      },
      es: {
        selectCountry: 'Seleccionar código de país',
        searchPlaceholder: 'Buscar países...',
        autoDetected: 'Detectado automáticamente',
        manual: 'Seleccionado manualmente',
        retry: 'Reintentar detección',
        privacyNotice: 'Usamos tu dirección IP para detectar tu país para el formato del número de teléfono. Estos datos no se almacenan.',
        allowDetection: 'Permitir detección de ubicación',
        currentSelection: 'Selección actual',
        searchResults: 'Resultados de búsqueda',
        noResults: 'No se encontraron países',
        detecting: 'Detectando...',
      },
      pt: {
        selectCountry: 'Selecionar código do país',
        searchPlaceholder: 'Pesquisar países...',
        autoDetected: 'Detectado automaticamente',
        manual: 'Selecionado manualmente',
        retry: 'Tentar detecção novamente',
        privacyNotice: 'Usamos seu endereço IP para detectar seu país para formatação do número de telefone. Estes dados não são armazenados.',
        allowDetection: 'Permitir detecção de localização',
        currentSelection: 'Seleção atual',
        searchResults: 'Resultados da pesquisa',
        noResults: 'Nenhum país encontrado',
        detecting: 'Detectando...',
      },
    };
    return content[locale as keyof typeof content] || content.en;
  };

  const content = getContent(locale);
  const currentCode = value || countryCode;

  // Find current country info
  const currentCountry = Object.values(ACCESSIBLE_COUNTRY_CODES).find(
    country => country.code === currentCode
  );

  // Filter countries based on search
  const filteredCountries = Object.values(ACCESSIBLE_COUNTRY_CODES).filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery)
  );

  // Handle selection
  const handleSelect = (code: string) => {
    setCountryCode(code);
    onChange?.(code);
    setIsOpen(false);
    setSearchQuery('');
    setFocusedIndex(-1);

    // Announce selection
    const selectedCountry = Object.values(ACCESSIBLE_COUNTRY_CODES).find(c => c.code === code);
    if (selectedCountry) {
      setAnnouncement(`Selected ${selectedCountry.name} ${code}`);
    }

    // Return focus to trigger
    triggerRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => (prev + 1) % filteredCountries.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => prev <= 0 ? filteredCountries.length - 1 : prev - 1);
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0) {
          handleSelect(filteredCountries[focusedIndex].code);
        }
        break;
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <div className={clsx('relative', className)}>
      {/* Privacy Notice */}
      {showPrivacyNotice && !hasUserConsent && (
        <div className="mb-4 p-3 bg-navy-primary/5 border border-navy-primary/20 rounded-lg">
          <p className="text-sm text-navy-primary mb-2">
            {content.privacyNotice}
          </p>
          <button
            onClick={() => setUserConsent(true)}
            className={clsx(
              'px-3 py-1 bg-accent-blue text-white text-sm rounded',
              'hover:bg-accent-blue/90 transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2'
            )}
          >
            {content.allowDetection}
          </button>
        </div>
      )}

      {/* Detection Status */}
      {hasUserConsent && detectionStatus && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-neutral-medium">
            {isDetecting && (
              <span className="inline-flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
                <span>{content.detecting}</span>
              </span>
            )}
            {!isDetecting && detectionStatus}
          </span>

          {!isDetecting && detectionMethod === 'auto' && (
            <button
              onClick={retryDetection}
              className="text-xs text-accent-blue hover:underline focus:outline-none focus:underline"
            >
              {content.retry}
            </button>
          )}
        </div>
      )}

      {/* Main Selector */}
      <div ref={dropdownRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={clsx(
            'w-full flex items-center justify-between px-3 py-2',
            'border border-neutral-medium rounded-lg',
            'bg-white hover:border-accent-blue',
            'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
            'min-h-[44px]',
            disabled && 'opacity-50 cursor-not-allowed',
            isOpen && 'border-accent-blue ring-2 ring-accent-blue ring-offset-2'
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby="country-code-label"
        >
          <span id="country-code-label" className="sr-only">
            {content.selectCountry}
          </span>

          <div className="flex items-center space-x-2">
            {currentCountry && (
              <>
                <span className="text-lg" aria-hidden="true">
                  {currentCountry.flag}
                </span>
                <span className="font-medium">
                  {currentCountry.code}
                </span>
                <span className="text-neutral-medium">
                  {currentCountry.name}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {detectionMethod === 'auto' && (
              <span className="text-xs text-accent-blue bg-accent-blue/10 px-2 py-1 rounded">
                {content.autoDetected}
              </span>
            )}

            <svg
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                isOpen && 'rotate-180'
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
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className={clsx(
              'absolute top-full left-0 right-0 mt-1 z-50',
              'bg-white border border-neutral-medium rounded-lg shadow-large',
              'max-h-64 overflow-hidden'
            )}
          >
            {/* Search */}
            <div className="p-3 border-b border-neutral-light">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFocusedIndex(-1);
                }}
                placeholder={content.searchPlaceholder}
                className={clsx(
                  'w-full px-3 py-2 border border-neutral-medium rounded',
                  'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2'
                )}
                aria-label={content.searchPlaceholder}
              />
            </div>

            {/* Options */}
            <div
              className="overflow-y-auto max-h-48"
              role="listbox"
              aria-label={content.searchResults}
            >
              {filteredCountries.length === 0 ? (
                <div className="p-3 text-center text-neutral-medium">
                  {content.noResults}
                </div>
              ) : (
                filteredCountries.map((country, index) => (
                  <button
                    key={country.code}
                    ref={(el) => { optionRefs.current[index] = el; }}
                    type="button"
                    role="option"
                    aria-selected={country.code === currentCode}
                    onClick={() => handleSelect(country.code)}
                    className={clsx(
                      'w-full flex items-center space-x-3 px-3 py-2 text-left',
                      'hover:bg-neutral-light',
                      'focus:outline-none focus:bg-accent-blue focus:text-white',
                      country.code === currentCode && 'bg-neutral-light',
                      focusedIndex === index && 'bg-accent-blue text-white'
                    )}
                  >
                    <span className="text-lg" aria-hidden="true">
                      {country.flag}
                    </span>
                    <span className="font-medium">
                      {country.code}
                    </span>
                    <span className="text-neutral-medium">
                      {country.name}
                    </span>
                    {country.code === currentCode && (
                      <span className="ml-auto">
                        <svg
                          className="w-4 h-4"
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
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live Region for Announcements */}
      {announcement && (
        <div
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {announcement}
        </div>
      )}

      {/* Live Region for Detection Status */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {detectionStatus}
      </div>
    </div>
  );
}
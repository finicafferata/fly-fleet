'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { ChevronDownIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface SearchFiltersProps {
  filters: FilterGroup[];
  selectedFilters: Record<string, string | string[] | number[]>;
  onFilterChange: (filterId: string, value: string | string[] | number[]) => void;
  onClearAll: () => void;
  className?: string;
  compact?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  resultCount?: number;
  isLoading?: boolean;
}

export function SearchFilters({
  filters,
  selectedFilters,
  onFilterChange,
  onClearAll,
  className,
  compact = false,
  searchQuery = '',
  onSearchChange,
  resultCount,
  isLoading = false
}: SearchFiltersProps) {
  const t = useTranslations('search');
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(
    new Set(compact ? [] : filters.map(f => f.id))
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileFiltersRef = useRef<HTMLDivElement>(null);

  // Handle search input with debouncing
  const handleSearchChange = useCallback((value: string) => {
    onSearchChange?.(value);
  }, [onSearchChange]);

  // Toggle filter group expansion
  const toggleFilter = useCallback((filterId: string) => {
    setExpandedFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filterId)) {
        newSet.delete(filterId);
      } else {
        newSet.add(filterId);
      }
      return newSet;
    });
  }, []);

  // Handle keyboard navigation for filter toggles
  const handleFilterKeyDown = useCallback((e: React.KeyboardEvent, filterId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFilter(filterId);
    }
  }, [toggleFilter]);

  // Handle checkbox filter changes
  const handleCheckboxChange = useCallback((filterId: string, optionValue: string, checked: boolean) => {
    const currentValues = (selectedFilters[filterId] as string[]) || [];
    let newValues: string[];

    if (checked) {
      newValues = [...currentValues, optionValue];
    } else {
      newValues = currentValues.filter(v => v !== optionValue);
    }

    onFilterChange(filterId, newValues);
  }, [selectedFilters, onFilterChange]);

  // Handle radio filter changes
  const handleRadioChange = useCallback((filterId: string, value: string) => {
    onFilterChange(filterId, value);
  }, [onFilterChange]);

  // Handle range filter changes
  const handleRangeChange = useCallback((filterId: string, values: number[]) => {
    onFilterChange(filterId, values);
  }, [onFilterChange]);

  // Count active filters
  const activeFilterCount = Object.values(selectedFilters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + value.length;
    } else if (value !== '' && value !== undefined && value !== null) {
      return count + 1;
    }
    return count;
  }, 0);

  // Handle mobile filters toggle
  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters(prev => !prev);
  }, []);

  // Close mobile filters on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMobileFilters) {
        setShowMobileFilters(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showMobileFilters]);

  // Focus management for mobile filters
  useEffect(() => {
    if (showMobileFilters && mobileFiltersRef.current) {
      const firstFocusable = mobileFiltersRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
  }, [showMobileFilters]);

  const renderFilterGroup = (filter: FilterGroup) => {
    const isExpanded = expandedFilters.has(filter.id);
    const selectedValue = selectedFilters[filter.id];

    return (
      <div key={filter.id} className="border-b border-neutral-light last:border-b-0">
        <button
          type="button"
          onClick={() => toggleFilter(filter.id)}
          onKeyDown={(e) => handleFilterKeyDown(e, filter.id)}
          className="w-full flex items-center justify-between py-4 px-1 text-left hover:bg-neutral-light/50 focus:outline-none focus:ring-2 focus:ring-accent-blue rounded-md"
          aria-expanded={isExpanded}
          aria-controls={`filter-content-${filter.id}`}
        >
          <span className="font-medium text-neutral-dark">
            {filter.label}
            {Array.isArray(selectedValue) && selectedValue.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-blue text-white">
                {selectedValue.length}
              </span>
            )}
          </span>
          <ChevronDownIcon
            className={clsx(
              'w-5 h-5 text-neutral-medium transition-transform duration-200',
              isExpanded && 'transform rotate-180'
            )}
            aria-hidden="true"
          />
        </button>

        <div
          id={`filter-content-${filter.id}`}
          className={clsx(
            'overflow-hidden transition-all duration-200',
            isExpanded ? 'max-h-96 pb-4' : 'max-h-0'
          )}
        >
          <div className="px-1">
            {filter.type === 'checkbox' && filter.options && (
              <fieldset>
                <legend className="sr-only">{filter.label}</legend>
                <div className="space-y-2">
                  {filter.options.map((option) => {
                    const isChecked = (selectedValue as string[] || []).includes(option.value);
                    return (
                      <label
                        key={option.id}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-neutral-light/30 rounded-md p-2 -mx-2"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(filter.id, option.value, e.target.checked)}
                          className="h-4 w-4 text-accent-blue border-neutral-medium rounded focus:ring-accent-blue focus:ring-offset-0"
                          aria-describedby={option.count ? `${option.id}-count` : undefined}
                        />
                        <span className="text-sm text-neutral-dark flex-1">
                          {option.label}
                        </span>
                        {option.count && (
                          <span
                            id={`${option.id}-count`}
                            className="text-xs text-neutral-medium"
                          >
                            ({option.count})
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {filter.type === 'radio' && filter.options && (
              <fieldset>
                <legend className="sr-only">{filter.label}</legend>
                <div className="space-y-2">
                  {filter.options.map((option) => {
                    const isSelected = selectedValue === option.value;
                    return (
                      <label
                        key={option.id}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-neutral-light/30 rounded-md p-2 -mx-2"
                      >
                        <input
                          type="radio"
                          name={filter.id}
                          value={option.value}
                          checked={isSelected}
                          onChange={() => handleRadioChange(filter.id, option.value)}
                          className="h-4 w-4 text-accent-blue border-neutral-medium focus:ring-accent-blue focus:ring-offset-0"
                          aria-describedby={option.count ? `${option.id}-count` : undefined}
                        />
                        <span className="text-sm text-neutral-dark flex-1">
                          {option.label}
                        </span>
                        {option.count && (
                          <span
                            id={`${option.id}-count`}
                            className="text-xs text-neutral-medium"
                          >
                            ({option.count})
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {filter.type === 'range' && filter.min !== undefined && filter.max !== undefined && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label htmlFor={`${filter.id}-min`} className="block text-xs font-medium text-neutral-medium mb-1">
                      {t('filters.minimum')}
                    </label>
                    <input
                      id={`${filter.id}-min`}
                      type="number"
                      min={filter.min}
                      max={filter.max}
                      step={filter.step || 1}
                      value={(selectedValue as number[])?.[0] || filter.min}
                      onChange={(e) => {
                        const currentValues = (selectedValue as number[]) || [filter.min!, filter.max!];
                        handleRangeChange(filter.id, [parseInt(e.target.value), currentValues[1]]);
                      }}
                      className="block w-full rounded-md border-neutral-medium shadow-sm focus:border-accent-blue focus:ring-accent-blue text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor={`${filter.id}-max`} className="block text-xs font-medium text-neutral-medium mb-1">
                      {t('filters.maximum')}
                    </label>
                    <input
                      id={`${filter.id}-max`}
                      type="number"
                      min={filter.min}
                      max={filter.max}
                      step={filter.step || 1}
                      value={(selectedValue as number[])?.[1] || filter.max}
                      onChange={(e) => {
                        const currentValues = (selectedValue as number[]) || [filter.min!, filter.max!];
                        handleRangeChange(filter.id, [currentValues[0], parseInt(e.target.value)]);
                      }}
                      className="block w-full rounded-md border-neutral-medium shadow-sm focus:border-accent-blue focus:ring-accent-blue text-sm"
                    />
                  </div>
                </div>
                {filter.unit && (
                  <p className="text-xs text-neutral-medium">
                    {t('filters.unit', { unit: filter.unit })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('bg-white', className)}>
      {/* Search Input */}
      {onSearchChange && (
        <div className="mb-6">
          <label htmlFor="search-input" className="block text-sm font-medium text-neutral-dark mb-2">
            {t('searchPlaceholder')}
          </label>
          <div className="relative">
            <input
              ref={searchInputRef}
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="block w-full pl-4 pr-10 py-3 border border-neutral-medium rounded-lg shadow-sm focus:ring-accent-blue focus:border-accent-blue text-sm"
              aria-describedby="search-results-count"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-blue" />
              ) : (
                <svg
                  className="h-5 w-5 text-neutral-medium"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </div>
          </div>
          {resultCount !== undefined && (
            <p id="search-results-count" className="mt-2 text-sm text-neutral-medium">
              {t('resultsCount', { count: resultCount })}
            </p>
          )}
        </div>
      )}

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={toggleMobileFilters}
          className="inline-flex items-center px-4 py-2 border border-neutral-medium rounded-lg shadow-sm text-sm font-medium text-neutral-dark bg-white hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent-blue"
          aria-expanded={showMobileFilters}
          aria-controls="mobile-filters"
        >
          <FunnelIcon className="w-5 h-5 mr-2" aria-hidden="true" />
          {t('filters.title')}
          {activeFilterCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-blue text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-dark">
            {t('filters.title')}
          </h2>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-sm text-accent-blue hover:text-accent-blue-dark focus:outline-none focus:underline"
            >
              {t('filters.clearAll')}
            </button>
          )}
        </div>
        <div className="space-y-0">
          {filters.map(renderFilterGroup)}
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={toggleMobileFilters}
        >
          <div
            ref={mobileFiltersRef}
            id="mobile-filters"
            className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-dark">
                  {t('filters.title')}
                </h2>
                <button
                  type="button"
                  onClick={toggleMobileFilters}
                  className="p-2 -mr-2 text-neutral-medium hover:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent-blue rounded-md"
                  aria-label={t('filters.close')}
                >
                  <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-0 mb-6">
                {filters.map(renderFilterGroup)}
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setShowMobileFilters(false);
                  }}
                  className="w-full px-4 py-2 border border-neutral-medium rounded-lg text-sm font-medium text-neutral-dark bg-white hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  {t('filters.clearAll')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="mt-4 p-4 bg-neutral-light/30 rounded-lg" role="status" aria-live="polite">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-medium">
              {t('filters.activeCount', { count: activeFilterCount })}
            </span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-sm text-accent-blue hover:text-accent-blue-dark focus:outline-none focus:underline"
            >
              {t('filters.clearAll')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
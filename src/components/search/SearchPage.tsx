'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { SearchFilters, type FilterGroup } from './SearchFilters';
import { SearchResults, type SearchResultItem } from './SearchResults';
import { useSearch, searchHistory } from '../../lib/search/searchUtils';

// Search API types
interface SearchResponse {
  results: SearchResultItem[];
  totalCount: number;
  filters?: FilterGroup[];
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

interface SearchPageProps {
  className?: string;
  initialQuery?: string;
  initialFilters?: Record<string, string | string[] | number[]>;
  categories?: string[];
  searchEndpoint?: string;
  enableAnalytics?: boolean;
}

export function SearchPage({
  className,
  initialQuery = '',
  initialFilters = {},
  categories = [],
  searchEndpoint = '/api/search',
  enableAnalytics = true
}: SearchPageProps) {
  const t = useTranslations('search');
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string | string[] | number[]>>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [layout, setLayout] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('relevance');
  const [availableFilters, setAvailableFilters] = useState<FilterGroup[]>([]);

  // Get initial query from URL params
  const urlQuery = searchParams.get('q') || initialQuery;

  // Search function with filters
  const searchFunction = useCallback(async (query: string) => {
    const searchUrl = new URL(searchEndpoint, window.location.origin);
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('page', currentPage.toString());
    searchUrl.searchParams.set('sort', sortBy);

    // Add filters to search params
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchUrl.searchParams.append(key, String(v)));
      } else if (value !== '' && value !== null && value !== undefined) {
        searchUrl.searchParams.set(key, String(value));
      }
    });

    const response = await fetch(searchUrl.toString());
    if (!response.ok) {
      throw new Error(t('errors.searchFailed'));
    }

    const data: SearchResponse = await response.json();

    // Update available filters based on response
    if (data.filters) {
      setAvailableFilters(data.filters);
    }

    return {
      results: data.results,
      totalCount: data.totalCount
    };
  }, [searchEndpoint, currentPage, sortBy, selectedFilters, t]);

  // Use search hook
  const {
    query,
    setQuery,
    results,
    totalCount,
    isLoading,
    error,
    hasSearched,
    clearSearch,
    retry
  } = useSearch(searchFunction, {
    debounceMs: 300,
    minLength: 2
  });

  // Initialize with URL query
  useEffect(() => {
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [urlQuery, query, setQuery]);

  // Update URL when search changes
  useEffect(() => {
    if (hasSearched && query) {
      const params = new URLSearchParams(searchParams);
      params.set('q', query);
      params.set('page', currentPage.toString());

      // Add filter params
      Object.entries(selectedFilters).forEach(([key, value]) => {
        params.delete(key);
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else if (value !== '' && value !== null && value !== undefined) {
          params.set(key, String(value));
        }
      });

      router.replace(`?${params.toString()}`, { scroll: false });

      // Add to search history
      if (query.trim()) {
        searchHistory.addToHistory(query.trim());
      }
    }
  }, [query, hasSearched, currentPage, selectedFilters, searchParams, router]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterId: string, value: string | string[] | number[]) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSelectedFilters({});
    setCurrentPage(1);
  }, []);

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);

    // Scroll to top of results with accessibility consideration
    const resultsElement = document.getElementById('search-results');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Focus first result for screen readers
      setTimeout(() => {
        const firstResult = resultsElement.querySelector('[role="article"]') as HTMLElement;
        if (firstResult) {
          firstResult.focus({ preventScroll: true });
        }
      }, 300);
    }
  }, []);

  // Handle result item clicks
  const handleResultClick = useCallback((item: SearchResultItem) => {
    // Track click for analytics
    if (enableAnalytics && typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'search_result_click', {
        search_term: query,
        result_id: item.id,
        result_position: results.findIndex(r => r.id === item.id) + 1,
        result_category: item.category
      });
    }

    // Navigate to result
    router.push(item.url);
  }, [query, results, enableAnalytics, router]);

  // Handle sort changes
  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  }, []);

  // Calculate pagination info
  const resultsPerPage = 10;
  const totalPages = Math.ceil(totalCount / resultsPerPage);

  return (
    <div className={clsx('min-h-screen bg-neutral-light/20', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-dark mb-4">
            {t('pageTitle')}
          </h1>
          <p className="text-lg text-neutral-medium">
            {t('pageDescription')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-1/4 mb-8 lg:mb-0">
            <div className="sticky top-8">
              <SearchFilters
                filters={availableFilters}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearFilters}
                searchQuery={query}
                onSearchChange={setQuery}
                resultCount={totalCount}
                isLoading={isLoading}
                className="bg-white rounded-lg shadow-sm border border-neutral-light p-6"
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4" role="main">
            {/* Search Controls */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-neutral-light p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                {/* Results Count and Query */}
                <div>
                  {hasSearched && query && (
                    <h2 className="text-lg font-semibold text-neutral-dark">
                      {t('resultsFor', { query })}
                    </h2>
                  )}
                  {totalCount > 0 && (
                    <p className="text-sm text-neutral-medium">
                      {t('totalResults', { count: totalCount })}
                    </p>
                  )}
                </div>

                {/* Sort and Layout Controls */}
                {results.length > 0 && (
                  <div className="flex items-center space-x-4">
                    {/* Sort Dropdown */}
                    <div className="flex items-center space-x-2">
                      <label htmlFor="sort-select" className="text-sm font-medium text-neutral-dark">
                        {t('sortBy')}:
                      </label>
                      <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="text-sm border border-neutral-medium rounded-md px-3 py-1 bg-white focus:ring-accent-blue focus:border-accent-blue"
                      >
                        <option value="relevance">{t('sortOptions.relevance')}</option>
                        <option value="date">{t('sortOptions.date')}</option>
                        <option value="price">{t('sortOptions.price')}</option>
                        <option value="title">{t('sortOptions.title')}</option>
                      </select>
                    </div>

                    {/* Layout Toggle */}
                    <div className="flex items-center space-x-1 border border-neutral-medium rounded-md">
                      <button
                        type="button"
                        onClick={() => setLayout('list')}
                        className={clsx(
                          'p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-accent-blue',
                          layout === 'list'
                            ? 'bg-accent-blue text-white'
                            : 'bg-white text-neutral-medium hover:text-neutral-dark'
                        )}
                        aria-label={t('layout.list')}
                        aria-pressed={layout === 'list'}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLayout('grid')}
                        className={clsx(
                          'p-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-accent-blue',
                          layout === 'grid'
                            ? 'bg-accent-blue text-white'
                            : 'bg-white text-neutral-medium hover:text-neutral-dark'
                        )}
                        aria-label={t('layout.grid')}
                        aria-pressed={layout === 'grid'}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2h4a1 1 0 100-2H3zM3 7a1 1 0 000 2h4a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 3a1 1 0 100 2h4a1 1 0 100-2h-4zM13 7a1 1 0 100 2h4a1 1 0 100-2h-4zM13 11a1 1 0 100 2h4a1 1 0 100-2h-4z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Results */}
            <div id="search-results">
              <SearchResults
                results={results}
                isLoading={isLoading}
                error={error}
                query={query}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onItemClick={handleResultClick}
                layout={layout}
                showCategories={categories.length > 0}
                resultsPerPage={resultsPerPage}
                className="bg-white rounded-lg shadow-sm border border-neutral-light p-6"
              />
            </div>

            {/* Error Recovery */}
            {error && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-neutral-light p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-neutral-dark mb-2">
                    {t('errors.searchFailed')}
                  </h3>
                  <p className="text-neutral-medium mb-4">
                    {t('errors.tryAgain')}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                      type="button"
                      onClick={retry}
                      className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue-dark focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2"
                    >
                      {t('errors.retry')}
                    </button>
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="px-4 py-2 bg-white text-neutral-dark border border-neutral-medium rounded-lg hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2"
                    >
                      {t('errors.clearSearch')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Search Instructions for Screen Readers */}
      <div id="search-instructions" className="sr-only">
        {t('accessibility.searchInstructions')}
      </div>
    </div>
  );
}
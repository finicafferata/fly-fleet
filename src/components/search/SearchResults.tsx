'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { OptimizedImage } from '../ui/OptimizedImage';

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  url: string;
  category: string;
  metadata?: Record<string, any>;
  highlights?: {
    title?: string;
    description?: string;
  };
}

export interface SearchResultsProps {
  results: SearchResultItem[];
  isLoading?: boolean;
  error?: string | null;
  query?: string;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onItemClick?: (item: SearchResultItem) => void;
  className?: string;
  layout?: 'list' | 'grid';
  showCategories?: boolean;
  emptyStateMessage?: string;
  resultsPerPage?: number;
}

export function SearchResults({
  results,
  isLoading = false,
  error = null,
  query = '',
  totalCount,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onItemClick,
  className,
  layout = 'list',
  showCategories = true,
  emptyStateMessage,
  resultsPerPage = 10
}: SearchResultsProps) {
  const t = useTranslations('search');
  const [previousResultCount, setPreviousResultCount] = useState(0);
  const [announceText, setAnnounceText] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Announce search results changes to screen readers
  useEffect(() => {
    if (!isLoading && results.length !== previousResultCount) {
      const newAnnouncement = query
        ? t('resultsAnnouncement', {
            count: results.length,
            query: query,
            total: totalCount || results.length
          })
        : t('resultsLoadedAnnouncement', { count: results.length });

      setAnnounceText(newAnnouncement);
      setPreviousResultCount(results.length);

      // Clear announcement after it's been read
      setTimeout(() => setAnnounceText(''), 1000);
    }
  }, [results.length, isLoading, query, totalCount, previousResultCount, t]);

  // Focus management when results update
  useEffect(() => {
    if (!isLoading && results.length > 0 && resultsRef.current) {
      // Announce the first result for screen readers
      const firstResult = resultsRef.current.querySelector('[role="article"]') as HTMLElement;
      if (firstResult) {
        firstResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [results, isLoading]);

  // Handle keyboard navigation for pagination
  const handlePaginationKeyDown = (e: React.KeyboardEvent, page: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPageChange?.(page);
    }
  };

  // Handle result item click with analytics
  const handleResultClick = (item: SearchResultItem, index: number) => {
    onItemClick?.(item);

    // Track click position for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'search_result_click', {
        search_term: query,
        result_position: index + 1 + (currentPage - 1) * resultsPerPage,
        result_id: item.id,
        result_category: item.category
      });
    }
  };

  // Group results by category if needed
  const groupedResults = showCategories
    ? results.reduce((groups, item) => {
        const category = item.category || 'Other';
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
        return groups;
      }, {} as Record<string, SearchResultItem[]>)
    : { 'All Results': results };

  // Render individual result item
  const renderResultItem = (item: SearchResultItem, index: number) => (
    <article
      key={item.id}
      role="article"
      className={clsx(
        'group relative',
        layout === 'list'
          ? 'border-b border-neutral-light pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0'
          : 'border border-neutral-light rounded-lg overflow-hidden hover:shadow-md transition-shadow',
        'focus-within:ring-2 focus-within:ring-navy-primary focus-within:ring-offset-2'
      )}
      aria-labelledby={`result-title-${item.id}`}
      aria-describedby={`result-description-${item.id}`}
    >
      <div className={clsx(
        'flex',
        layout === 'list' ? 'space-x-4' : 'flex-col'
      )}>
        {/* Result Image */}
        {item.image && (
          <div className={clsx(
            'flex-shrink-0',
            layout === 'list' ? 'w-24 h-24' : 'w-full h-48'
          )}>
            <OptimizedImage
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover rounded-lg"
              sizes={layout === 'list' ? '96px' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
            />
          </div>
        )}

        {/* Result Content */}
        <div className={clsx(
          'flex-1 min-w-0',
          layout === 'grid' && 'p-4'
        )}>
          {/* Category Badge */}
          {showCategories && (
            <span className="inline-block px-2 py-1 text-xs font-medium bg-neutral-light text-neutral-medium rounded-full mb-2">
              {item.category}
            </span>
          )}

          {/* Title */}
          <h3
            id={`result-title-${item.id}`}
            className="text-lg font-semibold text-neutral-dark group-hover:text-navy-primary transition-colors"
          >
            <a
              href={item.url}
              onClick={(e) => {
                e.preventDefault();
                handleResultClick(item, index);
              }}
              className="focus:outline-none"
              dangerouslySetInnerHTML={{
                __html: item.highlights?.title || item.title
              }}
            />
          </h3>

          {/* Description */}
          <p
            id={`result-description-${item.id}`}
            className="mt-2 text-sm text-neutral-medium line-clamp-3"
            dangerouslySetInnerHTML={{
              __html: item.highlights?.description || item.description
            }}
          />

          {/* Metadata */}
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <dl className="mt-3 text-xs text-neutral-medium">
              <div className="flex flex-wrap gap-4">
                {Object.entries(item.metadata).map(([key, value]) => (
                  <div key={key} className="flex space-x-1">
                    <dt className="font-medium">{key}:</dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
              </div>
            </dl>
          )}
        </div>
      </div>

      {/* Overlay link for better accessibility */}
      <a
        href={item.url}
        onClick={(e) => {
          e.preventDefault();
          handleResultClick(item, index);
        }}
        className="absolute inset-0 z-10"
        aria-label={`View details for ${item.title}`}
        tabIndex={-1}
      >
        <span className="sr-only">View details</span>
      </a>
    </article>
  );

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const visiblePages = pages.filter(page =>
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 2 && page <= currentPage + 2)
    );

    return (
      <nav
        role="navigation"
        aria-label={t('pagination.label')}
        className="flex items-center justify-center space-x-1 mt-8"
      >
        {/* Previous button */}
        <button
          onClick={() => onPageChange?.(currentPage - 1)}
          onKeyDown={(e) => handlePaginationKeyDown(e, currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-neutral-medium bg-white border border-neutral-light rounded-md hover:bg-neutral-light disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-navy-primary"
          aria-label={t('pagination.previous')}
        >
          {t('pagination.previous')}
        </button>

        {/* Page numbers */}
        {visiblePages.map((page, index) => {
          const prevPage = visiblePages[index - 1];
          const showEllipsis = prevPage && page > prevPage + 1;

          return (
            <React.Fragment key={page}>
              {showEllipsis && (
                <span className="px-3 py-2 text-sm text-neutral-medium">...</span>
              )}
              <button
                onClick={() => onPageChange?.(page)}
                onKeyDown={(e) => handlePaginationKeyDown(e, page)}
                className={clsx(
                  'px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-navy-primary',
                  page === currentPage
                    ? 'bg-navy-primary text-white'
                    : 'text-neutral-medium bg-white border border-neutral-light hover:bg-neutral-light'
                )}
                aria-label={page === currentPage ? t('pagination.currentPage', { page }) : t('pagination.goToPage', { page })}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            </React.Fragment>
          );
        })}

        {/* Next button */}
        <button
          onClick={() => onPageChange?.(currentPage + 1)}
          onKeyDown={(e) => handlePaginationKeyDown(e, currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-neutral-medium bg-white border border-neutral-light rounded-md hover:bg-neutral-light disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-navy-primary"
          aria-label={t('pagination.next')}
        >
          {t('pagination.next')}
        </button>
      </nav>
    );
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announceText}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12" role="status" aria-label={t('loading')}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-primary" />
          <span className="ml-3 text-neutral-medium">{t('loading')}</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
          aria-labelledby="error-title"
        >
          <h3 id="error-title" className="text-sm font-medium text-red-800">
            {t('error.title')}
          </h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <>
          {/* Results header */}
          {(query || totalCount !== undefined) && (
            <div className="mb-6">
              {query && (
                <h2 className="text-xl font-semibold text-neutral-dark mb-2">
                  {t('resultsFor', { query })}
                </h2>
              )}
              {totalCount !== undefined && (
                <p className="text-sm text-neutral-medium">
                  {t('showingResults', {
                    start: (currentPage - 1) * resultsPerPage + 1,
                    end: Math.min(currentPage * resultsPerPage, totalCount),
                    total: totalCount
                  })}
                </p>
              )}
            </div>
          )}

          {/* Results content */}
          {results.length > 0 ? (
            <div ref={resultsRef}>
              {Object.entries(groupedResults).map(([category, categoryResults]) => (
                <section key={category} className="mb-8 last:mb-0">
                  {showCategories && Object.keys(groupedResults).length > 1 && (
                    <h3 className="text-lg font-semibold text-neutral-dark mb-4 border-b border-neutral-light pb-2">
                      {category} ({categoryResults.length})
                    </h3>
                  )}

                  <div className={clsx(
                    layout === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-6'
                  )}>
                    {categoryResults.map((item, index) =>
                      renderResultItem(item, index + (currentPage - 1) * resultsPerPage)
                    )}
                  </div>
                </section>
              ))}

              {renderPagination()}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-neutral-light"
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
              <h3 className="mt-4 text-lg font-medium text-neutral-dark">
                {query ? t('noResults.title') : t('noResults.generic')}
              </h3>
              <p className="mt-2 text-sm text-neutral-medium">
                {emptyStateMessage || (query ? t('noResults.suggestion') : t('noResults.message'))}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
import { useCallback, useEffect, useRef, useState } from 'react';

// Search utility types
export interface SearchOptions {
  debounceMs?: number;
  minLength?: number;
  includeHighlights?: boolean;
  caseSensitive?: boolean;
  fuzzyMatch?: boolean;
  respectUserPreferences?: boolean;
}

export interface SearchState {
  query: string;
  isLoading: boolean;
  results: any[];
  totalCount: number;
  error: string | null;
  hasSearched: boolean;
}

export interface UseSearchReturn extends SearchState {
  setQuery: (query: string) => void;
  clearSearch: () => void;
  retry: () => void;
}

// Debounced search hook with accessibility considerations
export function useSearch<T = any>(
  searchFn: (query: string) => Promise<{ results: T[]; totalCount: number }>,
  options: SearchOptions = {}
): UseSearchReturn {
  const {
    debounceMs = 300,
    minLength = 2,
    respectUserPreferences = true
  } = options;

  const [state, setState] = useState<SearchState>({
    query: '',
    isLoading: false,
    results: [],
    totalCount: 0,
    error: null,
    hasSearched: false
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const lastQueryRef = useRef<string>('');

  // Respect user's motion preferences for debouncing
  const getDebounceDelay = useCallback(() => {
    if (!respectUserPreferences || typeof window === 'undefined') {
      return debounceMs;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return prefersReducedMotion ? Math.min(debounceMs, 150) : debounceMs;
  }, [debounceMs, respectUserPreferences]);

  // Perform search with error handling and accessibility announcements
  const performSearch = useCallback(async (query: string) => {
    if (query.length < minLength) {
      setState(prev => ({
        ...prev,
        results: [],
        totalCount: 0,
        error: null,
        isLoading: false,
        hasSearched: false
      }));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    lastQueryRef.current = query;

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const startTime = performance.now();
      const { results, totalCount } = await searchFn(query);
      const endTime = performance.now();

      // Only update if this is still the latest query
      if (lastQueryRef.current === query) {
        setState(prev => ({
          ...prev,
          results,
          totalCount,
          isLoading: false,
          hasSearched: true,
          error: null
        }));

        // Track search performance for analytics
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'search_performed', {
            search_term: query,
            search_duration: Math.round(endTime - startTime),
            result_count: totalCount,
            event_category: 'Search'
          });
        }

        // Announce results to screen readers
        announceSearchResults(query, totalCount);
      }
    } catch (error) {
      if (lastQueryRef.current === query && !(error instanceof Error && error.name === 'AbortError')) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Search failed',
          hasSearched: true
        }));

        // Announce error to screen readers
        announceSearchError();
      }
    }
  }, [searchFn, minLength]);

  // Set query with debouncing
  const setQuery = useCallback((newQuery: string) => {
    setState(prev => ({ ...prev, query: newQuery }));

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(newQuery);
    }, getDebounceDelay());
  }, [performSearch, getDebounceDelay]);

  // Clear search
  const clearSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      query: '',
      isLoading: false,
      results: [],
      totalCount: 0,
      error: null,
      hasSearched: false
    });
    lastQueryRef.current = '';
  }, []);

  // Retry last search
  const retry = useCallback(() => {
    if (state.query) {
      performSearch(state.query);
    }
  }, [state.query, performSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    setQuery,
    clearSearch,
    retry
  };
}

// Screen reader announcement utilities
function announceSearchResults(query: string, count: number) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = `Search completed. Found ${count} result${count !== 1 ? 's' : ''} for "${query}".`;

  document.body.appendChild(announcement);
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

function announceSearchError() {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.setAttribute('role', 'alert');
  announcement.className = 'sr-only';
  announcement.textContent = 'Search failed. Please try again.';

  document.body.appendChild(announcement);
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 3000);
}

// Text highlighting utility with accessibility considerations
export function highlightText(text: string, query: string, options: {
  caseSensitive?: boolean;
  highlightClassName?: string;
  maxHighlights?: number;
} = {}): string {
  const {
    caseSensitive = false,
    highlightClassName = 'bg-yellow-200 font-semibold',
    maxHighlights = 10
  } = options;

  if (!query || !text) return text;

  const flags = caseSensitive ? 'g' : 'gi';
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, flags);

  let highlightCount = 0;
  const highlightedText = text.replace(regex, (match) => {
    if (highlightCount >= maxHighlights) return match;
    highlightCount++;
    return `<mark class="${highlightClassName}" aria-label="Search highlight">${match}</mark>`;
  });

  return highlightedText;
}

// Fuzzy search implementation
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string,
  options: {
    threshold?: number;
    includeScore?: boolean;
    caseSensitive?: boolean;
  } = {}
): T[] | Array<{ item: T; score: number }> {
  const {
    threshold = 0.3,
    includeScore = false,
    caseSensitive = false
  } = options;

  if (!query) return includeScore ? items.map(item => ({ item, score: 1 })) : items;

  const searchQuery = caseSensitive ? query : query.toLowerCase();
  const results: Array<{ item: T; score: number }> = [];

  for (const item of items) {
    const text = caseSensitive ? getSearchableText(item) : getSearchableText(item).toLowerCase();
    const score = calculateFuzzyScore(text, searchQuery);

    if (score >= threshold) {
      results.push({ item, score });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return includeScore ? results : results.map(r => r.item);
}

// Simple fuzzy score calculation
function calculateFuzzyScore(text: string, query: string): number {
  if (text.includes(query)) return 1; // Exact match

  let score = 0;
  let queryIndex = 0;
  let textIndex = 0;

  while (queryIndex < query.length && textIndex < text.length) {
    if (query[queryIndex] === text[textIndex]) {
      score++;
      queryIndex++;
    }
    textIndex++;
  }

  return score / Math.max(query.length, text.length);
}

// Search history management with accessibility
export class AccessibleSearchHistory {
  private storageKey = 'fly-fleet-search-history';
  private maxHistoryItems = 10;

  getHistory(): string[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  addToHistory(query: string): void {
    if (!query.trim()) return;

    try {
      const history = this.getHistory();
      const normalizedQuery = query.trim().toLowerCase();

      // Remove existing entry if present
      const filtered = history.filter(item => item.toLowerCase() !== normalizedQuery);

      // Add to beginning and limit size
      const newHistory = [query.trim(), ...filtered].slice(0, this.maxHistoryItems);

      localStorage.setItem(this.storageKey, JSON.stringify(newHistory));
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  removeFromHistory(query: string): void {
    try {
      const history = this.getHistory();
      const filtered = history.filter(item => item !== query);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  // Announce history changes to screen readers
  announceHistoryUpdate(action: 'added' | 'removed' | 'cleared', query?: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';

    switch (action) {
      case 'added':
        announcement.textContent = `"${query}" added to search history.`;
        break;
      case 'removed':
        announcement.textContent = `"${query}" removed from search history.`;
        break;
      case 'cleared':
        announcement.textContent = 'Search history cleared.';
        break;
    }

    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

// Create singleton instance
export const searchHistory = new AccessibleSearchHistory();

// Hook for search suggestions with accessibility
export function useSearchSuggestions(
  query: string,
  getSuggestions: (query: string) => Promise<string[]>,
  options: {
    debounceMs?: number;
    maxSuggestions?: number;
    includeHistory?: boolean;
  } = {}
) {
  const {
    debounceMs = 200,
    maxSuggestions = 5,
    includeHistory = true
  } = options;

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query.trim()) {
      setSuggestions(includeHistory ? searchHistory.getHistory().slice(0, maxSuggestions) : []);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    timeoutRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();

      try {
        const remoteSuggestions = await getSuggestions(query);
        const historySuggestions = includeHistory
          ? searchHistory.getHistory().filter(item =>
              item.toLowerCase().includes(query.toLowerCase())
            )
          : [];

        // Combine and deduplicate suggestions
        const allSuggestions = [...new Set([...historySuggestions, ...remoteSuggestions])]
          .slice(0, maxSuggestions);

        setSuggestions(allSuggestions);
        setIsLoading(false);
      } catch (error) {
        if (!(error instanceof Error && error.name === 'AbortError')) {
          setSuggestions([]);
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, getSuggestions, debounceMs, maxSuggestions, includeHistory]);

  return { suggestions, isLoading };
}

// Keyboard navigation utilities for search interfaces
export const searchKeyboardUtils = {
  // Handle arrow key navigation in suggestion lists
  handleSuggestionNavigation: (
    event: KeyboardEvent,
    suggestions: string[],
    currentIndex: number,
    onIndexChange: (index: number) => void,
    onSelect: (suggestion: string) => void
  ) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0;
        onIndexChange(nextIndex);
        break;

      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1;
        onIndexChange(prevIndex);
        break;

      case 'Enter':
        event.preventDefault();
        if (currentIndex >= 0 && currentIndex < suggestions.length) {
          onSelect(suggestions[currentIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        onIndexChange(-1);
        break;
    }
  },

  // Generate ARIA attributes for search components
  getSearchAriaAttributes: (
    isExpanded: boolean,
    suggestionCount: number,
    activeSuggestionId?: string
  ) => ({
    'aria-expanded': isExpanded,
    'aria-haspopup': 'listbox',
    'aria-autocomplete': 'list' as const,
    'aria-activedescendant': activeSuggestionId,
    'aria-describedby': 'search-instructions',
    role: 'combobox'
  }),

  // Generate ARIA attributes for suggestion lists
  getSuggestionListAriaAttributes: () => ({
    role: 'listbox',
    'aria-label': 'Search suggestions'
  }),

  // Generate ARIA attributes for suggestion items
  getSuggestionItemAriaAttributes: (index: number, isSelected: boolean) => ({
    role: 'option',
    'aria-selected': isSelected,
    id: `suggestion-${index}`
  })
};
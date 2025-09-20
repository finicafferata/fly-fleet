import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useSearch,
  fuzzySearch,
  highlightText,
  AccessibleSearchHistory,
  searchKeyboardUtils,
} from '../searchUtils';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
};
global.performance = mockPerformance as any;

describe('Search Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('useSearch hook', () => {
    const mockSearchFn = jest.fn();

    beforeEach(() => {
      mockSearchFn.mockClear();
    });

    it('should initialize with empty state', () => {
      const { result } = renderHook(() =>
        useSearch(mockSearchFn, { debounceMs: 100 })
      );

      expect(result.current.query).toBe('');
      expect(result.current.results).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasSearched).toBe(false);
    });

    it('should debounce search queries', async () => {
      mockSearchFn.mockResolvedValue({
        results: [{ id: '1', title: 'Test Result' }],
        totalCount: 1,
      });

      const { result } = renderHook(() =>
        useSearch(mockSearchFn, { debounceMs: 300 })
      );

      act(() => {
        result.current.setQuery('test');
      });

      expect(mockSearchFn).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(mockSearchFn).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(mockSearchFn).toHaveBeenCalledWith('test');
      });
    });

    it('should handle search errors', async () => {
      const errorMessage = 'Search failed';
      mockSearchFn.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() =>
        useSearch(mockSearchFn, { debounceMs: 100 })
      );

      act(() => {
        result.current.setQuery('test query');
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear search results', () => {
      const { result } = renderHook(() =>
        useSearch(mockSearchFn, { debounceMs: 100 })
      );

      act(() => {
        result.current.setQuery('test');
      });

      expect(result.current.query).toBe('test');

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.query).toBe('');
      expect(result.current.results).toEqual([]);
      expect(result.current.hasSearched).toBe(false);
    });

    it('should not search with query below minimum length', async () => {
      const { result } = renderHook(() =>
        useSearch(mockSearchFn, { debounceMs: 100, minLength: 3 })
      );

      act(() => {
        result.current.setQuery('te'); // Below minimum length
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(mockSearchFn).not.toHaveBeenCalled();
      expect(result.current.results).toEqual([]);
    });

    it('should retry search', async () => {
      mockSearchFn.mockResolvedValue({
        results: [{ id: '1', title: 'Retry Result' }],
        totalCount: 1,
      });

      const { result } = renderHook(() =>
        useSearch(mockSearchFn, { debounceMs: 100 })
      );

      act(() => {
        result.current.setQuery('retry test');
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(mockSearchFn).toHaveBeenCalledWith('retry test');
      });

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(mockSearchFn).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('fuzzySearch', () => {
    const testItems = [
      { id: 1, name: 'New York' },
      { id: 2, name: 'Los Angeles' },
      { id: 3, name: 'Chicago' },
      { id: 4, name: 'Houston' },
      { id: 5, name: 'Phoenix' },
    ];

    it('should return all items when query is empty', () => {
      const results = fuzzySearch(
        testItems,
        '',
        (item) => item.name
      );

      expect(results).toEqual(testItems);
    });

    it('should find exact matches', () => {
      const results = fuzzySearch(
        testItems,
        'Chicago',
        (item) => item.name
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({ id: 3, name: 'Chicago' });
    });

    it('should find partial matches', () => {
      const results = fuzzySearch(
        testItems,
        'New',
        (item) => item.name
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({ id: 1, name: 'New York' });
    });

    it('should handle case insensitive search', () => {
      const results = fuzzySearch(
        testItems,
        'new york',
        (item) => item.name,
        { caseSensitive: false }
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({ id: 1, name: 'New York' });
    });

    it('should return results with scores when includeScore is true', () => {
      const results = fuzzySearch(
        testItems,
        'York',
        (item) => item.name,
        { includeScore: true }
      ) as Array<{ item: any; score: number }>;

      expect(results[0]).toHaveProperty('item');
      expect(results[0]).toHaveProperty('score');
      expect(typeof results[0].score).toBe('number');
    });

    it('should filter by threshold', () => {
      const results = fuzzySearch(
        testItems,
        'xyz',
        (item) => item.name,
        { threshold: 0.5 }
      );

      expect(results).toHaveLength(0);
    });
  });

  describe('highlightText', () => {
    it('should highlight matching text', () => {
      const result = highlightText(
        'This is a test string',
        'test',
        { highlightClassName: 'highlight' }
      );

      expect(result).toContain('<mark class="highlight" aria-label="Search highlight">test</mark>');
    });

    it('should handle case insensitive highlighting', () => {
      const result = highlightText(
        'This is a TEST string',
        'test',
        { caseSensitive: false, highlightClassName: 'highlight' }
      );

      expect(result).toContain('<mark class="highlight" aria-label="Search highlight">TEST</mark>');
    });

    it('should return original text when no query provided', () => {
      const text = 'This is a test string';
      const result = highlightText(text, '');

      expect(result).toBe(text);
    });

    it('should limit number of highlights', () => {
      const text = 'test test test test';
      const result = highlightText(
        text,
        'test',
        { maxHighlights: 2, highlightClassName: 'highlight' }
      );

      const matches = result.match(/<mark/g) || [];
      expect(matches).toHaveLength(2);
    });

    it('should escape special regex characters', () => {
      const text = 'Price: $100 (special)';
      const result = highlightText(
        text,
        '$100 (',
        { highlightClassName: 'highlight' }
      );

      expect(result).toContain('<mark class="highlight" aria-label="Search highlight">$100 (</mark>');
    });
  });

  describe('AccessibleSearchHistory', () => {
    let searchHistory: AccessibleSearchHistory;

    beforeEach(() => {
      searchHistory = new AccessibleSearchHistory();
      localStorage.clear();
    });

    it('should add queries to history', () => {
      searchHistory.addToHistory('test query');
      const history = searchHistory.getHistory();

      expect(history).toContain('test query');
    });

    it('should not add empty queries', () => {
      searchHistory.addToHistory('');
      searchHistory.addToHistory('   ');
      const history = searchHistory.getHistory();

      expect(history).toHaveLength(0);
    });

    it('should remove duplicates and move to top', () => {
      searchHistory.addToHistory('first query');
      searchHistory.addToHistory('second query');
      searchHistory.addToHistory('first query'); // Duplicate

      const history = searchHistory.getHistory();

      expect(history[0]).toBe('first query');
      expect(history).toHaveLength(2);
    });

    it('should limit history size', () => {
      // Add more than max items
      for (let i = 1; i <= 15; i++) {
        searchHistory.addToHistory(`query ${i}`);
      }

      const history = searchHistory.getHistory();
      expect(history).toHaveLength(10); // Max items
      expect(history[0]).toBe('query 15'); // Most recent first
    });

    it('should remove items from history', () => {
      searchHistory.addToHistory('query to remove');
      searchHistory.addToHistory('query to keep');

      searchHistory.removeFromHistory('query to remove');
      const history = searchHistory.getHistory();

      expect(history).not.toContain('query to remove');
      expect(history).toContain('query to keep');
    });

    it('should clear all history', () => {
      searchHistory.addToHistory('query 1');
      searchHistory.addToHistory('query 2');

      searchHistory.clearHistory();
      const history = searchHistory.getHistory();

      expect(history).toHaveLength(0);
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const mockSetItem = jest.fn(() => {
        throw new Error('Storage error');
      });
      Storage.prototype.setItem = mockSetItem;

      // Should not throw error
      expect(() => {
        searchHistory.addToHistory('test query');
      }).not.toThrow();
    });
  });

  describe('searchKeyboardUtils', () => {
    let mockOnIndexChange: jest.Mock;
    let mockOnSelect: jest.Mock;

    beforeEach(() => {
      mockOnIndexChange = jest.fn();
      mockOnSelect = jest.fn();
    });

    it('should handle arrow down navigation', () => {
      const suggestions = ['suggestion 1', 'suggestion 2', 'suggestion 3'];
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      event.preventDefault = jest.fn();

      searchKeyboardUtils.handleSuggestionNavigation(
        event as any,
        suggestions,
        0,
        mockOnIndexChange,
        mockOnSelect
      );

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockOnIndexChange).toHaveBeenCalledWith(1);
    });

    it('should handle arrow up navigation', () => {
      const suggestions = ['suggestion 1', 'suggestion 2', 'suggestion 3'];
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      event.preventDefault = jest.fn();

      searchKeyboardUtils.handleSuggestionNavigation(
        event as any,
        suggestions,
        1,
        mockOnIndexChange,
        mockOnSelect
      );

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockOnIndexChange).toHaveBeenCalledWith(0);
    });

    it('should wrap around on navigation boundaries', () => {
      const suggestions = ['suggestion 1', 'suggestion 2', 'suggestion 3'];

      // Test wrap around at end
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      downEvent.preventDefault = jest.fn();

      searchKeyboardUtils.handleSuggestionNavigation(
        downEvent as any,
        suggestions,
        2, // Last index
        mockOnIndexChange,
        mockOnSelect
      );

      expect(mockOnIndexChange).toHaveBeenCalledWith(0); // Wrap to first

      // Test wrap around at beginning
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      upEvent.preventDefault = jest.fn();

      searchKeyboardUtils.handleSuggestionNavigation(
        upEvent as any,
        suggestions,
        0, // First index
        mockOnIndexChange,
        mockOnSelect
      );

      expect(mockOnIndexChange).toHaveBeenCalledWith(2); // Wrap to last
    });

    it('should handle enter key selection', () => {
      const suggestions = ['suggestion 1', 'suggestion 2', 'suggestion 3'];
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      event.preventDefault = jest.fn();

      searchKeyboardUtils.handleSuggestionNavigation(
        event as any,
        suggestions,
        1,
        mockOnIndexChange,
        mockOnSelect
      );

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockOnSelect).toHaveBeenCalledWith('suggestion 2');
    });

    it('should handle escape key', () => {
      const suggestions = ['suggestion 1', 'suggestion 2', 'suggestion 3'];
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      event.preventDefault = jest.fn();

      searchKeyboardUtils.handleSuggestionNavigation(
        event as any,
        suggestions,
        1,
        mockOnIndexChange,
        mockOnSelect
      );

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockOnIndexChange).toHaveBeenCalledWith(-1);
    });

    it('should generate correct ARIA attributes for search', () => {
      const attrs = searchKeyboardUtils.getSearchAriaAttributes(
        true,
        5,
        'suggestion-2'
      );

      expect(attrs).toEqual({
        'aria-expanded': true,
        'aria-haspopup': 'listbox',
        'aria-autocomplete': 'list',
        'aria-activedescendant': 'suggestion-2',
        'aria-describedby': 'search-instructions',
        role: 'combobox',
      });
    });

    it('should generate correct ARIA attributes for suggestion list', () => {
      const attrs = searchKeyboardUtils.getSuggestionListAriaAttributes();

      expect(attrs).toEqual({
        role: 'listbox',
        'aria-label': 'Search suggestions',
      });
    });

    it('should generate correct ARIA attributes for suggestion item', () => {
      const attrs = searchKeyboardUtils.getSuggestionItemAriaAttributes(2, true);

      expect(attrs).toEqual({
        role: 'option',
        'aria-selected': true,
        id: 'suggestion-2',
      });
    });
  });
});
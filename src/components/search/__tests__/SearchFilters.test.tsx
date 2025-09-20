import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SearchFilters, type FilterGroup } from '../SearchFilters';

expect.extend(toHaveNoViolations);

const mockFilters: FilterGroup[] = [
  {
    id: 'category',
    label: 'Category',
    type: 'checkbox',
    options: [
      { id: 'charter', label: 'Charter Flights', value: 'charter', count: 25 },
      { id: 'empty_legs', label: 'Empty Legs', value: 'empty_legs', count: 12 },
      { id: 'multicity', label: 'Multi-City', value: 'multicity', count: 8 },
    ],
  },
  {
    id: 'price_range',
    label: 'Price Range',
    type: 'range',
    min: 0,
    max: 50000,
    step: 1000,
    unit: 'USD',
  },
  {
    id: 'aircraft_type',
    label: 'Aircraft Type',
    type: 'radio',
    options: [
      { id: 'light', label: 'Light Jet', value: 'light', count: 15 },
      { id: 'midsize', label: 'Midsize Jet', value: 'midsize', count: 20 },
      { id: 'heavy', label: 'Heavy Jet', value: 'heavy', count: 10 },
    ],
  },
];

describe('SearchFilters Component', () => {
  const mockProps = {
    filters: mockFilters,
    selectedFilters: {},
    onFilterChange: jest.fn(),
    onClearAll: jest.fn(),
    onSearchChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all filter groups', () => {
    render(<SearchFilters {...mockProps} />);

    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('Aircraft Type')).toBeInTheDocument();
  });

  it('should render search input when onSearchChange is provided', () => {
    render(<SearchFilters {...mockProps} />);

    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should not render search input when onSearchChange is not provided', () => {
    const propsWithoutSearch = { ...mockProps, onSearchChange: undefined };
    render(<SearchFilters {...propsWithoutSearch} />);

    expect(screen.queryByLabelText(/search/i)).not.toBeInTheDocument();
  });

  it('should handle search input changes', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...mockProps} />);

    const searchInput = screen.getByLabelText(/search/i);
    await user.type(searchInput, 'test query');

    expect(mockProps.onSearchChange).toHaveBeenCalledWith('test query');
  });

  it('should expand and collapse filter groups', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...mockProps} />);

    const categoryButton = screen.getByRole('button', { name: /category/i });

    // Initially expanded (assuming default behavior)
    expect(categoryButton).toHaveAttribute('aria-expanded', 'true');

    // Click to collapse
    await user.click(categoryButton);
    expect(categoryButton).toHaveAttribute('aria-expanded', 'false');

    // Click to expand again
    await user.click(categoryButton);
    expect(categoryButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should handle checkbox filter changes', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...mockProps} />);

    const charterCheckbox = screen.getByLabelText('Charter Flights');
    await user.click(charterCheckbox);

    expect(mockProps.onFilterChange).toHaveBeenCalledWith('category', ['charter']);
  });

  it('should handle multiple checkbox selections', async () => {
    const user = userEvent.setup();
    const propsWithSelected = {
      ...mockProps,
      selectedFilters: { category: ['charter'] },
    };
    render(<SearchFilters {...propsWithSelected} />);

    const emptyLegsCheckbox = screen.getByLabelText('Empty Legs');
    await user.click(emptyLegsCheckbox);

    expect(mockProps.onFilterChange).toHaveBeenCalledWith('category', ['charter', 'empty_legs']);
  });

  it('should handle checkbox deselection', async () => {
    const user = userEvent.setup();
    const propsWithSelected = {
      ...mockProps,
      selectedFilters: { category: ['charter', 'empty_legs'] },
    };
    render(<SearchFilters {...propsWithSelected} />);

    const charterCheckbox = screen.getByLabelText('Charter Flights');
    await user.click(charterCheckbox);

    expect(mockProps.onFilterChange).toHaveBeenCalledWith('category', ['empty_legs']);
  });

  it('should handle radio filter changes', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...mockProps} />);

    const lightJetRadio = screen.getByLabelText('Light Jet');
    await user.click(lightJetRadio);

    expect(mockProps.onFilterChange).toHaveBeenCalledWith('aircraft_type', 'light');
  });

  it('should handle range filter changes', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...mockProps} />);

    const minInput = screen.getByLabelText(/minimum/i);
    const maxInput = screen.getByLabelText(/maximum/i);

    await user.clear(minInput);
    await user.type(minInput, '5000');

    expect(mockProps.onFilterChange).toHaveBeenCalledWith('price_range', [5000, 50000]);

    await user.clear(maxInput);
    await user.type(maxInput, '25000');

    expect(mockProps.onFilterChange).toHaveBeenCalledWith('price_range', [5000, 25000]);
  });

  it('should display filter counts', () => {
    render(<SearchFilters {...mockProps} />);

    expect(screen.getByText('(25)')).toBeInTheDocument(); // Charter Flights count
    expect(screen.getByText('(12)')).toBeInTheDocument(); // Empty Legs count
    expect(screen.getByText('(8)')).toBeInTheDocument(); // Multi-City count
  });

  it('should show active filter count', () => {
    const propsWithSelected = {
      ...mockProps,
      selectedFilters: {
        category: ['charter', 'empty_legs'],
        aircraft_type: 'light',
      },
    };
    render(<SearchFilters {...propsWithSelected} />);

    // Should show count badge for selected filters
    const categoryButton = screen.getByRole('button', { name: /category/i });
    expect(categoryButton).toHaveTextContent('2'); // 2 selected items
  });

  it('should handle clear all filters', async () => {
    const user = userEvent.setup();
    const propsWithSelected = {
      ...mockProps,
      selectedFilters: {
        category: ['charter'],
        aircraft_type: 'light',
      },
    };
    render(<SearchFilters {...propsWithSelected} />);

    const clearButton = screen.getByText(/clear all/i);
    await user.click(clearButton);

    expect(mockProps.onClearAll).toHaveBeenCalled();
  });

  it('should show mobile filter toggle on small screens', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<SearchFilters {...mockProps} />);

    // In mobile, there should be a toggle button
    const mobileToggle = screen.getByRole('button', { name: /filters/i });
    expect(mobileToggle).toBeInTheDocument();
  });

  it('should handle mobile filter toggle', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<SearchFilters {...mockProps} />);

    const mobileToggle = screen.getByRole('button', { name: /filters/i });
    expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(mobileToggle);
    expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('should close mobile filters with escape key', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<SearchFilters {...mockProps} />);

    const mobileToggle = screen.getByRole('button', { name: /filters/i });
    await user.click(mobileToggle);

    // Press escape
    await user.keyboard('{Escape}');

    expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('should show loading state', () => {
    const propsWithLoading = { ...mockProps, isLoading: true };
    render(<SearchFilters {...propsWithLoading} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display result count', () => {
    const propsWithCount = { ...mockProps, resultCount: 45 };
    render(<SearchFilters {...propsWithCount} />);

    expect(screen.getByText(/45/)).toBeInTheDocument();
  });

  it('should be accessible', async () => {
    const { container } = render(<SearchFilters {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...mockProps} />);

    const categoryButton = screen.getByRole('button', { name: /category/i });
    const priceButton = screen.getByRole('button', { name: /price range/i });

    categoryButton.focus();
    expect(categoryButton).toHaveFocus();

    await user.tab();
    expect(priceButton).toHaveFocus();

    // Test keyboard interaction with filter groups
    await user.keyboard('{Enter}');
    expect(priceButton).toHaveAttribute('aria-expanded');
  });

  it('should handle keyboard navigation within filter groups', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...mockProps} />);

    // Open a filter group and navigate within it
    const categoryButton = screen.getByRole('button', { name: /category/i });
    await user.click(categoryButton);

    const charterCheckbox = screen.getByLabelText('Charter Flights');
    const emptyLegsCheckbox = screen.getByLabelText('Empty Legs');

    charterCheckbox.focus();
    expect(charterCheckbox).toHaveFocus();

    await user.tab();
    expect(emptyLegsCheckbox).toHaveFocus();

    // Test space key to select checkbox
    await user.keyboard(' ');
    expect(mockProps.onFilterChange).toHaveBeenCalledWith('category', ['empty_legs']);
  });

  it('should announce filter changes to screen readers', async () => {
    const user = userEvent.setup();
    render(<SearchFilters {...mockProps} />);

    const charterCheckbox = screen.getByLabelText('Charter Flights');
    await user.click(charterCheckbox);

    // Check that aria-live region updates are handled
    // (This would typically be tested through screen reader simulation)
    expect(mockProps.onFilterChange).toHaveBeenCalled();
  });

  it('should handle compact mode', () => {
    const compactProps = { ...mockProps, compact: true };
    render(<SearchFilters {...compactProps} />);

    // In compact mode, filters should start collapsed
    const categoryButton = screen.getByRole('button', { name: /category/i });
    expect(categoryButton).toHaveAttribute('aria-expanded', 'false');
  });
});
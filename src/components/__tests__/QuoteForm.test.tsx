import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { QuoteForm } from '../QuoteForm';

expect.extend(toHaveNoViolations);

// Mock the recaptcha hook
jest.mock('../lib/recaptcha/useRecaptcha', () => ({
  useRecaptcha: () => ({
    executeRecaptcha: jest.fn().mockResolvedValue('mock-token'),
    isLoading: false,
  }),
}));

// Mock fetch for form submission
global.fetch = jest.fn();

describe('QuoteForm Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, id: 'mock-quote-id' }),
    });
  });

  it('should render all form fields', () => {
    render(<QuoteForm />);

    // Check for main form elements
    expect(screen.getByLabelText(/service type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/departure airport/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/arrival airport/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/departure date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/number of passengers/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByRole('button', { name: /get quote/i })).toBeInTheDocument();
  });

  it('should show return date field for round trip', async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    // Initially, return date should not be visible
    expect(screen.queryByLabelText(/return date/i)).not.toBeInTheDocument();

    // Select round trip
    const roundTripRadio = screen.getByDisplayValue('round-trip');
    await user.click(roundTripRadio);

    // Now return date should be visible
    expect(screen.getByLabelText(/return date/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    const submitButton = screen.getByRole('button', { name: /get quote/i });
    await user.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/departure airport is required/i)).toBeInTheDocument();
      expect(screen.getByText(/arrival airport is required/i)).toBeInTheDocument();
      expect(screen.getByText(/departure date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /get quote/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('should validate phone number format', async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    const phoneInput = screen.getByLabelText(/phone/i);
    await user.type(phoneInput, '123'); // Too short

    const submitButton = screen.getByRole('button', { name: /get quote/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/phone number must be at least/i)).toBeInTheDocument();
    });
  });

  it('should validate passenger count', async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    const passengersInput = screen.getByLabelText(/number of passengers/i);
    await user.clear(passengersInput);
    await user.type(passengersInput, '0');

    const submitButton = screen.getByRole('button', { name: /get quote/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/at least 1 passenger/i)).toBeInTheDocument();
    });
  });

  it('should require terms acceptance', async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    // Fill in required fields but don't accept terms
    await user.type(screen.getByLabelText(/departure airport/i), 'JFK');
    await user.type(screen.getByLabelText(/arrival airport/i), 'LAX');
    await user.type(screen.getByLabelText(/departure date/i), '2024-12-25');
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');

    const submitButton = screen.getByRole('button', { name: /get quote/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/accept the terms/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    // Fill in all required fields
    await user.selectOptions(screen.getByLabelText(/service type/i), 'charter');
    await user.type(screen.getByLabelText(/departure airport/i), 'JFK');
    await user.type(screen.getByLabelText(/arrival airport/i), 'LAX');
    await user.type(screen.getByLabelText(/departure date/i), '2024-12-25');
    await user.type(screen.getByLabelText(/number of passengers/i), '4');
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone/i), '+1234567890');
    await user.click(screen.getByLabelText(/accept terms/i));

    const submitButton = screen.getByRole('button', { name: /get quote/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/quote', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }));
    });
  });

  it('should handle form submission errors', async () => {
    const user = userEvent.setup();

    // Mock fetch to return an error
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Submission failed' }),
    });

    render(<QuoteForm />);

    // Fill in valid data
    await user.selectOptions(screen.getByLabelText(/service type/i), 'charter');
    await user.type(screen.getByLabelText(/departure airport/i), 'JFK');
    await user.type(screen.getByLabelText(/arrival airport/i), 'LAX');
    await user.type(screen.getByLabelText(/departure date/i), '2024-12-25');
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.click(screen.getByLabelText(/accept terms/i));

    const submitButton = screen.getByRole('button', { name: /get quote/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();

    // Mock fetch to return a delayed promise
    (fetch as jest.Mock).mockReturnValueOnce(
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, id: 'mock-id' }),
      }), 1000))
    );

    render(<QuoteForm />);

    // Fill in valid data
    await user.selectOptions(screen.getByLabelText(/service type/i), 'charter');
    await user.type(screen.getByLabelText(/departure airport/i), 'JFK');
    await user.type(screen.getByLabelText(/arrival airport/i), 'LAX');
    await user.type(screen.getByLabelText(/departure date/i), '2024-12-25');
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.click(screen.getByLabelText(/accept terms/i));

    const submitButton = screen.getByRole('button', { name: /get quote/i });
    await user.click(submitButton);

    // Check for loading state
    expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    // Fill in and submit form
    await user.selectOptions(screen.getByLabelText(/service type/i), 'charter');
    await user.type(screen.getByLabelText(/departure airport/i), 'JFK');
    await user.type(screen.getByLabelText(/arrival airport/i), 'LAX');
    await user.type(screen.getByLabelText(/departure date/i), '2024-12-25');
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.click(screen.getByLabelText(/accept terms/i));

    const submitButton = screen.getByRole('button', { name: /get quote/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/quote request submitted/i)).toBeInTheDocument();
    });

    // Check that form fields are reset
    expect(screen.getByLabelText(/departure airport/i)).toHaveValue('');
    expect(screen.getByLabelText(/arrival airport/i)).toHaveValue('');
    expect(screen.getByLabelText(/first name/i)).toHaveValue('');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
  });

  it('should be accessible', async () => {
    const { container } = render(<QuoteForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    // Test tab navigation through form elements
    const serviceTypeSelect = screen.getByLabelText(/service type/i);
    const departureInput = screen.getByLabelText(/departure airport/i);
    const arrivalInput = screen.getByLabelText(/arrival airport/i);

    serviceTypeSelect.focus();
    expect(serviceTypeSelect).toHaveFocus();

    await user.tab();
    expect(departureInput).toHaveFocus();

    await user.tab();
    expect(arrivalInput).toHaveFocus();
  });

  it('should announce form errors to screen readers', async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    const submitButton = screen.getByRole('button', { name: /get quote/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Check for error region
      const errorRegion = screen.getByRole('alert');
      expect(errorRegion).toBeInTheDocument();
      expect(errorRegion).toHaveAttribute('aria-live', 'assertive');
    });
  });

  it('should handle special service types correctly', async () => {
    const user = userEvent.setup();
    render(<QuoteForm />);

    // Test medical service type
    await user.selectOptions(screen.getByLabelText(/service type/i), 'medical');

    // Medical service should show additional fields or requirements
    expect(screen.getByText(/medical transport/i)).toBeInTheDocument();

    // Test cargo service type
    await user.selectOptions(screen.getByLabelText(/service type/i), 'cargo');

    // Cargo service should show weight/dimension fields
    expect(screen.getByLabelText(/cargo weight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cargo dimensions/i)).toBeInTheDocument();
  });
});
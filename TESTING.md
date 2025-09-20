# Testing Guide for Fly-Fleet

This document provides comprehensive guidance on testing the Fly-Fleet application, covering unit tests, integration tests, end-to-end tests, accessibility testing, and performance testing.

## Table of Contents

1. [Overview](#overview)
2. [Test Setup](#test-setup)
3. [Running Tests](#running-tests)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [End-to-End Testing](#end-to-end-testing)
7. [Accessibility Testing](#accessibility-testing)
8. [Performance Testing](#performance-testing)
9. [CI/CD Integration](#cicd-integration)
10. [Best Practices](#best-practices)

## Overview

Our testing strategy follows the testing pyramid approach:

- **Unit Tests (70%)**: Fast, isolated tests for individual components and utilities
- **Integration Tests (20%)**: Tests for API endpoints and database operations
- **End-to-End Tests (10%)**: Full user journey tests across the application

### Testing Stack

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Jest + Supertest + Test Database
- **E2E Tests**: Playwright
- **Accessibility**: axe-core + Playwright
- **Performance**: Lighthouse CI + Custom Playwright tests

## Test Setup

### Prerequisites

1. Node.js 18+ installed
2. PostgreSQL database for integration tests
3. All dependencies installed: `npm install`

### Environment Setup

Create a `.env.test` file for test-specific environment variables:

```bash
# Test Database
DATABASE_URL="postgresql://test:test@localhost:5432/fly_fleet_test"

# Test API Keys (use test/mock values)
RESEND_API_KEY="test-api-key"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="test-site-key"
RECAPTCHA_SECRET_KEY="test-secret-key"
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-TEST123"

# Test Environment
NODE_ENV="test"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Running Tests

### Quick Start

```bash
# Run all tests
npm run test:all

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # End-to-end tests only
npm run test:accessibility # Accessibility tests only
npm run test:performance  # Performance tests only

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Run CI test suite
npm run test:ci
```

### Detailed Test Commands

```bash
# Unit Tests
npm test                           # Run all Jest tests
npm run test:watch                 # Watch mode for development
npm run test:coverage              # Generate coverage report
jest --testNamePattern="QuoteForm" # Run specific test

# Integration Tests
npm run test:integration           # All integration tests
jest tests/integration/api/quote.test.ts # Specific integration test

# E2E Tests
npm run test:e2e                   # All E2E tests
npm run test:e2e:ui               # Run with Playwright UI
npm run test:e2e:headed           # Run in headed mode (visible browser)
npx playwright test quote-form.spec.ts # Specific E2E test

# Accessibility Tests
npm run test:accessibility         # Run accessibility test suite
npx playwright test accessibility.spec.ts --headed

# Performance Tests
npm run test:performance          # Custom performance tests
npm run test:lighthouse          # Lighthouse CI audit
```

## Unit Testing

Unit tests are located in `src/**/__tests__/` and `src/**/*.test.ts` files.

### Example Unit Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { QuoteForm } from '../QuoteForm';

describe('QuoteForm', () => {
  it('should render all required fields', () => {
    render(<QuoteForm />);

    expect(screen.getByLabelText(/departure/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/arrival/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<QuoteForm />);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/departure is required/i)).toBeInTheDocument();
  });
});
```

### Testing Utilities

#### Component Testing Helpers

```typescript
// Test utilities for components
export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <IntlProvider locale="en" messages={{}}>
        {children}
      </IntlProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};
```

#### Mock Utilities

```typescript
// Mock API responses
export const mockSuccessfulQuoteSubmission = () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, id: 'test-quote-id' }),
  });
};
```

### Coverage Requirements

- **Minimum Coverage**: 80% for lines, functions, branches, and statements
- **Critical Paths**: 95%+ coverage for form validation, API calls, and business logic
- **Components**: All public APIs and user interactions must be tested

## Integration Testing

Integration tests are located in `tests/integration/` and test API endpoints and database operations.

### Database Setup for Integration Tests

1. Create a test database:
```sql
CREATE DATABASE fly_fleet_test;
```

2. Run migrations:
```bash
DATABASE_URL="postgresql://test:test@localhost:5432/fly_fleet_test" npx prisma db push
```

### Example Integration Test

```typescript
import { POST } from '../../../src/app/api/quote/route';
import { prisma } from '../../../src/lib/prisma';

describe('/api/quote Integration Tests', () => {
  beforeEach(async () => {
    // Clean test data
    await prisma.quote.deleteMany();
  });

  it('should create a quote with valid data', async () => {
    const request = new NextRequest('http://localhost/api/quote', {
      method: 'POST',
      body: JSON.stringify(validQuoteData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify database
    const savedQuote = await prisma.quote.findUnique({
      where: { id: data.id },
    });
    expect(savedQuote).toBeTruthy();
  });
});
```

## End-to-End Testing

E2E tests are located in `tests/e2e/` and use Playwright to test complete user journeys.

### Test Structure

```
tests/e2e/
├── global-setup.ts           # Global test setup
├── global-teardown.ts        # Global test cleanup
├── quote-form.spec.ts        # Quote form user journeys
├── accessibility.spec.ts     # Accessibility testing
└── contact-form.spec.ts      # Contact form journeys
```

### Example E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('complete quote submission flow', async ({ page }) => {
  await page.goto('/');

  // Fill form
  await page.selectOption('[data-testid="service-type"]', 'charter');
  await page.fill('[data-testid="departure"]', 'JFK');
  await page.fill('[data-testid="arrival"]', 'LAX');

  // Submit
  await page.click('[data-testid="submit-quote"]');

  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### Test Data Management

Use data attributes for reliable element selection:

```tsx
// Good: Use data-testid
<button data-testid="submit-quote">Submit Quote</button>

// Avoid: Relying on text or classes
<button className="btn-primary">Submit Quote</button>
```

## Accessibility Testing

### Automated Accessibility Testing

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should be accessible', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Manual Accessibility Testing

1. **Keyboard Navigation**: Test all functionality with keyboard only
2. **Screen Reader**: Test with NVDA, JAWS, or VoiceOver
3. **Color Contrast**: Verify 4.5:1 ratio for normal text, 3:1 for large text
4. **Zoom**: Test at 200% zoom level

### Accessibility Checklist

- [ ] All images have alt text or are marked decorative
- [ ] Forms have proper labels and error messages
- [ ] Interactive elements are keyboard accessible
- [ ] Color is not the only way to convey information
- [ ] Text has sufficient contrast
- [ ] Page has proper heading structure (h1, h2, h3...)
- [ ] Focus indicators are visible
- [ ] Screen reader announcements work for dynamic content

## Performance Testing

### Lighthouse CI

Lighthouse CI runs automated performance audits:

```bash
npm run test:lighthouse
```

Configuration in `tests/performance/lighthouse.config.js`:

- **Performance**: >80 score
- **Accessibility**: >95 score
- **Best Practices**: >90 score
- **SEO**: >90 score

### Custom Performance Tests

```typescript
test('should load within performance budget', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```

### Performance Budget

- **First Contentful Paint**: <2s
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <3s
- **Cumulative Layout Shift**: <0.1
- **Total Bundle Size**: <500KB gzipped

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Install Playwright
        run: npx playwright install

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Run Lighthouse CI
        run: npm run test:lighthouse
```

### Test Reports

Test results are generated in multiple formats:

- **Coverage**: `coverage/lcov-report/index.html`
- **E2E Results**: `test-results/`
- **Lighthouse**: `lighthouse-results/`

## Best Practices

### Writing Good Tests

1. **AAA Pattern**: Arrange, Act, Assert
```typescript
test('should validate email format', () => {
  // Arrange
  render(<EmailInput />);

  // Act
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'invalid-email' }
  });

  // Assert
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
});
```

2. **Test User Behavior, Not Implementation**
```typescript
// Good: Test what user sees
expect(screen.getByText('Quote submitted successfully')).toBeInTheDocument();

// Bad: Test implementation details
expect(component.state.isSubmitted).toBe(true);
```

3. **Use Descriptive Test Names**
```typescript
// Good
test('should show error message when email format is invalid')

// Bad
test('email validation')
```

### Test Organization

1. **Group Related Tests**
```typescript
describe('QuoteForm', () => {
  describe('validation', () => {
    test('should require departure airport');
    test('should require arrival airport');
  });

  describe('submission', () => {
    test('should submit with valid data');
    test('should handle server errors');
  });
});
```

2. **Keep Tests Independent**
- Each test should be able to run in isolation
- Use `beforeEach` to set up clean state
- Don't rely on test execution order

3. **Mock External Dependencies**
```typescript
// Mock API calls
global.fetch = jest.fn();

// Mock third-party services
jest.mock('@/lib/recaptcha', () => ({
  verifyRecaptcha: jest.fn().mockResolvedValue(true),
}));
```

### Common Pitfalls

1. **Testing Implementation Details**: Focus on user behavior
2. **Flaky Tests**: Use proper waits and assertions
3. **Slow Tests**: Mock expensive operations
4. **Hard-to-Read Tests**: Use page objects and helpers
5. **Missing Edge Cases**: Test error conditions and boundary values

### Debugging Tests

1. **Jest Debug Mode**:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

2. **Playwright Debug Mode**:
```bash
npx playwright test --debug
```

3. **Screenshot on Failure**:
```typescript
test('should work', async ({ page }) => {
  try {
    // test code
  } catch (error) {
    await page.screenshot({ path: 'failure.png' });
    throw error;
  }
});
```

## Maintenance

### Regular Tasks

1. **Update Dependencies**: Keep testing libraries up to date
2. **Review Coverage**: Ensure coverage stays above thresholds
3. **Clean Up Tests**: Remove obsolete tests and update brittle ones
4. **Performance Budgets**: Review and adjust as needed

### Test Metrics to Monitor

- Test execution time
- Coverage percentages
- Flaky test rates
- Performance budget compliance
- Accessibility violation trends

For questions or issues with testing, please refer to the project documentation or reach out to the development team.
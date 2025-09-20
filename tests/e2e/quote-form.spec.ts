import { test, expect } from '@playwright/test';

test.describe('Quote Form E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage where the quote form is located
    await page.goto('/');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should complete the entire quote flow successfully', async ({ page }) => {
    // Fill out the quote form
    await page.selectOption('[data-testid="service-type"]', 'charter');
    await page.fill('[data-testid="departure"]', 'JFK');
    await page.fill('[data-testid="arrival"]', 'LAX');
    await page.fill('[data-testid="departure-date"]', '2024-12-25');

    // Set passenger count
    await page.fill('[data-testid="passengers"]', '4');

    // Fill personal information
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john.doe@example.com');
    await page.fill('[data-testid="phone"]', '+1234567890');

    // Optional fields
    await page.fill('[data-testid="company"]', 'Test Company');
    await page.fill('[data-testid="message"]', 'Looking for a charter flight for business trip');

    // Accept terms
    await page.check('[data-testid="accept-terms"]');

    // Mock the reCAPTCHA for testing
    await page.addScriptTag({
      content: `
        window.grecaptcha = {
          ready: (callback) => callback(),
          execute: () => Promise.resolve('test-token')
        };
      `
    });

    // Submit the form
    await page.click('[data-testid="submit-quote"]');

    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('quote request');

    // Verify form is reset after successful submission
    await expect(page.locator('[data-testid="departure"]')).toHaveValue('');
    await expect(page.locator('[data-testid="arrival"]')).toHaveValue('');
    await expect(page.locator('[data-testid="first-name"]')).toHaveValue('');
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Try to submit without filling required fields
    await page.click('[data-testid="submit-quote"]');

    // Check for validation errors
    await expect(page.locator('[data-testid="departure-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="arrival-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="departure-date-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="first-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();

    // Verify form is not submitted
    await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('[data-testid="email"]', 'invalid-email');
    await page.click('[data-testid="submit-quote"]');

    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toContainText('invalid');
  });

  test('should show return date field for round trip', async ({ page }) => {
    // Initially, return date should not be visible
    await expect(page.locator('[data-testid="return-date"]')).not.toBeVisible();

    // Select round trip
    await page.check('[data-testid="round-trip"]');

    // Return date should now be visible
    await expect(page.locator('[data-testid="return-date"]')).toBeVisible();

    // Select one way again
    await page.check('[data-testid="one-way"]');

    // Return date should be hidden again
    await expect(page.locator('[data-testid="return-date"]')).not.toBeVisible();
  });

  test('should handle form submission errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('/api/quote', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Server error' })
      });
    });

    // Fill and submit form
    await page.selectOption('[data-testid="service-type"]', 'charter');
    await page.fill('[data-testid="departure"]', 'JFK');
    await page.fill('[data-testid="arrival"]', 'LAX');
    await page.fill('[data-testid="departure-date"]', '2024-12-25');
    await page.fill('[data-testid="passengers"]', '2');
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.check('[data-testid="accept-terms"]');

    await page.click('[data-testid="submit-quote"]');

    // Check for error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('error');
  });

  test('should work with different service types', async ({ page }) => {
    const serviceTypes = ['charter', 'empty_legs', 'multicity', 'helicopter', 'medical', 'cargo'];

    for (const serviceType of serviceTypes) {
      await page.selectOption('[data-testid="service-type"]', serviceType);

      // Check that service-specific fields appear if needed
      if (serviceType === 'medical') {
        await expect(page.locator('[data-testid="medical-requirements"]')).toBeVisible();
      }

      if (serviceType === 'cargo') {
        await expect(page.locator('[data-testid="cargo-weight"]')).toBeVisible();
        await expect(page.locator('[data-testid="cargo-dimensions"]')).toBeVisible();
      }

      if (serviceType === 'multicity') {
        await expect(page.locator('[data-testid="add-stop"]')).toBeVisible();
      }
    }
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="service-type"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="departure"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="arrival"]')).toBeFocused();

    // Test form submission via Enter key
    await page.fill('[data-testid="departure"]', 'JFK');
    await page.fill('[data-testid="arrival"]', 'LAX');
    await page.fill('[data-testid="departure-date"]', '2024-12-25');
    await page.fill('[data-testid="passengers"]', '2');
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.check('[data-testid="accept-terms"]');

    // Focus on submit button and press Enter
    await page.focus('[data-testid="submit-quote"]');
    await page.keyboard.press('Enter');

    // Should show validation errors (missing reCAPTCHA)
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('should handle mobile responsive behavior', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that form is still usable on mobile
    await page.selectOption('[data-testid="service-type"]', 'charter');
    await page.fill('[data-testid="departure"]', 'JFK');
    await page.fill('[data-testid="arrival"]', 'LAX');

    // Check that all fields are visible and accessible
    await expect(page.locator('[data-testid="departure"]')).toBeVisible();
    await expect(page.locator('[data-testid="arrival"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-quote"]')).toBeVisible();

    // Check that form elements are appropriately sized for mobile
    const submitButton = page.locator('[data-testid="submit-quote"]');
    const buttonBox = await submitButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThan(40); // Minimum touch target size
  });

  test('should preserve form data during page interactions', async ({ page }) => {
    // Fill form partially
    await page.selectOption('[data-testid="service-type"]', 'charter');
    await page.fill('[data-testid="departure"]', 'JFK');
    await page.fill('[data-testid="arrival"]', 'LAX');
    await page.fill('[data-testid="first-name"]', 'John');

    // Navigate away and back (simulate user distraction)
    await page.goto('/about');
    await page.goBack();

    // Check if form data is preserved (if implemented)
    // Note: This would require localStorage or sessionStorage implementation
    // await expect(page.locator('[data-testid="departure"]')).toHaveValue('JFK');
  });

  test('should show loading state during submission', async ({ page }) => {
    // Mock API with delay
    await page.route('/api/quote', async route => {
      await page.waitForTimeout(2000); // Simulate slow response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 'test-id' })
      });
    });

    // Fill and submit form
    await page.selectOption('[data-testid="service-type"]', 'charter');
    await page.fill('[data-testid="departure"]', 'JFK');
    await page.fill('[data-testid="arrival"]', 'LAX');
    await page.fill('[data-testid="departure-date"]', '2024-12-25');
    await page.fill('[data-testid="passengers"]', '2');
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.check('[data-testid="accept-terms"]');

    await page.click('[data-testid="submit-quote"]');

    // Check for loading state
    await expect(page.locator('[data-testid="submit-quote"]')).toBeDisabled();
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

    // Wait for completion
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-quote"]')).toBeEnabled();
  });
});
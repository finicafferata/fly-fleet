import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should pass accessibility tests on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should pass accessibility tests on quote form', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Focus on the quote form
    await page.locator('[data-testid="quote-form"]').scrollIntoViewIfNeeded();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="quote-form"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should pass accessibility tests on contact form', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation through the page
    await page.keyboard.press('Tab');
    const firstFocusable = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'SELECT'].includes(firstFocusable || '')).toBeTruthy();

    // Test skip link functionality
    await page.keyboard.press('Tab');
    const skipLink = page.locator('[href="#main-content"]');
    if (await skipLink.isVisible()) {
      await skipLink.click();
      const mainContent = await page.evaluate(() => document.activeElement?.getAttribute('id'));
      expect(mainContent).toBe('main-content');
    }
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');

    // Check for proper landmark roles
    await expect(page.locator('main')).toHaveAttribute('role', 'main');
    await expect(page.locator('nav')).toHaveCount(1);
    await expect(page.locator('[role="banner"]')).toHaveCount(1);
    await expect(page.locator('[role="contentinfo"]')).toHaveCount(1);

    // Check form accessibility
    const formInputs = page.locator('input[type="text"], input[type="email"], input[type="tel"], select, textarea');
    const inputCount = await formInputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = formInputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      // Each input should have either a label, aria-label, or aria-labelledby
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        const hasAriaLabel = ariaLabel !== null;
        const hasAriaLabelledBy = ariaLabelledBy !== null;

        expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should work with keyboard navigation only', async ({ page }) => {
    await page.goto('/');

    // Navigate through the quote form using only keyboard
    await page.keyboard.press('Tab'); // Skip link or first focusable
    await page.keyboard.press('Tab'); // Service type
    await page.keyboard.press('ArrowDown'); // Select charter
    await page.keyboard.press('Tab'); // Departure

    await page.keyboard.type('JFK');
    await page.keyboard.press('Tab'); // Arrival
    await page.keyboard.type('LAX');

    await page.keyboard.press('Tab'); // Date
    await page.keyboard.type('2024-12-25');

    await page.keyboard.press('Tab'); // Passengers
    await page.keyboard.type('2');

    await page.keyboard.press('Tab'); // First name
    await page.keyboard.type('John');

    await page.keyboard.press('Tab'); // Last name
    await page.keyboard.type('Doe');

    await page.keyboard.press('Tab'); // Email
    await page.keyboard.type('john@example.com');

    // Continue until we reach terms checkbox
    let attempts = 0;
    while (attempts < 20) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      if (focused === 'accept-terms') {
        break;
      }
      attempts++;
    }

    await page.keyboard.press('Space'); // Check terms

    // Navigate to submit button
    await page.keyboard.press('Tab');
    const submitButton = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(submitButton).toBe('submit-quote');

    // Don't actually submit to avoid dealing with reCAPTCHA in test
  });

  test('should announce dynamic content changes to screen readers', async ({ page }) => {
    await page.goto('/');

    // Test that form errors are announced
    await page.click('[data-testid="submit-quote"]');

    // Check for aria-live regions with error announcements
    const ariaLiveRegions = page.locator('[aria-live]');
    await expect(ariaLiveRegions).toHaveCount(1, { timeout: 10000 });

    // Check that error messages have proper role
    const alertElements = page.locator('[role="alert"]');
    await expect(alertElements.first()).toBeVisible();
  });

  test('should support high contrast mode', async ({ page }) => {
    await page.goto('/');

    // Simulate high contrast mode
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            border: 2px solid !important;
          }
        }
      `
    });

    // Test with forced high contrast
    await page.emulateMedia({ forcedColors: 'active' });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    // Should not have critical violations in high contrast mode
    const criticalViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'critical' || violation.impact === 'serious'
    );
    expect(criticalViolations).toEqual([]);
  });

  test('should respect reduced motion preferences', async ({ page }) => {
    await page.goto('/');

    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Check that animations are disabled or reduced
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]');
    const count = await animatedElements.count();

    for (let i = 0; i < count; i++) {
      const element = animatedElements.nth(i);
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          animationDuration: computed.animationDuration,
          transitionDuration: computed.transitionDuration,
        };
      });

      // Animations should be disabled or very short
      if (styles.animationDuration !== 'none') {
        const duration = parseFloat(styles.animationDuration);
        expect(duration).toBeLessThanOrEqual(0.01); // 10ms or less
      }
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    const headingLevels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll(elements =>
      elements.map(el => parseInt(el.tagName.charAt(1)))
    );

    // Should have exactly one H1
    const h1Count = headingLevels.filter(level => level === 1).length;
    expect(h1Count).toBe(1);

    // Check heading hierarchy (no skipping levels)
    for (let i = 1; i < headingLevels.length; i++) {
      const current = headingLevels[i];
      const previous = headingLevels[i - 1];

      // Should not skip more than one level
      expect(current - previous).toBeLessThanOrEqual(1);
    }
  });

  test('should provide alternative text for images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      const ariaLabel = await img.getAttribute('aria-label');

      // Images should have alt text, or be marked as decorative
      const hasAltText = alt !== null && alt.trim() !== '';
      const isDecorative = role === 'presentation' || alt === '';
      const hasAriaLabel = ariaLabel !== null && ariaLabel.trim() !== '';

      expect(hasAltText || isDecorative || hasAriaLabel).toBeTruthy();
    }
  });

  test('should handle focus trapping in modals', async ({ page }) => {
    await page.goto('/');

    // Try to open a modal (if any exist)
    const modalTriggers = page.locator('[data-testid*="modal"], [aria-haspopup="dialog"]');
    const triggerCount = await modalTriggers.count();

    if (triggerCount > 0) {
      await modalTriggers.first().click();

      // Check if modal is open
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        // Test focus trapping
        await page.keyboard.press('Tab');
        const firstFocused = await page.evaluate(() => document.activeElement?.tagName);

        // Press Shift+Tab to go to last focusable element
        await page.keyboard.press('Shift+Tab');
        const lastFocused = await page.evaluate(() => document.activeElement?.tagName);

        // Tab should cycle back to first element
        await page.keyboard.press('Tab');
        const cycledBack = await page.evaluate(() => document.activeElement?.tagName);

        expect(firstFocused).toBe(cycledBack);

        // Close modal
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
      }
    }
  });
});
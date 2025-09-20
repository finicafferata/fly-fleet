import { test, expect } from '@playwright/test';

test.describe('Performance Load Tests', () => {
  test('should handle concurrent form submissions', async ({ browser }) => {
    const numConcurrentUsers = 5;
    const contexts = await Promise.all(
      Array.from({ length: numConcurrentUsers }, () => browser.newContext())
    );

    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );

    // Set up API mocking for all pages
    await Promise.all(
      pages.map(page =>
        page.route('/api/quote', route => {
          // Simulate some processing time
          setTimeout(() => {
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ success: true, id: 'test-id' })
            });
          }, Math.random() * 1000); // Random delay 0-1s
        })
      )
    );

    // Navigate all pages to the form
    await Promise.all(
      pages.map(page => page.goto('/'))
    );

    // Fill and submit forms concurrently
    const startTime = Date.now();

    const submissions = pages.map(async (page, index) => {
      await page.selectOption('[data-testid="service-type"]', 'charter');
      await page.fill('[data-testid="departure"]', 'JFK');
      await page.fill('[data-testid="arrival"]', 'LAX');
      await page.fill('[data-testid="departure-date"]', '2024-12-25');
      await page.fill('[data-testid="passengers"]', '2');
      await page.fill('[data-testid="first-name"]', `User${index}`);
      await page.fill('[data-testid="last-name"]', 'Test');
      await page.fill('[data-testid="email"]', `user${index}@example.com`);
      await page.check('[data-testid="accept-terms"]');

      // Mock reCAPTCHA
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            ready: (callback) => callback(),
            execute: () => Promise.resolve('test-token')
          };
        `
      });

      await page.click('[data-testid="submit-quote"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

      return Date.now() - startTime;
    });

    const completionTimes = await Promise.all(submissions);
    const maxCompletionTime = Math.max(...completionTimes);

    // All submissions should complete within reasonable time
    expect(maxCompletionTime).toBeLessThan(10000); // 10 seconds

    // Clean up
    await Promise.all(contexts.map(context => context.close()));
  });

  test('should maintain performance under rapid navigation', async ({ page }) => {
    const routes = ['/', '/about', '/services', '/contact'];
    const navigationTimes: number[] = [];

    for (let i = 0; i < 10; i++) {
      for (const route of routes) {
        const startTime = Date.now();
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        const endTime = Date.now();

        navigationTimes.push(endTime - startTime);
      }
    }

    const averageTime = navigationTimes.reduce((sum, time) => sum + time, 0) / navigationTimes.length;
    const maxTime = Math.max(...navigationTimes);

    // Performance should remain consistent
    expect(averageTime).toBeLessThan(2000); // Average under 2s
    expect(maxTime).toBeLessThan(5000); // Max under 5s
  });

  test('should handle large form data efficiently', async ({ page }) => {
    await page.goto('/');

    // Fill form with large text content
    const largeMessage = 'A'.repeat(5000); // 5KB message

    await page.selectOption('[data-testid="service-type"]', 'charter');
    await page.fill('[data-testid="departure"]', 'JFK');
    await page.fill('[data-testid="arrival"]', 'LAX');
    await page.fill('[data-testid="departure-date"]', '2024-12-25');
    await page.fill('[data-testid="passengers"]', '2');
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.fill('[data-testid="message"]', largeMessage);
    await page.check('[data-testid="accept-terms"]');

    // Mock API response
    await page.route('/api/quote', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 'test-id' })
      });
    });

    // Mock reCAPTCHA
    await page.addScriptTag({
      content: `
        window.grecaptcha = {
          ready: (callback) => callback(),
          execute: () => Promise.resolve('test-token')
        };
      `
    });

    const startTime = Date.now();
    await page.click('[data-testid="submit-quote"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    const endTime = Date.now();

    const submissionTime = endTime - startTime;
    expect(submissionTime).toBeLessThan(3000); // Should complete within 3s
  });

  test('should measure Core Web Vitals', async ({ page }) => {
    await page.goto('/');

    // Measure Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            vitals.fid = entry.processingStart - entry.startTime;
          });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // Wait for measurements to complete
        setTimeout(() => {
          resolve(vitals);
        }, 3000);
      });
    });

    // Assert Core Web Vitals thresholds
    if (webVitals.lcp) {
      expect(webVitals.lcp).toBeLessThan(2500); // LCP should be under 2.5s
    }
    if (webVitals.fid) {
      expect(webVitals.fid).toBeLessThan(100); // FID should be under 100ms
    }
    if (webVitals.cls) {
      expect(webVitals.cls).toBeLessThan(0.1); // CLS should be under 0.1
    }
  });

  test('should handle memory leaks during extended usage', async ({ page }) => {
    await page.goto('/');

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Simulate extended usage
    for (let i = 0; i < 50; i++) {
      // Navigate between pages
      await page.goto('/about');
      await page.goto('/services');
      await page.goto('/contact');
      await page.goto('/');

      // Interact with forms
      await page.fill('[data-testid="departure"]', `Airport${i}`);
      await page.fill('[data-testid="arrival"]', `Destination${i}`);
      await page.selectOption('[data-testid="service-type"]', 'charter');

      // Clear form
      await page.reload();
    }

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory usage shouldn't grow excessively
    const memoryIncrease = finalMemory - initialMemory;
    const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

    expect(memoryIncreaseMB).toBeLessThan(50); // Less than 50MB increase
  });

  test('should maintain performance with slow network conditions', async ({ page, context }) => {
    // Simulate slow 3G network
    await context.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should still load within reasonable time on slow network
    expect(loadTime).toBeLessThan(10000); // 10 seconds on slow network

    // Test form interaction
    const interactionStart = Date.now();
    await page.selectOption('[data-testid="service-type"]', 'charter');
    await page.fill('[data-testid="departure"]', 'JFK');
    const interactionTime = Date.now() - interactionStart;

    // Form interactions should remain responsive
    expect(interactionTime).toBeLessThan(2000); // 2 seconds max
  });

  test('should handle API endpoint performance', async ({ page }) => {
    const apiEndpoints = [
      '/api/quote',
      '/api/contact',
      '/api/content',
      '/api/faq',
    ];

    for (const endpoint of apiEndpoints) {
      const responses: number[] = [];

      // Test each endpoint multiple times
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();

        const response = await page.request.post(`http://localhost:3000${endpoint}`, {
          data: getTestDataForEndpoint(endpoint),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;
        responses.push(responseTime);

        // All requests should complete within reasonable time
        expect(responseTime).toBeLessThan(5000); // 5 seconds max
      }

      const averageResponseTime = responses.reduce((sum, time) => sum + time, 0) / responses.length;
      expect(averageResponseTime).toBeLessThan(1000); // Average under 1 second
    }
  });
});

function getTestDataForEndpoint(endpoint: string) {
  switch (endpoint) {
    case '/api/quote':
      return {
        serviceType: 'charter',
        departure: 'JFK',
        arrival: 'LAX',
        departureDate: '2024-12-25',
        passengers: 2,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        acceptTerms: true,
        recaptchaToken: 'test-token',
      };
    case '/api/contact':
      return {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        message: 'Test message',
        recaptchaToken: 'test-token',
      };
    case '/api/content':
      return {
        key: 'test.content',
        locale: 'en',
      };
    case '/api/faq':
      return {
        category: 'general',
        locale: 'en',
      };
    default:
      return {};
  }
}
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global E2E test setup...');

  // Check if the server is running
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the development server to be ready
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    console.log('✅ Development server is ready');

    // Perform any global setup tasks
    // For example: seed test data, set up test users, etc.

    // Clear any existing test data
    console.log('🧹 Cleaning up test data...');

    // Set up test environment variables
    process.env.E2E_TEST_MODE = 'true';
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key';

    console.log('✅ Global setup completed');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
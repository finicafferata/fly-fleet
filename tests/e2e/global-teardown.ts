import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global E2E test teardown...');

  try {
    // Clean up any test data created during tests
    console.log('🗑️ Cleaning up test data...');

    // Reset environment variables
    delete process.env.E2E_TEST_MODE;

    // Any other cleanup tasks
    console.log('✅ Global teardown completed');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;
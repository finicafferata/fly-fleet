#!/usr/bin/env node

/**
 * Test Runner Script for Fly-Fleet
 *
 * This script orchestrates the complete test suite execution
 * and provides detailed reporting for CI/CD environments.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  coverage: {
    threshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  performance: {
    lighthouse: {
      performance: 80,
      accessibility: 95,
      bestPractices: 90,
      seo: 90,
    },
  },
  timeouts: {
    unit: 30000,       // 30 seconds
    integration: 60000, // 1 minute
    e2e: 300000,       // 5 minutes
  },
};

class TestRunner {
  constructor() {
    this.results = {
      unit: null,
      integration: null,
      e2e: null,
      accessibility: null,
      performance: null,
      lighthouse: null,
    };
    this.startTime = Date.now();
    this.isCI = process.env.CI === 'true';
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCommand(command, options = {}) {
    const { timeout = 30000, cwd = process.cwd() } = options;

    return new Promise((resolve, reject) => {
      this.log(`Running: ${command}`);

      const child = spawn('npm', ['run', ...command.split(' ')], {
        cwd,
        stdio: 'inherit',
        shell: true,
      });

      const timer = setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error(`Command timed out after ${timeout}ms: ${command}`));
      }, timeout);

      child.on('exit', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve({ code, success: true });
        } else {
          reject(new Error(`Command failed with code ${code}: ${command}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  async checkPrerequisites() {
    this.log('Checking prerequisites...');

    // Check Node.js version
    const nodeVersion = process.version;
    if (!nodeVersion.startsWith('v18') && !nodeVersion.startsWith('v20')) {
      throw new Error(`Node.js 18+ required, found ${nodeVersion}`);
    }

    // Check if database is available for integration tests
    try {
      const { DATABASE_URL } = process.env;
      if (!DATABASE_URL && !this.isCI) {
        this.log('Warning: DATABASE_URL not set, integration tests may fail', 'error');
      }
    } catch (error) {
      this.log('Database check failed', 'error');
    }

    // Check if all dependencies are installed
    if (!fs.existsSync('node_modules')) {
      this.log('Installing dependencies...');
      await this.runCommand('install');
    }

    this.log('Prerequisites check passed', 'success');
  }

  async runUnitTests() {
    this.log('Running unit tests...');

    try {
      await this.runCommand('test:unit', { timeout: CONFIG.timeouts.unit });
      this.results.unit = { success: true, duration: Date.now() - this.startTime };
      this.log('Unit tests passed', 'success');
    } catch (error) {
      this.results.unit = { success: false, error: error.message };
      throw error;
    }
  }

  async runCoverageTests() {
    this.log('Running coverage tests...');

    try {
      await this.runCommand('test:coverage', { timeout: CONFIG.timeouts.unit });

      // Check coverage thresholds
      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        const { total } = coverage;

        const meetsThreshold =
          total.lines.pct >= CONFIG.coverage.threshold.global.lines &&
          total.functions.pct >= CONFIG.coverage.threshold.global.functions &&
          total.branches.pct >= CONFIG.coverage.threshold.global.branches &&
          total.statements.pct >= CONFIG.coverage.threshold.global.statements;

        if (!meetsThreshold) {
          throw new Error(`Coverage below threshold. Lines: ${total.lines.pct}%, Functions: ${total.functions.pct}%, Branches: ${total.branches.pct}%, Statements: ${total.statements.pct}%`);
        }

        this.log(`Coverage: Lines ${total.lines.pct}%, Functions ${total.functions.pct}%, Branches ${total.branches.pct}%, Statements ${total.statements.pct}%`, 'success');
      }

      this.results.coverage = { success: true };
      this.log('Coverage tests passed', 'success');
    } catch (error) {
      this.results.coverage = { success: false, error: error.message };
      throw error;
    }
  }

  async runIntegrationTests() {
    this.log('Running integration tests...');

    try {
      await this.runCommand('test:integration', { timeout: CONFIG.timeouts.integration });
      this.results.integration = { success: true };
      this.log('Integration tests passed', 'success');
    } catch (error) {
      this.results.integration = { success: false, error: error.message };
      throw error;
    }
  }

  async runE2ETests() {
    this.log('Running E2E tests...');

    try {
      // Install Playwright browsers if needed
      if (!fs.existsSync('node_modules/@playwright/test')) {
        this.log('Installing Playwright...');
        execSync('npx playwright install', { stdio: 'inherit' });
      }

      await this.runCommand('test:e2e', { timeout: CONFIG.timeouts.e2e });
      this.results.e2e = { success: true };
      this.log('E2E tests passed', 'success');
    } catch (error) {
      this.results.e2e = { success: false, error: error.message };
      throw error;
    }
  }

  async runAccessibilityTests() {
    this.log('Running accessibility tests...');

    try {
      await this.runCommand('test:accessibility', { timeout: CONFIG.timeouts.e2e });
      this.results.accessibility = { success: true };
      this.log('Accessibility tests passed', 'success');
    } catch (error) {
      this.results.accessibility = { success: false, error: error.message };
      throw error;
    }
  }

  async runPerformanceTests() {
    this.log('Running performance tests...');

    try {
      await this.runCommand('test:performance', { timeout: CONFIG.timeouts.e2e });
      this.results.performance = { success: true };
      this.log('Performance tests passed', 'success');
    } catch (error) {
      this.results.performance = { success: false, error: error.message };
      throw error;
    }
  }

  async runLighthouseTests() {
    this.log('Running Lighthouse tests...');

    try {
      await this.runCommand('test:lighthouse', { timeout: CONFIG.timeouts.e2e });
      this.results.lighthouse = { success: true };
      this.log('Lighthouse tests passed', 'success');
    } catch (error) {
      this.results.lighthouse = { success: false, error: error.message };
      // Don't fail the entire suite for Lighthouse failures in development
      if (!this.isCI) {
        this.log('Lighthouse tests failed (non-blocking in development)', 'error');
        this.results.lighthouse = { success: false, error: error.message, nonBlocking: true };
      } else {
        throw error;
      }
    }
  }

  generateReport() {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    const report = {
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      environment: {
        node: process.version,
        platform: process.platform,
        ci: this.isCI,
      },
      results: this.results,
      summary: {
        total: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r?.success).length,
        failed: Object.values(this.results).filter(r => r && !r.success && !r.nonBlocking).length,
        nonBlocking: Object.values(this.results).filter(r => r?.nonBlocking).length,
      },
    };

    // Write report to file
    const reportPath = path.join(process.cwd(), 'test-results', 'test-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Log summary
    this.log('='.repeat(50));
    this.log('TEST SUITE SUMMARY');
    this.log('='.repeat(50));
    this.log(`Total Duration: ${Math.round(totalDuration / 1000)}s`);
    this.log(`Tests Passed: ${report.summary.passed}/${report.summary.total}`);
    this.log(`Tests Failed: ${report.summary.failed}`);

    if (report.summary.nonBlocking > 0) {
      this.log(`Non-blocking Failures: ${report.summary.nonBlocking}`);
    }

    // Detailed results
    Object.entries(this.results).forEach(([testType, result]) => {
      if (result) {
        const status = result.success ? '✅' : result.nonBlocking ? '⚠️' : '❌';
        this.log(`${status} ${testType}: ${result.success ? 'PASSED' : 'FAILED'}`);
        if (result.error) {
          this.log(`   Error: ${result.error}`);
        }
      }
    });

    this.log('='.repeat(50));
    this.log(`Report saved to: ${reportPath}`);

    return report;
  }

  async run(options = {}) {
    const {
      skipUnit = false,
      skipIntegration = false,
      skipE2E = false,
      skipAccessibility = false,
      skipPerformance = false,
      skipLighthouse = false,
      coverage = true,
    } = options;

    try {
      await this.checkPrerequisites();

      // Run tests in order
      if (!skipUnit) {
        if (coverage) {
          await this.runCoverageTests();
        } else {
          await this.runUnitTests();
        }
      }

      if (!skipIntegration) {
        await this.runIntegrationTests();
      }

      if (!skipE2E) {
        await this.runE2ETests();
      }

      if (!skipAccessibility) {
        await this.runAccessibilityTests();
      }

      if (!skipPerformance) {
        await this.runPerformanceTests();
      }

      if (!skipLighthouse) {
        await this.runLighthouseTests();
      }

      const report = this.generateReport();

      if (report.summary.failed > 0) {
        process.exit(1);
      }

      this.log('All tests completed successfully!', 'success');
      process.exit(0);

    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
      this.generateReport();
      process.exit(1);
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  args.forEach(arg => {
    switch (arg) {
      case '--skip-unit':
        options.skipUnit = true;
        break;
      case '--skip-integration':
        options.skipIntegration = true;
        break;
      case '--skip-e2e':
        options.skipE2E = true;
        break;
      case '--skip-accessibility':
        options.skipAccessibility = true;
        break;
      case '--skip-performance':
        options.skipPerformance = true;
        break;
      case '--skip-lighthouse':
        options.skipLighthouse = true;
        break;
      case '--no-coverage':
        options.coverage = false;
        break;
      case '--help':
        console.log(`
Usage: node scripts/run-tests.js [options]

Options:
  --skip-unit           Skip unit tests
  --skip-integration    Skip integration tests
  --skip-e2e           Skip end-to-end tests
  --skip-accessibility Skip accessibility tests
  --skip-performance   Skip performance tests
  --skip-lighthouse    Skip Lighthouse tests
  --no-coverage        Run unit tests without coverage
  --help               Show this help message

Examples:
  node scripts/run-tests.js                    # Run all tests
  node scripts/run-tests.js --skip-e2e        # Skip E2E tests
  node scripts/run-tests.js --no-coverage     # Skip coverage report
        `);
        process.exit(0);
        break;
    }
  });

  const runner = new TestRunner();
  runner.run(options);
}

module.exports = TestRunner;
import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export interface AccessibilityTestConfig {
  includeTags?: string[];
  excludeRules?: string[];
  disableRules?: string[];
  includedImpacts?: ('minor' | 'moderate' | 'serious' | 'critical')[];
}

export class AccessibilityTester {
  private page: Page;
  private config: AccessibilityTestConfig;

  constructor(page: Page, config: AccessibilityTestConfig = {}) {
    this.page = page;
    this.config = {
      includeTags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      excludeRules: [],
      disableRules: [],
      includedImpacts: ['serious', 'critical'],
      ...config,
    };
  }

  async runFullAccessibilityAudit() {
    const builder = new AxeBuilder({ page: this.page });

    if (this.config.includeTags) {
      builder.withTags(this.config.includeTags);
    }

    if (this.config.excludeRules && this.config.excludeRules.length > 0) {
      builder.exclude(this.config.excludeRules);
    }

    if (this.config.disableRules && this.config.disableRules.length > 0) {
      builder.disableRules(this.config.disableRules);
    }

    const results = await builder.analyze();

    // Filter by impact level if specified
    if (this.config.includedImpacts) {
      results.violations = results.violations.filter(violation =>
        this.config.includedImpacts!.includes(violation.impact as any)
      );
    }

    return results;
  }

  async testKeyboardNavigation() {
    const results = {
      canNavigateWithTab: false,
      hasSkipLinks: false,
      focusTrappingWorks: false,
      allInteractiveElementsFocusable: false,
      focusIndicatorsVisible: false,
    };

    // Test basic tab navigation
    await this.page.keyboard.press('Tab');
    const firstFocusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
    results.canNavigateWithTab = !!firstFocusedElement;

    // Test for skip links
    await this.page.keyboard.press('Tab');
    const skipLink = this.page.locator('a[href="#main-content"], a[href="#content"], .skip-link');
    results.hasSkipLinks = await skipLink.isVisible();

    // Test focus indicators
    const focusedElement = this.page.locator(':focus');
    if (await focusedElement.count() > 0) {
      const outline = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        };
      });

      results.focusIndicatorsVisible = !!(
        outline.outline !== 'none' ||
        parseFloat(outline.outlineWidth) > 0 ||
        outline.boxShadow !== 'none'
      );
    }

    // Test that all interactive elements are focusable
    const interactiveElements = await this.page.locator(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"], [role="menuitem"]'
    ).count();

    let focusableCount = 0;
    for (let i = 0; i < interactiveElements; i++) {
      try {
        await this.page.keyboard.press('Tab');
        const focused = await this.page.evaluate(() => document.activeElement);
        if (focused) focusableCount++;
      } catch (error) {
        // Continue counting
      }
    }

    results.allInteractiveElementsFocusable = focusableCount >= Math.floor(interactiveElements * 0.9);

    return results;
  }

  async testScreenReaderCompatibility() {
    const results = {
      hasProperHeadingStructure: false,
      hasLandmarkRoles: false,
      hasAltTextForImages: false,
      hasLabelsForForms: false,
      hasAriaLiveRegions: false,
    };

    // Test heading structure
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
    if (headings.length > 0) {
      const headingLevels = await Promise.all(
        headings.map(h => h.evaluate(el => parseInt(el.tagName.charAt(1))))
      );

      const hasH1 = headingLevels.includes(1);
      const hasValidHierarchy = headingLevels.every((level, index) => {
        if (index === 0) return true;
        return level <= headingLevels[index - 1] + 1;
      });

      results.hasProperHeadingStructure = hasH1 && hasValidHierarchy;
    }

    // Test landmark roles
    const landmarks = await this.page.locator(
      'main, nav, aside, header, footer, section[aria-labelledby], [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]'
    ).count();
    results.hasLandmarkRoles = landmarks > 0;

    // Test alt text for images
    const images = await this.page.locator('img').all();
    if (images.length > 0) {
      const imagesWithAlt = await Promise.all(
        images.map(async img => {
          const alt = await img.getAttribute('alt');
          const role = await img.getAttribute('role');
          return alt !== null || role === 'presentation';
        })
      );
      results.hasAltTextForImages = imagesWithAlt.every(hasAlt => hasAlt);
    } else {
      results.hasAltTextForImages = true; // No images to test
    }

    // Test form labels
    const inputs = await this.page.locator('input, select, textarea').all();
    if (inputs.length > 0) {
      const inputsWithLabels = await Promise.all(
        inputs.map(async input => {
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');

          if (ariaLabel || ariaLabelledBy) return true;

          if (id) {
            const label = this.page.locator(`label[for="${id}"]`);
            return await label.count() > 0;
          }

          return false;
        })
      );
      results.hasLabelsForForms = inputsWithLabels.every(hasLabel => hasLabel);
    } else {
      results.hasLabelsForForms = true; // No forms to test
    }

    // Test aria-live regions
    const liveRegions = await this.page.locator('[aria-live]').count();
    results.hasAriaLiveRegions = liveRegions > 0;

    return results;
  }

  async testColorContrast() {
    const contrastResults = await this.page.evaluate(() => {
      const getContrast = (fg: string, bg: string) => {
        const getLuminance = (color: string) => {
          const rgb = color.match(/\d+/g);
          if (!rgb) return 0;

          const [r, g, b] = rgb.map(c => {
            const sRGB = parseInt(c) / 255;
            return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
          });

          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };

        const fgLum = getLuminance(fg);
        const bgLum = getLuminance(bg);
        const contrast = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);

        return contrast;
      };

      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a, label, input, select, textarea');
      const contrastIssues: Array<{ element: string; contrast: number; required: number }> = [];

      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        const fontSize = parseFloat(styles.fontSize);

        if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const contrast = getContrast(color, backgroundColor);
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && styles.fontWeight === 'bold');
          const requiredContrast = isLargeText ? 3 : 4.5;

          if (contrast < requiredContrast) {
            contrastIssues.push({
              element: element.tagName.toLowerCase(),
              contrast,
              required: requiredContrast,
            });
          }
        }
      });

      return {
        totalElements: textElements.length,
        issuesFound: contrastIssues.length,
        issues: contrastIssues,
      };
    });

    return contrastResults;
  }

  async testResponsiveAccessibility() {
    const viewports = [
      { width: 320, height: 568, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Desktop' },
    ];

    const results: Record<string, any> = {};

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(500); // Allow for responsive changes

      const accessibility = await this.runFullAccessibilityAudit();
      const keyboard = await this.testKeyboardNavigation();

      results[viewport.name] = {
        violations: accessibility.violations.length,
        keyboardNavigation: keyboard.canNavigateWithTab,
        focusIndicators: keyboard.focusIndicatorsVisible,
      };
    }

    return results;
  }

  async generateAccessibilityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      results: {
        fullAudit: await this.runFullAccessibilityAudit(),
        keyboardNavigation: await this.testKeyboardNavigation(),
        screenReader: await this.testScreenReaderCompatibility(),
        colorContrast: await this.testColorContrast(),
        responsive: await this.testResponsiveAccessibility(),
      },
    };

    return report;
  }
}

export async function runAccessibilityTests(page: Page, config?: AccessibilityTestConfig) {
  const tester = new AccessibilityTester(page, config);
  return await tester.generateAccessibilityReport();
}

export function formatAccessibilityReport(report: any) {
  const { results } = report;

  let summary = `Accessibility Report for ${report.url}\n`;
  summary += `Generated: ${report.timestamp}\n\n`;

  // Full audit summary
  summary += `Full Audit Results:\n`;
  summary += `- Violations: ${results.fullAudit.violations.length}\n`;
  summary += `- Passes: ${results.fullAudit.passes.length}\n`;
  summary += `- Incomplete: ${results.fullAudit.incomplete.length}\n\n`;

  // Keyboard navigation
  summary += `Keyboard Navigation:\n`;
  summary += `- Can navigate with Tab: ${results.keyboardNavigation.canNavigateWithTab ? '✓' : '✗'}\n`;
  summary += `- Has skip links: ${results.keyboardNavigation.hasSkipLinks ? '✓' : '✗'}\n`;
  summary += `- Focus indicators visible: ${results.keyboardNavigation.focusIndicatorsVisible ? '✓' : '✗'}\n\n`;

  // Screen reader compatibility
  summary += `Screen Reader Compatibility:\n`;
  summary += `- Proper heading structure: ${results.screenReader.hasProperHeadingStructure ? '✓' : '✗'}\n`;
  summary += `- Landmark roles: ${results.screenReader.hasLandmarkRoles ? '✓' : '✗'}\n`;
  summary += `- Alt text for images: ${results.screenReader.hasAltTextForImages ? '✓' : '✗'}\n`;
  summary += `- Labels for forms: ${results.screenReader.hasLabelsForForms ? '✓' : '✗'}\n\n`;

  // Color contrast
  summary += `Color Contrast:\n`;
  summary += `- Total elements checked: ${results.colorContrast.totalElements}\n`;
  summary += `- Issues found: ${results.colorContrast.issuesFound}\n\n`;

  // Responsive accessibility
  summary += `Responsive Accessibility:\n`;
  Object.entries(results.responsive).forEach(([viewport, data]: [string, any]) => {
    summary += `- ${viewport}: ${data.violations} violations, keyboard nav: ${data.keyboardNavigation ? '✓' : '✗'}\n`;
  });

  return summary;
}
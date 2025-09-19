'use client';

import React from 'react';
import { AccessibilityProvider } from '../../contexts/AccessibilityContext';
import { KeyboardNavigationProvider } from '../../contexts/KeyboardNavigationContext';
import { QuoteForm } from '../../components/QuoteForm';
import { ContactForm } from '../../components/ContactForm';
import { AirportSearch } from '../../components/AirportSearch';

export default function AccessibilityDemoPage() {
  return (
    <AccessibilityProvider>
      <KeyboardNavigationProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Skip Links are automatically provided by AccessibilityProvider */}

          <header className="bg-white dark:bg-gray-800 shadow">
            <nav id="main-navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      Fly-Fleet Accessibility Demo
                    </h1>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="#quote-section" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    Quote Form
                  </a>
                  <a href="#contact-section" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    Contact Form
                  </a>
                  <a href="#airport-section" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    Airport Search
                  </a>
                </div>
              </div>
            </nav>
          </header>

          <main id="main-content" className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Accessibility Features Demo
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This page demonstrates comprehensive accessibility features including ARIA support,
                  keyboard navigation, screen reader announcements, and WCAG 2.1 AA compliance.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-8">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Accessibility Features Included:
                  </h3>
                  <ul className="text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>Skip links (Tab to see them)</li>
                    <li>ARIA live regions for screen reader announcements</li>
                    <li>Keyboard navigation support</li>
                    <li>Focus management and focus trapping</li>
                    <li>Roving tab index for complex widgets</li>
                    <li>Form validation with accessible error messages</li>
                    <li>Screen reader optimized content</li>
                    <li>WCAG 2.1 AA compliant color contrast</li>
                  </ul>
                </div>
              </div>

              {/* Airport Search Demo */}
              <section id="airport-section" className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Airport Search Component
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Accessible combobox with keyboard navigation, screen reader support, and live search results.
                </p>
                <div className="max-w-md">
                  <AirportSearch
                    onSelect={(airport) => {
                      console.log('Selected airport:', airport);
                    }}
                    placeholder="Search for airports..."
                    label="Demo Airport Search"
                  />
                </div>
              </section>

              {/* Quote Form Demo */}
              <section id="quote-section" className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Quote Request Form
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Comprehensive form with accessibility features, validation, and screen reader support.
                </p>
                <QuoteForm
                  onSubmitSuccess={(data) => {
                    console.log('Quote submitted:', data);
                  }}
                  onSubmitError={(error) => {
                    console.error('Quote error:', error);
                  }}
                />
              </section>

              {/* Contact Form Demo */}
              <section id="contact-section" className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Contact Form
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Accessible contact form with inquiry types, urgency levels, and comprehensive validation.
                </p>
                <ContactForm
                  onSubmitSuccess={(data) => {
                    console.log('Contact submitted:', data);
                  }}
                  onSubmitError={(error) => {
                    console.error('Contact error:', error);
                  }}
                />
              </section>

              {/* Keyboard Navigation Instructions */}
              <section className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Keyboard Navigation Guide
                </h3>
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        General Navigation
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Tab</kbd> - Move to next element</li>
                        <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Shift+Tab</kbd> - Move to previous element</li>
                        <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> - Activate buttons/links</li>
                        <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Space</kbd> - Activate buttons/checkboxes</li>
                        <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Escape</kbd> - Close modals/dropdowns</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Form Navigation
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">↑↓</kbd> - Navigate dropdown options</li>
                        <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">←→</kbd> - Navigate radio buttons</li>
                        <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Home/End</kbd> - First/last option</li>
                        <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">F6</kbd> - Navigate page regions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>

          <footer id="footer" className="bg-white dark:bg-gray-800 shadow mt-8">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-600 dark:text-gray-400">
                © 2024 Fly-Fleet. Accessibility-first design with WCAG 2.1 AA compliance.
              </p>
            </div>
          </footer>
        </div>
      </KeyboardNavigationProvider>
    </AccessibilityProvider>
  );
}
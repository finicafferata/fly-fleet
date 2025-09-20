'use client';

// Enhanced GA4 integration with accessibility considerations

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

interface AccessibilityFeatures {
  screenReaderDetected: boolean;
  highContrastMode: boolean;
  reducedMotionPreference: boolean;
  keyboardNavigationUsed: boolean;
  focusVisible: boolean;
  voiceControlDetected: boolean;
  touchDevice: boolean;
}

interface UserJourneyContext {
  sessionId: string;
  userId?: string;
  pageSequence: string[];
  timeOnSite: number;
  interactionMethod: 'keyboard' | 'mouse' | 'touch' | 'voice' | 'mixed';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  locale: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface ConversionEvent {
  event_category: 'conversion' | 'engagement' | 'navigation' | 'accessibility' | 'technical';
  event_label: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// Accessibility feature detection
function getActiveA11yFeatures(): AccessibilityFeatures {
  if (typeof window === 'undefined') {
    return {
      screenReaderDetected: false,
      highContrastMode: false,
      reducedMotionPreference: false,
      keyboardNavigationUsed: false,
      focusVisible: false,
      voiceControlDetected: false,
      touchDevice: false,
    };
  }

  return {
    screenReaderDetected: isScreenReaderActive(),
    highContrastMode: window.matchMedia('(prefers-contrast: high)').matches,
    reducedMotionPreference: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    keyboardNavigationUsed: hasKeyboardNavigation(),
    focusVisible: hasFocusVisible(),
    voiceControlDetected: hasVoiceControl(),
    touchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  };
}

function isScreenReaderActive(): boolean {
  // Multiple detection methods for screen readers
  return !!(
    window.speechSynthesis ||
    window.navigator.userAgent.includes('NVDA') ||
    window.navigator.userAgent.includes('JAWS') ||
    window.navigator.userAgent.includes('VoiceOver') ||
    document.querySelector('[aria-live]') ||
    document.querySelector('[role="alert"]')
  );
}

function hasKeyboardNavigation(): boolean {
  // Track if user has used keyboard navigation
  return document.body.classList.contains('user-is-tabbing') ||
         sessionStorage.getItem('keyboard-nav-used') === 'true';
}

function hasFocusVisible(): boolean {
  return document.body.classList.contains('focus-visible') ||
         CSS.supports('selector(:focus-visible)');
}

function hasVoiceControl(): boolean {
  // Detect voice control/speech recognition
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getCurrentLocale(): string {
  return document.documentElement.lang || 'en';
}

function getUTMParam(param: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || sessionStorage.getItem(param) || null;
}

// Session management
let sessionContext: UserJourneyContext | null = null;

function initializeSession(): UserJourneyContext {
  if (sessionContext) return sessionContext;

  const sessionId = sessionStorage.getItem('fly-fleet-session-id') ||
                   generateSessionId();
  sessionStorage.setItem('fly-fleet-session-id', sessionId);

  sessionContext = {
    sessionId,
    pageSequence: [window.location.pathname],
    timeOnSite: 0,
    interactionMethod: 'mouse', // Default, will be updated based on actual usage
    deviceType: getDeviceType(),
    locale: getCurrentLocale(),
    utm_source: getUTMParam('utm_source'),
    utm_medium: getUTMParam('utm_medium'),
    utm_campaign: getUTMParam('utm_campaign'),
  };

  return sessionContext;
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Consent management
function hasAnalyticsConsent(): boolean {
  // Check if user has consented to analytics
  const consent = localStorage.getItem('analytics-consent');
  return consent === 'granted';
}

function setAnalyticsConsent(granted: boolean): void {
  localStorage.setItem('analytics-consent', granted ? 'granted' : 'denied');

  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied', // We don't use advertising cookies
    });
  }
}

// Core tracking function
function trackAccessibleEvent(eventName: string, parameters: ConversionEvent): void {
  // Check if user has consented to analytics
  if (!hasAnalyticsConsent()) {
    console.log('Analytics tracking skipped: No user consent');
    return;
  }

  if (typeof window.gtag !== 'function') {
    console.warn('Google Analytics not loaded');
    return;
  }

  const session = initializeSession();
  const a11yFeatures = getActiveA11yFeatures();

  // Add accessibility context to all events
  const enhancedParams = {
    ...parameters.custom_parameters,
    event_category: parameters.event_category,
    event_label: parameters.event_label,
    value: parameters.value,

    // Accessibility features
    accessibility_features_used: Object.keys(a11yFeatures).filter(key =>
      a11yFeatures[key as keyof AccessibilityFeatures]
    ).join(','),
    screen_reader_detected: a11yFeatures.screenReaderDetected,
    high_contrast_mode: a11yFeatures.highContrastMode,
    reduced_motion_preference: a11yFeatures.reducedMotionPreference,
    keyboard_navigation_used: a11yFeatures.keyboardNavigationUsed,

    // Device and context
    device_type: session.deviceType,
    locale: session.locale,
    page_path: window.location.pathname,
    session_id: session.sessionId,

    // UTM parameters
    utm_source: session.utm_source,
    utm_medium: session.utm_medium,
    utm_campaign: session.utm_campaign,

    // User journey
    pages_visited: session.pageSequence.length,
    interaction_method: session.interactionMethod,
  };

  // Track the event
  window.gtag('event', eventName, enhancedParams);

  // Also log to our internal analytics for debugging
  logInternalEvent(eventName, enhancedParams);
}

// Form interaction tracking with exact GA4 format
function trackFormStart(): void {
  if (!hasAnalyticsConsent() || typeof window.gtag !== 'function') return;

  // Exact GA4 format as specified
  window.gtag('event', 'form_start', {
    event_category: 'conversion',
    form_type: 'quote_request',
    page_path: window.location.pathname,
    locale: getCurrentLocale(),
    utm_source: getUTMParam('utm_source'),
    utm_medium: getUTMParam('utm_medium'),
    utm_campaign: getUTMParam('utm_campaign'),
    device_type: getDeviceType()
  });

  logInternalEvent('form_start', { form_type: 'quote_request' });
}

// Form submit tracking with exact GA4 format
function trackFormSubmitQuote(formData: any): void {
  if (!hasAnalyticsConsent() || typeof window.gtag !== 'function') return;

  // Exact GA4 format as specified
  window.gtag('event', 'form_submit_quote', {
    event_category: 'conversion',
    event_label: getCurrentLocale(),
    service_type: formData.service,
    route: `${formData.origin}-${formData.destination}`,
    passengers: formData.passengers,
    standard_bags: formData.standardBagsCount || 0,
    has_pets: formData.pets || false,
    additional_services_count: formData.additionalServices?.length || 0,
    page_path: window.location.pathname,
    locale: getCurrentLocale(),
    utm_source: getUTMParam('utm_source'),
    utm_medium: getUTMParam('utm_medium'),
    utm_campaign: getUTMParam('utm_campaign'),
    device_type: getDeviceType(),
    value: 1 // Conversion value
  });

  logInternalEvent('form_submit_quote', {
    service_type: formData.service,
    route: `${formData.origin}-${formData.destination}`,
  });
}

// Page view tracking with exact GA4 format
function trackPageView(pagePath?: string): void {
  if (!hasAnalyticsConsent() || typeof window.gtag !== 'function') return;

  const session = initializeSession();
  const currentPath = pagePath || window.location.pathname;

  // Update page sequence
  if (!session.pageSequence.includes(currentPath)) {
    session.pageSequence.push(currentPath);
  }

  // Exact GA4 format as specified
  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: currentPath,
    locale: getCurrentLocale(),
    utm_source: getUTMParam('utm_source'),
    utm_medium: getUTMParam('utm_medium'),
    utm_campaign: getUTMParam('utm_campaign'),
    device_type: getDeviceType()
  });

  // Also log to internal analytics
  logInternalEvent('page_view', {
    page_title: document.title,
    page_path: currentPath,
    locale: getCurrentLocale(),
  });
}

// CTA click tracking with exact GA4 format
function trackCTAClick(ctaType: string, ctaText: string, position: string): void {
  if (!hasAnalyticsConsent() || typeof window.gtag !== 'function') return;

  // Exact GA4 format as specified
  window.gtag('event', 'cta_click', {
    event_category: 'engagement',
    event_label: ctaType, // 'quote_button', 'whatsapp_widget', 'header_cta'
    page_path: window.location.pathname,
    locale: getCurrentLocale(),
    cta_position: position, // 'hero', 'footer', 'floating'
    device_type: getDeviceType()
  });

  // Also log to internal analytics
  logInternalEvent('cta_click', {
    event_category: 'engagement',
    event_label: ctaType,
    cta_position: position,
  });
}

// WhatsApp click tracking with exact GA4 format
function trackWhatsAppClick(formData?: any): void {
  if (!hasAnalyticsConsent() || typeof window.gtag !== 'function') return;

  // Exact GA4 format as specified
  window.gtag('event', 'click_whatsapp', {
    event_category: 'cta',
    event_label: getCurrentLocale(),
    page_path: window.location.pathname,
    locale: getCurrentLocale(),
    form_data_available: !!formData,
    utm_source: getUTMParam('utm_source'),
    utm_medium: getUTMParam('utm_medium'),
    utm_campaign: getUTMParam('utm_campaign'),
    device_type: getDeviceType()
  });

  logInternalEvent('click_whatsapp', {
    page_path: window.location.pathname,
    form_data_available: !!formData,
  });
}

// Contact success tracking with exact GA4 format
function trackContactSuccess(contactType: 'form_submission' | 'whatsapp_click' = 'form_submission'): void {
  if (!hasAnalyticsConsent() || typeof window.gtag !== 'function') return;

  // Exact GA4 format as specified
  window.gtag('event', 'contact_success', {
    event_category: 'conversion',
    contact_type: contactType,
    page_path: window.location.pathname,
    locale: getCurrentLocale(),
    device_type: getDeviceType()
  });

  logInternalEvent('contact_success', {
    contact_type: contactType,
    page_path: window.location.pathname,
  });
}

// Generic conversion tracking for backward compatibility
function trackConversion(conversionType: string, conversionValue?: number): void {
  if (conversionType === 'contact_success') {
    trackContactSuccess('form_submission');
  } else {
    trackAccessibleEvent('conversion', {
      event_category: 'conversion',
      event_label: conversionType,
      value: conversionValue || 1,
      custom_parameters: {
        conversion_type: conversionType,
        conversion_timestamp: new Date().toISOString(),
        session_duration: getSessionDuration(),
        pages_before_conversion: sessionContext?.pageSequence.length || 1,
      },
    });
  }
}

// Helper functions
function getInteractionMethod(): 'keyboard' | 'mouse' | 'touch' | 'voice' | 'mixed' {
  const a11yFeatures = getActiveA11yFeatures();

  if (a11yFeatures.voiceControlDetected) return 'voice';
  if (a11yFeatures.touchDevice && a11yFeatures.keyboardNavigationUsed) return 'mixed';
  if (a11yFeatures.touchDevice) return 'touch';
  if (a11yFeatures.keyboardNavigationUsed) return 'keyboard';
  return 'mouse';
}

function getPageLoadTime(): number {
  if (typeof window.performance === 'undefined') return 0;
  const timing = window.performance.timing;
  return timing.loadEventEnd - timing.navigationStart;
}

function isRepeatVisitor(): boolean {
  const visitCount = parseInt(localStorage.getItem('visit-count') || '0');
  return visitCount > 1;
}

function getUserJourneyStage(): string {
  if (!sessionContext) return 'unknown';

  const pathsVisited = sessionContext.pageSequence;

  if (pathsVisited.includes('/quote')) return 'conversion';
  if (pathsVisited.includes('/contact')) return 'contact';
  if (pathsVisited.includes('/services')) return 'consideration';
  if (pathsVisited.length === 1) return 'landing';
  return 'exploration';
}

function getSessionDuration(): number {
  if (!sessionContext) return 0;
  return Date.now() - parseInt(sessionContext.sessionId.split('-')[0]);
}

function logInternalEvent(eventName: string, parameters: any): void {
  // Log to internal analytics for debugging and backup
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventName, parameters);
  }

  // Send to internal API for backup tracking
  fetch('/api/analytics/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      parameters,
      timestamp: new Date().toISOString(),
    }),
  }).catch(error => {
    console.warn('Internal analytics logging failed:', error);
  });
}

// Initialize tracking on page load
if (typeof window !== 'undefined') {
  // Track interaction methods
  document.addEventListener('keydown', () => {
    sessionStorage.setItem('keyboard-nav-used', 'true');
    document.body.classList.add('user-is-tabbing');
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('user-is-tabbing');
  });

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      trackAccessibleEvent('page_visibility', {
        event_category: 'engagement',
        event_label: 'page_hidden',
        custom_parameters: {
          time_on_page: getSessionDuration(),
        },
      });
    }
  });

  // Initialize session on load
  window.addEventListener('load', () => {
    initializeSession();
    trackPageView();
  });
}

export {
  trackAccessibleEvent,
  trackFormStart,
  trackFormSubmitQuote,
  trackPageView,
  trackCTAClick,
  trackWhatsAppClick,
  trackContactSuccess,
  trackConversion,
  hasAnalyticsConsent,
  setAnalyticsConsent,
  getActiveA11yFeatures,
  initializeSession,
};
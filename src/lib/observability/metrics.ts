/**
 * Application Metrics
 *
 * Provides counters, histograms, and gauges for tracking application performance
 * and business metrics using OpenTelemetry.
 *
 * Metrics are automatically exported to Vercel's observability dashboard
 * and can also be sent to external providers (Honeycomb, Datadog, etc.)
 *
 * @see https://opentelemetry.io/docs/concepts/signals/metrics/
 */

import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('fly-fleet', '1.0.0');

/**
 * API Request Counters
 *
 * Track total number of requests by endpoint, status, and method
 */
export const apiRequestCounter = meter.createCounter('api.requests.total', {
  description: 'Total number of API requests',
  unit: '1',
});

/**
 * API Request Duration Histogram
 *
 * Track request latency distribution for performance monitoring
 * Useful for calculating P50, P95, P99 percentiles
 */
export const apiDurationHistogram = meter.createHistogram('api.request.duration', {
  description: 'API request duration in milliseconds',
  unit: 'ms',
});

/**
 * Database Query Counters
 *
 * Track database operations (queries, mutations)
 */
export const dbQueryCounter = meter.createCounter('db.queries.total', {
  description: 'Total number of database queries',
  unit: '1',
});

/**
 * Database Query Duration Histogram
 *
 * Track database query latency
 */
export const dbQueryDurationHistogram = meter.createHistogram('db.query.duration', {
  description: 'Database query duration in milliseconds',
  unit: 'ms',
});

/**
 * Email Sent Counter
 *
 * Track email delivery success and failures
 */
export const emailSentCounter = meter.createCounter('email.sent.total', {
  description: 'Total number of emails sent',
  unit: '1',
});

/**
 * Quote Request Counter
 *
 * Business metric: track quote request submissions
 */
export const quoteRequestCounter = meter.createCounter('business.quotes.submitted', {
  description: 'Total number of quote requests submitted',
  unit: '1',
});

/**
 * Contact Form Counter
 *
 * Business metric: track contact form submissions
 */
export const contactFormCounter = meter.createCounter('business.contacts.submitted', {
  description: 'Total number of contact forms submitted',
  unit: '1',
});

/**
 * WhatsApp Link Counter
 *
 * Business metric: track WhatsApp link generations
 */
export const whatsappLinkCounter = meter.createCounter('business.whatsapp.generated', {
  description: 'Total number of WhatsApp links generated',
  unit: '1',
});

/**
 * Rate Limit Hit Counter
 *
 * Track rate limit hits for abuse monitoring
 */
export const rateLimitHitCounter = meter.createCounter('ratelimit.hits.total', {
  description: 'Total number of rate limit hits',
  unit: '1',
});

/**
 * Cache Hit/Miss Counters
 *
 * Track cache effectiveness
 */
export const cacheHitCounter = meter.createCounter('cache.hits.total', {
  description: 'Total number of cache hits',
  unit: '1',
});

export const cacheMissCounter = meter.createCounter('cache.misses.total', {
  description: 'Total number of cache misses',
  unit: '1',
});

/**
 * Error Counter
 *
 * Track application errors by type and severity
 */
export const errorCounter = meter.createCounter('errors.total', {
  description: 'Total number of errors',
  unit: '1',
});

/**
 * Helper: Record API request metrics
 *
 * @param endpoint - API endpoint path
 * @param method - HTTP method
 * @param status - HTTP status code
 * @param duration - Request duration in milliseconds
 */
export function recordApiRequest(
  endpoint: string,
  method: string,
  status: number,
  duration: number
): void {
  apiRequestCounter.add(1, {
    endpoint,
    method,
    status,
    success: status < 400,
  });

  apiDurationHistogram.record(duration, {
    endpoint,
    method,
  });
}

/**
 * Helper: Record database query metrics
 *
 * @param operation - Query operation (findMany, create, update, etc.)
 * @param model - Database model name
 * @param duration - Query duration in milliseconds
 * @param success - Whether query succeeded
 */
export function recordDbQuery(
  operation: string,
  model: string,
  duration: number,
  success: boolean = true
): void {
  dbQueryCounter.add(1, {
    operation,
    model,
    success,
  });

  dbQueryDurationHistogram.record(duration, {
    operation,
    model,
  });
}

/**
 * Helper: Record email sent metric
 *
 * @param template - Email template name
 * @param success - Whether email was sent successfully
 * @param provider - Email provider (resend, ses, etc.)
 */
export function recordEmailSent(
  template: string,
  success: boolean,
  provider: string = 'resend'
): void {
  emailSentCounter.add(1, {
    template,
    success,
    provider,
  });
}

/**
 * Helper: Record cache operation
 *
 * @param operation - Cache operation (get, set, del)
 * @param hit - Whether it was a cache hit (only for 'get')
 * @param key - Cache key prefix (for grouping)
 */
export function recordCacheOperation(
  operation: 'get' | 'set' | 'del',
  hit?: boolean,
  key?: string
): void {
  if (operation === 'get' && hit !== undefined) {
    if (hit) {
      cacheHitCounter.add(1, { key });
    } else {
      cacheMissCounter.add(1, { key });
    }
  }
}

/**
 * Helper: Record error
 *
 * @param type - Error type (validation, database, external_api, etc.)
 * @param severity - Error severity (low, medium, high, critical)
 * @param message - Optional error message
 */
export function recordError(
  type: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  message?: string
): void {
  errorCounter.add(1, {
    type,
    severity,
    message: message?.substring(0, 100), // Truncate for cardinality
  });
}

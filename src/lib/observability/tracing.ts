/**
 * Distributed Tracing Utilities
 *
 * Provides helper functions for creating and managing OpenTelemetry spans
 * for distributed tracing across serverless functions.
 *
 * Key concepts:
 * - Span: A unit of work (e.g., database query, API call, function execution)
 * - Trace: A collection of spans that represent a request flow
 * - Attributes: Key-value metadata attached to spans
 *
 * @see https://opentelemetry.io/docs/concepts/signals/traces/
 */

import { trace, context, SpanStatusCode, Span } from '@opentelemetry/api';

const tracer = trace.getTracer('fly-fleet', '1.0.0');

/**
 * Execute a function within a traced span
 *
 * Automatically handles span lifecycle, error recording, and status codes
 *
 * @param name - Descriptive name for the span (e.g., "db.query.quotes", "email.send")
 * @param fn - Async function to execute within the span
 * @param attributes - Optional metadata to attach to the span
 * @returns Result of the executed function
 *
 * @example
 * const quotes = await withSpan('db.query.quotes', async () => {
 *   return await prisma.quoteRequest.findMany();
 * }, { locale: 'en', limit: 10 });
 */
export async function withSpan<T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Record<string, any>
): Promise<T> {
  const span = tracer.startSpan(name, { attributes });

  try {
    const result = await context.with(trace.setSpan(context.active(), span), fn);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.recordException(error as Error);
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Execute a synchronous function within a traced span
 *
 * @param name - Descriptive name for the span
 * @param fn - Synchronous function to execute within the span
 * @param attributes - Optional metadata to attach to the span
 * @returns Result of the executed function
 */
export function withSpanSync<T>(
  name: string,
  fn: () => T,
  attributes?: Record<string, any>
): T {
  const span = tracer.startSpan(name, { attributes });

  try {
    const result = context.with(trace.setSpan(context.active(), span), fn);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.recordException(error as Error);
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Get the current active span
 *
 * Useful for adding attributes or events to the current span
 *
 * @returns Current active span or undefined if no span is active
 */
export function getCurrentSpan(): Span | undefined {
  return trace.getSpan(context.active());
}

/**
 * Add attributes to the current active span
 *
 * @param attributes - Key-value pairs to add to the current span
 *
 * @example
 * addSpanAttributes({ userId: '123', action: 'quote_submit' });
 */
export function addSpanAttributes(attributes: Record<string, any>): void {
  const span = getCurrentSpan();
  if (span) {
    span.setAttributes(attributes);
  }
}

/**
 * Add an event to the current active span
 *
 * Events are timestamped occurrences within a span
 *
 * @param name - Event name
 * @param attributes - Optional event attributes
 *
 * @example
 * addSpanEvent('email.sent', { recipient: 'user@example.com', template: 'quote' });
 */
export function addSpanEvent(name: string, attributes?: Record<string, any>): void {
  const span = getCurrentSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Record an exception in the current active span
 *
 * @param error - Error object to record
 */
export function recordSpanException(error: Error): void {
  const span = getCurrentSpan();
  if (span) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR });
  }
}

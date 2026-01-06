/**
 * Structured Logging Utility
 *
 * Provides JSON-formatted logging with automatic trace context injection
 * for correlation between logs, traces, and metrics.
 *
 * Logs are automatically sent to Vercel's logging system and can be
 * integrated with external log aggregators (Datadog, Logtail, etc.)
 *
 * @see https://vercel.com/docs/observability/runtime-logs
 */

import { trace, context } from '@opentelemetry/api';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  environment: string;
  traceId?: string;
  spanId?: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

class Logger {
  private service: string;
  private environment: string;

  constructor() {
    this.service = 'fly-fleet';
    this.environment = process.env.NODE_ENV || 'development';
  }

  /**
   * Get current trace context for log correlation
   */
  private getTraceContext(): { traceId?: string; spanId?: string } {
    const span = trace.getSpan(context.active());
    if (!span) return {};

    const spanContext = span.spanContext();
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
    };
  }

  /**
   * Build structured log object
   */
  private buildLog(
    level: LogLevel,
    message: string,
    ctx?: LogContext,
    error?: Error
  ): StructuredLog {
    const log: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      environment: this.environment,
      ...this.getTraceContext(),
    };

    if (ctx) {
      log.context = ctx;
    }

    if (error) {
      log.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }

    return log;
  }

  /**
   * Output log to console (JSON in production, pretty in development)
   */
  private output(log: StructuredLog): void {
    const output = this.environment === 'production'
      ? JSON.stringify(log)
      : this.prettyPrint(log);

    switch (log.level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }
  }

  /**
   * Pretty print log for development
   */
  private prettyPrint(log: StructuredLog): string {
    const emoji = {
      debug: '🔍',
      info: '📘',
      warn: '⚠️',
      error: '❌',
    };

    let output = `${emoji[log.level]} [${log.level.toUpperCase()}] ${log.message}`;

    if (log.context) {
      output += `\n   Context: ${JSON.stringify(log.context, null, 2)}`;
    }

    if (log.error) {
      output += `\n   Error: ${log.error.message}`;
      if (log.error.stack) {
        output += `\n   Stack: ${log.error.stack}`;
      }
    }

    if (log.traceId) {
      output += `\n   TraceID: ${log.traceId}`;
    }

    return output;
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    if (this.environment === 'development') {
      const log = this.buildLog('debug', message, context);
      this.output(log);
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    const log = this.buildLog('info', message, context);
    this.output(log);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    const log = this.buildLog('warn', message, context);
    this.output(log);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const log = this.buildLog('error', message, context, error);
    this.output(log);
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    const originalBuildLog = childLogger.buildLog.bind(childLogger);

    childLogger.buildLog = (level, message, ctx, error) => {
      return originalBuildLog(level, message, { ...context, ...ctx }, error);
    };

    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Create logger with request context
 *
 * @param requestId - Unique request identifier
 * @param endpoint - API endpoint path
 * @param method - HTTP method
 * @returns Logger instance with request context
 */
export function createRequestLogger(
  requestId: string,
  endpoint: string,
  method: string
): Logger {
  return logger.child({
    requestId,
    endpoint,
    method,
  });
}

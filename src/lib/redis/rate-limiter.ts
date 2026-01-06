import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './client';

/**
 * Distributed Rate Limiting for Serverless Functions
 *
 * Uses Upstash Redis for distributed rate limiting across
 * all serverless function instances.
 *
 * Replaces in-memory Map-based rate limiting which only works
 * within a single function instance.
 *
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

/**
 * Quote Form Rate Limiter
 *
 * Limits: 7 requests per hour per IP
 * Algorithm: Sliding window (more accurate than fixed window)
 * Analytics: Enabled for monitoring
 */
export const quoteRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(7, '1 h'),
  analytics: true,
  prefix: 'ratelimit:quote',
});

/**
 * Contact Form Rate Limiter
 *
 * Limits: 5 requests per hour per IP
 * Algorithm: Sliding window
 * Analytics: Enabled for monitoring
 */
export const contactRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  analytics: true,
  prefix: 'ratelimit:contact',
});

/**
 * WhatsApp Link Rate Limiter
 *
 * Limits: 20 requests per hour per IP
 * More lenient since it's just link generation
 * Algorithm: Sliding window
 * Analytics: Enabled for monitoring
 */
export const whatsappRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  analytics: true,
  prefix: 'ratelimit:whatsapp',
});

/**
 * General API Rate Limiter
 *
 * Limits: 100 requests per minute per IP
 * For general API endpoints that need basic protection
 * Algorithm: Sliding window
 */
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:api',
});

/**
 * Strict Rate Limiter (for sensitive operations)
 *
 * Limits: 3 requests per 10 minutes per IP
 * For very sensitive operations like password reset
 * Algorithm: Sliding window
 */
export const strictRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  analytics: true,
  prefix: 'ratelimit:strict',
});

/**
 * Rate Limit Result Interface
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in milliseconds
  pending: Promise<unknown>;
}

/**
 * Check rate limit for an identifier
 *
 * @param limiter Rate limiter to use
 * @param identifier Unique identifier (usually IP address)
 * @returns Rate limit check result
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<RateLimitResult> {
  try {
    const result = await limiter.limit(identifier);
    return result;
  } catch (error) {
    console.error('Rate limit check error:', error);

    // Fail open - allow request if Redis is down
    // This prevents Redis outages from blocking all traffic
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now() + 60000,
      pending: Promise.resolve()
    };
  }
}

/**
 * Format rate limit headers for HTTP response
 *
 * @param result Rate limit result
 * @returns Headers object
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}

/**
 * Get rate limit analytics for monitoring
 *
 * @param prefix Rate limiter prefix
 * @returns Analytics data (if available)
 */
export async function getRateLimitAnalytics(prefix: string) {
  try {
    // Get analytics keys from Redis
    // This is a placeholder - actual implementation depends on Upstash analytics API
    return {
      prefix,
      message: 'View detailed analytics in Upstash dashboard'
    };
  } catch (error) {
    console.error('Rate limit analytics error:', error);
    return null;
  }
}

/**
 * Reset rate limit for an identifier (admin use)
 *
 * @param prefix Rate limiter prefix
 * @param identifier Identifier to reset
 */
export async function resetRateLimit(prefix: string, identifier: string): Promise<void> {
  try {
    // Delete rate limit keys for the identifier
    const pattern = `${prefix}:${identifier}*`;
    // Note: This requires Redis SCAN command which may not be available in all Upstash plans
    await redis.del(`${prefix}:${identifier}`);
    console.log(`Reset rate limit for ${identifier} on ${prefix}`);
  } catch (error) {
    console.error('Rate limit reset error:', error);
  }
}

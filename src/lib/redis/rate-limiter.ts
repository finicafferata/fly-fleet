/**
 * In-memory sliding window rate limiter
 *
 * Replaces Upstash Ratelimit. Works per serverless instance —
 * sufficient for current traffic levels.
 */

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending: Promise<unknown>;
}

class InMemoryRatelimit {
  private store = new Map<string, number[]>();
  private max: number;
  private windowMs: number;

  constructor(max: number, windowMs: number) {
    this.max = max;
    this.windowMs = windowMs;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const timestamps = (this.store.get(identifier) ?? []).filter(t => t > windowStart);
    timestamps.push(now);
    this.store.set(identifier, timestamps);

    const count = timestamps.length;
    return {
      success: count <= this.max,
      limit: this.max,
      remaining: Math.max(0, this.max - count),
      reset: now + this.windowMs,
      pending: Promise.resolve()
    };
  }
}

export const quoteRateLimiter = new InMemoryRatelimit(7, 60 * 60 * 1000);
export const contactRateLimiter = new InMemoryRatelimit(5, 60 * 60 * 1000);
export const whatsappRateLimiter = new InMemoryRatelimit(20, 60 * 60 * 1000);
export const apiRateLimiter = new InMemoryRatelimit(100, 60 * 1000);
export const strictRateLimiter = new InMemoryRatelimit(3, 10 * 60 * 1000);

export async function checkRateLimit(
  limiter: InMemoryRatelimit,
  identifier: string
): Promise<RateLimitResult> {
  return limiter.limit(identifier);
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}

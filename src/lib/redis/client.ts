import { Redis } from '@upstash/redis';

/**
 * Upstash Redis Client for Distributed Caching
 *
 * Used for:
 * - Distributed rate limiting across serverless function instances
 * - reCAPTCHA result caching
 * - Session management (future)
 *
 * This replaces in-memory Map-based caching which doesn't work
 * across serverless function instances.
 *
 * @see https://upstash.com/docs/redis/overall/getstarted
 */

// Initialize Redis client
// Falls back to mock client in development if env vars not set
const isDevelopment = process.env.NODE_ENV === 'development' &&
                     (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN);

export const redis = isDevelopment
  ? createMockRedis()
  : new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

/**
 * Mock Redis for development when Upstash credentials not available
 * Uses in-memory Map for development only
 */
function createMockRedis() {
  const store = new Map<string, { value: any; expiry?: number }>();

  console.warn('⚠️  Using mock Redis (in-memory) - set UPSTASH_REDIS_REST_URL for production');

  return {
    get: async (key: string) => {
      const item = store.get(key);
      if (!item) return null;

      if (item.expiry && Date.now() > item.expiry) {
        store.delete(key);
        return null;
      }

      return item.value;
    },
    set: async (key: string, value: any, options?: { ex?: number; px?: number }) => {
      const expiry = options?.ex
        ? Date.now() + options.ex * 1000
        : options?.px
        ? Date.now() + options.px
        : undefined;

      store.set(key, { value, expiry });
      return 'OK';
    },
    del: async (...keys: string[]) => {
      let count = 0;
      keys.forEach(key => {
        if (store.delete(key)) count++;
      });
      return count;
    },
    incr: async (key: string) => {
      const item = store.get(key);
      const newValue = (item?.value || 0) + 1;
      store.set(key, { value: newValue, expiry: item?.expiry });
      return newValue;
    },
    expire: async (key: string, seconds: number) => {
      const item = store.get(key);
      if (!item) return 0;
      item.expiry = Date.now() + seconds * 1000;
      return 1;
    },
    ttl: async (key: string) => {
      const item = store.get(key);
      if (!item || !item.expiry) return -1;
      const remaining = Math.floor((item.expiry - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    }
  } as any;
}

/**
 * Get value from cache with type safety
 * @param key Cache key
 * @returns Cached value or null
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value as T | null;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
}

/**
 * Set value in cache with TTL
 * @param key Cache key
 * @param value Value to cache
 * @param ttlSeconds Time to live in seconds (default: 300 = 5 minutes)
 */
export async function cacheSet(
  key: string,
  value: any,
  ttlSeconds: number = 300
): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error('Redis SET error:', error);
    // Don't throw - cache failures shouldn't break the app
  }
}

/**
 * Delete value(s) from cache
 * @param keys Cache key(s) to delete
 * @returns Number of keys deleted
 */
export async function cacheDel(...keys: string[]): Promise<number> {
  try {
    return await redis.del(...keys);
  } catch (error) {
    console.error('Redis DEL error:', error);
    return 0;
  }
}

/**
 * Increment a counter in cache
 * @param key Cache key
 * @returns New value after increment
 */
export async function cacheIncrement(key: string): Promise<number> {
  try {
    return await redis.incr(key);
  } catch (error) {
    console.error('Redis INCR error:', error);
    return 0;
  }
}

/**
 * Check if Redis is properly configured
 */
export function isRedisConfigured(): boolean {
  return !isDevelopment &&
         !!process.env.UPSTASH_REDIS_REST_URL &&
         !!process.env.UPSTASH_REDIS_REST_TOKEN;
}

/**
 * Get Redis client status
 */
export function getRedisStatus() {
  return {
    configured: isRedisConfigured(),
    development: isDevelopment,
    usingMock: isDevelopment,
    url: process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'missing'
  };
}

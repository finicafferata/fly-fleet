/**
 * In-memory cache (replaces Upstash Redis)
 *
 * Used for:
 * - reCAPTCHA result caching
 *
 * Simple Map-based cache. Sufficient for serverless functions
 * where cross-instance sharing is not required.
 */

const store = new Map<string, { value: unknown; expiry?: number }>();

function isExpired(item: { value: unknown; expiry?: number }): boolean {
  return !!item.expiry && Date.now() > item.expiry;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const item = store.get(key);
  if (!item) return null;
  if (isExpired(item)) {
    store.delete(key);
    return null;
  }
  return item.value as T;
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number = 300
): Promise<void> {
  store.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 });
}

export async function cacheDel(...keys: string[]): Promise<number> {
  let count = 0;
  for (const key of keys) {
    if (store.delete(key)) count++;
  }
  return count;
}

export async function cacheIncrement(key: string): Promise<number> {
  const item = store.get(key);
  const newValue = ((item?.value as number) || 0) + 1;
  store.set(key, { value: newValue, expiry: item?.expiry });
  return newValue;
}

export function isRedisConfigured(): boolean {
  return true;
}

export function getRedisStatus() {
  return {
    configured: true,
    development: false,
    usingMock: false,
    url: 'in-memory'
  };
}

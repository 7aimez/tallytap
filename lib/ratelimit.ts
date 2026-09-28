import { LRUCache } from "lru-cache";

type Bucket = { count: number; resetAt: number };

const buckets = new LRUCache<string, Bucket>({
  max: 5000,
  ttl: 1000 * 60 * 5,
});

export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs }, { ttl: windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  buckets.set(key, { ...current, count: current.count + 1 }, { ttl: current.resetAt - now });
  return true;
}

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@/lib/env";

const inMemoryCounters = new Map<string, { count: number; expiresAt: number }>();

function fallbackLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const entry = inMemoryCounters.get(key);

  if (!entry || entry.expiresAt < now) {
    inMemoryCounters.set(key, { count: 1, expiresAt: now + windowMs });
    return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { success: false, limit: maxRequests, remaining: 0, reset: entry.expiresAt };
  }

  entry.count += 1;
  inMemoryCounters.set(key, entry);

  return {
    success: true,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    reset: entry.expiresAt,
  };
}

const redisLimiter =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: env.UPSTASH_REDIS_REST_URL,
          token: env.UPSTASH_REDIS_REST_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        analytics: true,
      })
    : null;

export async function enforceRateLimit(key: string, maxRequests = 10, windowMs = 60_000) {
  if (redisLimiter) {
    return redisLimiter.limit(key);
  }

  return fallbackLimit(key, maxRequests, windowMs);
}

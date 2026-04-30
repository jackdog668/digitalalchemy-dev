import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/env";

// Unified rate limiter for every public API route. Prefers Upstash (persistent
// across deploys + multi-region) and falls back to an in-process Map when
// Upstash isn't configured. The fallback exists so local dev keeps working
// without forcing every contributor to set up Upstash. In production both
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN MUST be set or rate
// limiting effectively resets on every Vercel cold start.

type Duration = `${number} ms` | `${number} s` | `${number} m` | `${number} h`;

const limiterCache = new Map<string, Ratelimit>();
let redisClient: Redis | null = null;
let redisProbed = false;

const memBucket = new Map<string, { count: number; resetAt: number }>();

function getRedis(): Redis | null {
  if (redisProbed) return redisClient;
  redisProbed = true;
  const env = serverEnv();
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;
  redisClient = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  return redisClient;
}

function getLimiter(key: string, max: number, windowMs: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  const cacheKey = `${key}:${max}:${windowMs}`;
  const cached = limiterCache.get(cacheKey);
  if (cached) return cached;
  const seconds = Math.max(1, Math.ceil(windowMs / 1000));
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, `${seconds} s` as Duration),
    analytics: false,
    prefix: `da-rl:${key}`,
  });
  limiterCache.set(cacheKey, limiter);
  return limiter;
}

function memoryLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memBucket.get(key);
  if (!entry || entry.resetAt < now) {
    memBucket.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  retryAfterSec: number;
};

/**
 * Check whether a request should be allowed. Pass a unique `key` per route
 * so unrelated endpoints don't share buckets, and an `identifier` per
 * requester (IP, email, user id). Returns success + how long to wait.
 */
export async function rateLimit(opts: {
  key: string;
  identifier: string;
  max: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  const limiter = getLimiter(opts.key, opts.max, opts.windowMs);
  if (limiter) {
    const result = await limiter.limit(opts.identifier);
    const retryAfterSec = result.success
      ? 0
      : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return {
      success: result.success,
      remaining: result.remaining,
      retryAfterSec,
    };
  }
  const ok = memoryLimit(`${opts.key}:${opts.identifier}`, opts.max, opts.windowMs);
  return {
    success: ok,
    remaining: ok ? opts.max - 1 : 0,
    retryAfterSec: ok ? 0 : Math.max(1, Math.ceil(opts.windowMs / 1000)),
  };
}

/** Pull a stable client IP from request headers. Vercel/most CDNs set x-forwarded-for. */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

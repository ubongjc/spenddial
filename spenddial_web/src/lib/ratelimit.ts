import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis client (fallback to in-memory for development)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// In-memory fallback for development
const cache = new Map();

// Different rate limits for different endpoints
export const ratelimit = {
  // Authentication endpoints: 5 requests per minute
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "@ratelimit/auth",
      })
    : createMemoryRatelimit(5, 60000),

  // API endpoints: 60 requests per minute
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        analytics: true,
        prefix: "@ratelimit/api",
      })
    : createMemoryRatelimit(60, 60000),

  // Webhook endpoints: 100 requests per minute
  webhook: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
        prefix: "@ratelimit/webhook",
      })
    : createMemoryRatelimit(100, 60000),

  // Transaction sync: 10 requests per hour
  sync: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        analytics: true,
        prefix: "@ratelimit/sync",
      })
    : createMemoryRatelimit(10, 3600000),
};

// In-memory rate limiter for development
function createMemoryRatelimit(limit: number, window: number) {
  return {
    limit: async (identifier: string) => {
      const key = identifier;
      const now = Date.now();
      const timestamps = cache.get(key) || [];

      // Remove old timestamps outside the window
      const validTimestamps = timestamps.filter(
        (ts: number) => now - ts < window
      );

      if (validTimestamps.length >= limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: validTimestamps[0] + window,
        };
      }

      validTimestamps.push(now);
      cache.set(key, validTimestamps);

      return {
        success: true,
        limit,
        remaining: limit - validTimestamps.length,
        reset: now + window,
      };
    },
  };
}

// Helper to get IP address from request
export function getIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "anonymous";
}

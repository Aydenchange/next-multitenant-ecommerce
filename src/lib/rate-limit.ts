import { TRPCError } from "@trpc/server";

import { logEvent } from "@/lib/observability";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
};

type EnforceRateLimitOptions = RateLimitOptions & {
  requestId?: string;
  userId?: string;
  tenantId?: string | null;
};

const buckets = new Map<string, RateLimitBucket>();
const MAX_BUCKETS = 10_000;

const pruneExpiredBuckets = (now: number) => {
  if (buckets.size <= MAX_BUCKETS) return;

  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  });
};

export function getClientIpFromHeaders(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-vercel-forwarded-for") ??
    "unknown"
  );
}

export function checkRateLimit({
  key,
  limit,
  windowMs,
  now = Date.now(),
}: RateLimitOptions) {
  pruneExpiredBuckets(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt,
      retryAfterMs: 0,
    };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterMs: bucket.resetAt - now,
    };
  }

  bucket.count += 1;

  return {
    allowed: true,
    limit,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
    retryAfterMs: 0,
  };
}

export function resetRateLimitBuckets() {
  buckets.clear();
}

export function enforceRateLimit(options: EnforceRateLimitOptions) {
  const result = checkRateLimit(options);

  if (result.allowed) {
    return result;
  }

  logEvent("warn", "Rate limit exceeded", {
    requestId: options.requestId,
    key: options.key,
    limit: options.limit,
    windowMs: options.windowMs,
    retryAfterMs: result.retryAfterMs,
    tenantId: options.tenantId,
    userId: options.userId,
  });

  throw new TRPCError({
    code: "TOO_MANY_REQUESTS",
    message: `Too many requests. Try again in ${Math.ceil(
      result.retryAfterMs / 1000,
    )} seconds.`,
  });
}

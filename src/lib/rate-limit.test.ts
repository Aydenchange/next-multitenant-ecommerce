import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it } from "vitest";

import {
  checkRateLimit,
  enforceRateLimit,
  getClientIpFromHeaders,
  resetRateLimitBuckets,
} from "@/lib/rate-limit";

describe("rate limiting", () => {
  beforeEach(() => {
    resetRateLimitBuckets();
  });

  it("extracts the first forwarded client ip", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    });

    expect(getClientIpFromHeaders(headers)).toBe("203.0.113.10");
  });

  it("falls back to platform ip headers", () => {
    expect(
      getClientIpFromHeaders(
        new Headers({
          "cf-connecting-ip": "203.0.113.11",
        }),
      ),
    ).toBe("203.0.113.11");

    expect(getClientIpFromHeaders(new Headers())).toBe("unknown");
  });

  it("allows requests within the configured window", () => {
    expect(
      checkRateLimit({
        key: "login:ip:1",
        limit: 2,
        windowMs: 1000,
        now: 100,
      }),
    ).toMatchObject({
      allowed: true,
      remaining: 1,
    });

    expect(
      checkRateLimit({
        key: "login:ip:1",
        limit: 2,
        windowMs: 1000,
        now: 200,
      }),
    ).toMatchObject({
      allowed: true,
      remaining: 0,
    });
  });

  it("blocks requests after the limit is exceeded", () => {
    checkRateLimit({
      key: "checkout:user:1",
      limit: 1,
      windowMs: 1000,
      now: 100,
    });

    expect(
      checkRateLimit({
        key: "checkout:user:1",
        limit: 1,
        windowMs: 1000,
        now: 200,
      }),
    ).toMatchObject({
      allowed: false,
      remaining: 0,
      retryAfterMs: 900,
    });
  });

  it("resets after the window expires", () => {
    checkRateLimit({
      key: "review:user:1",
      limit: 1,
      windowMs: 1000,
      now: 100,
    });

    expect(
      checkRateLimit({
        key: "review:user:1",
        limit: 1,
        windowMs: 1000,
        now: 1101,
      }),
    ).toMatchObject({
      allowed: true,
      remaining: 0,
    });
  });

  it("throws a tRPC error when enforced limits are exceeded", () => {
    enforceRateLimit({
      key: "auth:ip:1",
      limit: 1,
      windowMs: 1000,
      now: 100,
    });

    expect(() =>
      enforceRateLimit({
        key: "auth:ip:1",
        limit: 1,
        windowMs: 1000,
        now: 200,
      }),
    ).toThrow(TRPCError);
  });
});

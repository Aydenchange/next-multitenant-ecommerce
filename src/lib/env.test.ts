import { describe, expect, it } from "vitest";

import { getServerEnvStatus, validateServerEnv } from "@/lib/env";

const validEnv = {
  DATABASE_URL: "mongodb://127.0.0.1:27017/test",
  PAYLOAD_SECRET: "payload-secret",
  STRIPE_SECRET_KEY: "sk_test_123",
  STRIPE_WEBHOOK_SECRET: "whsec_123",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

describe("server env validation", () => {
  it("accepts the required server environment", () => {
    expect(validateServerEnv(validEnv)).toEqual(
      expect.objectContaining(validEnv),
    );
  });

  it("reports missing required server environment variables", () => {
    expect(() => validateServerEnv({})).toThrow(
      /Invalid server environment/,
    );

    expect(getServerEnvStatus({}).ok).toBe(false);
  });

  it("rejects invalid public URLs", () => {
    expect(() =>
      validateServerEnv({
        ...validEnv,
        NEXT_PUBLIC_APP_URL: "not-a-url",
      }),
    ).toThrow(/NEXT_PUBLIC_APP_URL/);
  });
});

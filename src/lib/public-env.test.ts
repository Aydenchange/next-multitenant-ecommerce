import { describe, expect, it } from "vitest";

import { getPublicEnvStatus, validatePublicEnv } from "@/lib/public-env";

const validPublicEnv = {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_ROOT_DOMAIN: "localhost",
};

describe("public env validation", () => {
  it("accepts the required public environment", () => {
    expect(validatePublicEnv(validPublicEnv)).toEqual(validPublicEnv);
  });

  it("reports missing public environment variables", () => {
    expect(() => validatePublicEnv({})).toThrow(
      /Invalid public environment/,
    );

    expect(getPublicEnvStatus({}).ok).toBe(false);
  });

  it("rejects invalid public app URLs", () => {
    expect(() =>
      validatePublicEnv({
        ...validPublicEnv,
        NEXT_PUBLIC_APP_URL: "not-a-url",
      }),
    ).toThrow(/NEXT_PUBLIC_APP_URL/);
  });
});

import { describe, expect, it } from "vitest";

import {
  getUserTenantIds,
  resolveTenantSlugFromHeaders,
  tenantWhere,
  toTenantId,
} from "@/lib/tenant";
import type { Tenant, User } from "@/payload-types";

const makeTenant = (id: string): Tenant => ({
  id,
  name: `${id} store`,
  slug: id,
  stripeAccountId: `acct_${id}`,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("tenant helpers", () => {
  it("resolves tenant slug from a subdomain host", () => {
    const previousRootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "example.com";
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";

    const headers = new Headers({ host: "acme.example.com" });

    expect(resolveTenantSlugFromHeaders(headers)).toBe("acme");

    process.env.NEXT_PUBLIC_ROOT_DOMAIN = previousRootDomain;
    process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
  });

  it("does not trust caller-provided x-tenant-slug headers", () => {
    const previousRootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
    const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "example.com";
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";

    const headers = new Headers({
      host: "app.example.com",
      "x-tenant-slug": "evil-tenant",
    });

    expect(resolveTenantSlugFromHeaders(headers)).toBe("app");

    process.env.NEXT_PUBLIC_ROOT_DOMAIN = previousRootDomain;
    process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
  });

  it("normalizes tenant ids from string or populated tenant relationships", () => {
    expect(toTenantId("tenant_1")).toBe("tenant_1");
    expect(toTenantId(makeTenant("tenant_2"))).toBe("tenant_2");
    expect(toTenantId(null)).toBeNull();
  });

  it("extracts user tenant memberships", () => {
    const user = {
      id: "user_1",
      email: "seller@example.com",
      username: "seller",
      collection: "users",
      tenants: [{ tenant: "tenant_1" }, { tenant: makeTenant("tenant_2") }],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    } satisfies User;

    expect(getUserTenantIds(user)).toEqual(["tenant_1", "tenant_2"]);
  });

  it("wraps arbitrary where clauses in a tenant guard", () => {
    expect(
      tenantWhere("tenant_1", {
        isArchived: {
          not_equals: true,
        },
      }),
    ).toEqual({
      and: [
        {
          tenant: {
            equals: "tenant_1",
          },
        },
        {
          isArchived: {
            not_equals: true,
          },
        },
      ],
    });
  });
});

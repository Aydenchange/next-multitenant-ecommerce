import type { Payload, Where } from "payload";

import type { Tenant, User } from "@/payload-types";
import { getPublicEnv } from "@/lib/public-env";

export function resolveTenantSlugFromHeaders(headers: Headers) {
  const host = headers.get("host") ?? "";
  const rootDomain = getPublicEnv().NEXT_PUBLIC_ROOT_DOMAIN;

  if (rootDomain && host.endsWith(`.${rootDomain}`)) {
    return host.replace(`.${rootDomain}`, "").split(":")[0];
  }

  return null;
}

export function toTenantId(value: string | Tenant | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export function getUserTenantIds(user: User | null | undefined) {
  return (
    user?.tenants
      ?.map(({ tenant }) => toTenantId(tenant))
      .filter((tenantId): tenantId is string => Boolean(tenantId)) ?? []
  );
}

export function tenantWhere(tenantId: string, where: Where = {}): Where {
  return {
    and: [
      {
        tenant: {
          equals: tenantId,
        },
      },
      where,
    ],
  };
}

export async function findTenantBySlug(payload: Payload, slug: string) {
  const tenantsData = await payload.find({
    collection: "tenants",
    limit: 1,
    pagination: false,
    where: {
      slug: {
        equals: slug.trim().toLowerCase(),
      },
    },
  });

  return tenantsData.docs[0] ?? null;
}

import { initTRPC, TRPCError } from "@trpc/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { cache } from "react";
import {
  getUserTenantIds,
  resolveTenantSlugFromHeaders,
} from "@/lib/tenant";
import {
  getOrCreateRequestId,
  getSlowProcedureThresholdMs,
  logEvent,
  serializeError,
} from "@/lib/observability";
/**
 * This context creator accepts `headers` so it can be reused in both
 * the RSC server caller (where you pass `next/headers`) and the
 * API route handler (where you pass the request headers).
 */
export const createTRPCContext = cache(async (opts: { headers: Headers }) => {
  const db = await getPayload({ config });
  const session = await db.auth({ headers: opts.headers });
  const tenantSlug = resolveTenantSlugFromHeaders(opts.headers);
  const requestId = getOrCreateRequestId(opts.headers);

  const tenant = tenantSlug
    ? ((
        await db.find({
          collection: "tenants",
          limit: 1,
          pagination: false,
          where: { slug: { equals: tenantSlug } },
        })
      ).docs[0] ?? null)
    : null;

  return {
    db,
    session,
    user: session.user ?? null,
    tenant,
    tenantId: tenant?.id ?? null,
    tenantSlug,
    userTenantIds: getUserTenantIds(session.user),
    requestId,
  };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    // transformer: superjson,
  });
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(
  async ({ ctx, next, path, type }) => {
    const startedAt = performance.now();
    const result = await next();
    const durationMs = Math.round(performance.now() - startedAt);
    const shouldLog =
      !result.ok || durationMs >= getSlowProcedureThresholdMs();

    if (shouldLog) {
      logEvent(result.ok ? "warn" : "error", "tRPC procedure completed", {
        requestId: ctx.requestId,
        path,
        type,
        durationMs,
        status: result.ok ? "slow" : "error",
        tenantId: ctx.tenantId,
        userId: ctx.user?.id,
        error: result.ok ? undefined : serializeError(result.error),
      });
    }

    return result;
  },
);

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const tenantProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.tenantId || !ctx.tenant) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant required" });
  }

  return next({
    ctx: {
      ...ctx,
      tenant: ctx.tenant,
      tenantId: ctx.tenantId,
    },
  });
});

export const tenantMemberProcedure = tenantProcedure.use(({ ctx, next }) => {
  if (!ctx.userTenantIds.includes(ctx.tenantId)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Tenant access denied" });
  }

  return next({ ctx });
});

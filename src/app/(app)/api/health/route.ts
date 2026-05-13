import config from "@payload-config";
import { getPayload } from "payload";
import { NextResponse } from "next/server";

import { logEvent, serializeError } from "@/lib/observability";
import { getServerEnvStatus } from "@/lib/env";
import { getPublicEnvStatus } from "@/lib/public-env";

export const dynamic = "force-dynamic";

type HealthCheck = {
  ok: boolean;
  latencyMs?: number;
  error?: string;
};

const checkDatabase = async (): Promise<HealthCheck> => {
  const startedAt = performance.now();

  try {
    const payload = await getPayload({ config });

    await payload.find({
      collection: "tenants",
      depth: 0,
      limit: 1,
      pagination: false,
    });

    return {
      ok: true,
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const checkEnv = (): HealthCheck => {
  const statuses = [getServerEnvStatus(), getPublicEnvStatus()];
  const issues = statuses.flatMap((status) => status.issues);

  if (issues.length > 0) {
    return {
      ok: false,
      error: issues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join("; "),
    };
  }

  return { ok: true };
};

export async function GET() {
  const [database, env] = await Promise.all([checkDatabase(), checkEnv()]);
  const ok = database.ok && env.ok;
  const status = ok ? 200 : 503;
  const body = {
    ok,
    status: ok ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    checks: {
      database,
      env,
    },
  };

  if (!ok) {
    logEvent("error", "Health check failed", {
      error: serializeError(body),
      checks: body.checks,
    });
  }

  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

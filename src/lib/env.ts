import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PAYLOAD_SECRET: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.url().optional(),
  NEXT_PUBLIC_ROOT_DOMAIN: z.string().min(1).optional(),
  TRPC_SLOW_PROCEDURE_MS: z.coerce.number().positive().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
type EnvInput = Record<string, string | undefined>;

let cachedServerEnv: ServerEnv | null = null;

const formatEnvIssues = (error: z.ZodError) =>
  error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

export function validateServerEnv(input: EnvInput = process.env) {
  const parsed = serverEnvSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `Invalid server environment: ${formatEnvIssues(parsed.error)}`,
    );
  }

  return parsed.data;
}

export function getServerEnv() {
  cachedServerEnv ??= validateServerEnv();
  return cachedServerEnv;
}

export function getServerEnvStatus(input: EnvInput = process.env) {
  const parsed = serverEnvSchema.safeParse(input);

  if (parsed.success) {
    return {
      ok: true,
      issues: [],
    };
  }

  return {
    ok: false,
    issues: parsed.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
}

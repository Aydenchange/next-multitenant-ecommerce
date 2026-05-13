import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_ROOT_DOMAIN: z.string().min(1),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
type EnvInput = Record<string, string | undefined>;

const formatEnvIssues = (error: z.ZodError) =>
  error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

export function validatePublicEnv(input: EnvInput = process.env) {
  const parsed = publicEnvSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `Invalid public environment: ${formatEnvIssues(parsed.error)}`,
    );
  }

  return parsed.data;
}

export function getPublicEnv() {
  return validatePublicEnv();
}

export function getPublicEnvStatus(input: EnvInput = process.env) {
  const parsed = publicEnvSchema.safeParse(input);

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

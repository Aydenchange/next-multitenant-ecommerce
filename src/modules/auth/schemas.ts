import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
      message:
        "Use lowercase letters, numbers, or hyphens. Start and end with a letter or number.",
    }),
  email: z.email().transform((email) => email.toLowerCase()),
  password: z.string().min(3),
});

export const loginSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  password: z.string().min(3),
});

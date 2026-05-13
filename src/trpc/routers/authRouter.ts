import { TRPCError } from "@trpc/server";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { loginSchema, registerSchema } from "@/modules/auth/schemas";
import { generateAuthCookie } from "@/modules/auth/utils";
import { stripe } from "@/lib/stripe";
import { enforceRateLimit } from "@/lib/rate-limit";

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),
  register: baseProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      enforceRateLimit({
        key: `auth:register:ip:${ctx.clientIp}`,
        limit: 5,
        windowMs: 60 * 60 * 1000,
        requestId: ctx.requestId,
      });

      const existingData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          email: {
            equals: input.email,
          },
        },
      });

      const existingUser = existingData.docs[0];
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already exists",
        });
      }

      const account = await stripe.accounts.create({});

      if (!account) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create Stripe account",
        });
      }

      const tenant = await ctx.db.create({
        collection: "tenants",
        data: {
          name: input.username,
          slug: input.username,
          stripeAccountId: account.id,
        },
      });
      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
          username: input.username,
          tenants: [
            {
              tenant: tenant.id,
            },
          ],
        },
      });

      const data = await ctx.db.login({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
        },
      });

      if (!data.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Failed to login",
        });
      }
      await generateAuthCookie({
        prefix: ctx.db.config.cookiePrefix,
        value: data.token,
      });
    }),
  login: baseProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    enforceRateLimit({
      key: `auth:login:ip:${ctx.clientIp}`,
      limit: 30,
      windowMs: 15 * 60 * 1000,
      requestId: ctx.requestId,
    });
    enforceRateLimit({
      key: `auth:login:email:${input.email}:ip:${ctx.clientIp}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
      requestId: ctx.requestId,
    });

    const data = await ctx.db.login({
      collection: "users",
      data: {
        email: input.email,
        password: input.password,
      },
    });

    if (!data.token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Failed to login",
      });
    }
    await generateAuthCookie({
      prefix: ctx.db.config.cookiePrefix,
      value: data.token,
    });
  }),
  // logout: baseProcedure.mutation(async () => {
  //   const cookies = await getCookies();
  //   cookies.delete(AUTH_COOKIE);
  // }),
});

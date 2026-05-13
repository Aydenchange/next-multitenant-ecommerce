import z from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { enforceRateLimit } from "@/lib/rate-limit";
import { tenantWhere, toTenantId } from "@/lib/tenant";

export const reviewsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const productTenantId = toTenantId(product.tenant);

      if (!productTenantId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product tenant not found",
        });
      }

      const ordersData = await ctx.db.find({
        collection: "orders",
        limit: 1,
        pagination: false,
        where: tenantWhere(productTenantId, {
          and: [
            { product: { equals: product.id } },
            { user: { equals: ctx.user.id } },
          ],
        }),
      });

      if (!ordersData.docs[0]) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only customers can review this product",
        });
      }

      const reviewsData = await ctx.db.find({
        collection: "reviews",
        limit: 1,
        where: tenantWhere(productTenantId, {
          and: [
            { product: { equals: product.id } },
            { user: { equals: ctx.user.id } },
          ],
        }),
      });

      return reviewsData.docs[0] ?? null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        rating: z.number().min(1).max(5),
        description: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      enforceRateLimit({
        key: `reviews:create:user:${ctx.user.id}`,
        limit: 20,
        windowMs: 60 * 60 * 1000,
        requestId: ctx.requestId,
        userId: ctx.user.id,
        tenantId: ctx.tenantId,
      });

      const product = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
        depth: 0,
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const productTenantId = toTenantId(product.tenant);

      if (!productTenantId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product tenant not found",
        });
      }

      const ordersData = await ctx.db.find({
        collection: "orders",
        limit: 1,
        pagination: false,
        where: tenantWhere(productTenantId, {
          and: [
            { product: { equals: input.productId } },
            { user: { equals: ctx.user.id } },
          ],
        }),
      });

      if (!ordersData.docs[0]) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only customers can review this product",
        });
      }

      const existingReviewsData = await ctx.db.find({
        collection: "reviews",
        where: tenantWhere(productTenantId, {
          and: [
            { product: { equals: input.productId } },
            { user: { equals: ctx.user.id } },
          ],
        }),
      });

      if (existingReviewsData.totalDocs > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already reviewed this product",
        });
      }

      return ctx.db.create({
        collection: "reviews",
        data: {
          tenant: productTenantId,
          user: ctx.user.id,
          product: input.productId,
          rating: input.rating,
          description: input.description,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        rating: z.number().min(1).max(5),
        description: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      enforceRateLimit({
        key: `reviews:update:user:${ctx.user.id}`,
        limit: 60,
        windowMs: 60 * 60 * 1000,
        requestId: ctx.requestId,
        userId: ctx.user.id,
        tenantId: ctx.tenantId,
      });

      const existingReview = await ctx.db.findByID({
        depth: 0,
        collection: "reviews",
        id: input.reviewId,
      });

      if (!existingReview) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
      }

      if (existingReview.user !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
      }

      return ctx.db.update({
        collection: "reviews",
        id: input.reviewId,
        data: {
          rating: input.rating,
          description: input.description,
        },
      });
    }),
});

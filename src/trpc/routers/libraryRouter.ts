import z from "zod";

import { PRODUCTS_LIMIT } from "@/constants";
import { Media, Product, Tenant } from "@/payload-types";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

const isPopulatedTenant = (value: Product["tenant"]): value is Tenant =>
  typeof value === "object" && value !== null;

const isPopulatedMedia = (
  value: Product["image"] | Tenant["image"],
): value is Media => typeof value === "object" && value !== null;

export const libraryRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ordersData = await ctx.db.find({
        collection: "orders",
        limit: 1,
        pagination: false,
        where: {
          and: [
            {
              product: {
                equals: input.productId,
              },
            },
            {
              user: {
                equals: ctx.session.user.id,
              },
            },
          ],
        },
      });

      const order = ordersData.docs[0];

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

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

      return product;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(PRODUCTS_LIMIT),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ordersData = await ctx.db.find({
        collection: "orders",
        depth: 0, // We want to just get ids, without populating
        page: input.cursor,
        limit: input.limit,
        where: {
          user: {
            equals: ctx.session.user.id,
          },
        },
      });

      const productIds = ordersData.docs
        .map((order) =>
          typeof order.product === "string" ? order.product : order.product?.id,
        )
        .filter((id): id is string => !!id);

      if (productIds.length === 0) {
        return {
          docs: [],
          nextCursor: ordersData.hasNextPage
            ? (ordersData.nextPage ?? undefined)
            : undefined,
        };
      }

      const productsData = await ctx.db.find({
        collection: "products",
        depth: 2, // We want to populate tenant、image and tenant.image
        pagination: false,
        where: {
          id: {
            in: productIds,
          },
        },
      });

      const productsById = new Map(
        productsData.docs.map((doc) => {
          const product = doc as Product;
          const tenant = isPopulatedTenant(product.tenant)
            ? product.tenant
            : undefined;

          return [
            product.id,
            {
              ...product,
              image: isPopulatedMedia(product.image) ? product.image : null,
              tenant: tenant
                ? {
                    ...tenant,
                    image: isPopulatedMedia(tenant.image) ? tenant.image : null,
                  }
                : product.tenant,
            },
          ];
        }),
      );

      const docs = productIds
        .map((id) => productsById.get(id))
        .filter((doc): doc is NonNullable<typeof doc> => !!doc);

      return {
        docs,
        nextCursor: ordersData.hasNextPage
          ? (ordersData.nextPage ?? undefined)
          : undefined,
      };
    }),
});

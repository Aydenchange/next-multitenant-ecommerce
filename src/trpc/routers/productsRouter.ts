import z from "zod";
import { TRPCError } from "@trpc/server";
import { Sort, Where } from "payload";

import { baseProcedure, createTRPCRouter } from "../init";
import { Category, Media, Product, Tenant } from "@/payload-types";
import { ProductSort, productSortValues } from "@/constants";
import { findTenantBySlug, tenantWhere, toTenantId } from "@/lib/tenant";
import {
  getReviewSummariesByProductIds,
  getReviewSummaryForProduct,
} from "@/lib/review-summary";

const normalizeSlug = (value?: string | null) => value?.trim().toLowerCase();

const isPopulatedTenant = (value: Product["tenant"]): value is Tenant =>
  typeof value === "object" && value !== null;

const isPopulatedMedia = (
  value: Product["image"] | Tenant["image"],
): value is Media => typeof value === "object" && value !== null;

const formatCategory = (doc: Category) => ({
  ...doc,
  slug: normalizeSlug(doc.slug) ?? doc.slug,
  subcategories: (doc.subcategories?.docs ?? []).map((item) => ({
    ...(item as Category),
    slug: normalizeSlug((item as Category).slug) ?? (item as Category).slug,
    subcategories: undefined,
  })),
});

export const productsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string(),
        tenantSlug: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenant = input.tenantSlug
        ? await findTenantBySlug(ctx.db, input.tenantSlug)
        : null;

      if (input.tenantSlug && !tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }

      const product = input.tenantSlug
        ? (
            await ctx.db.find({
              collection: "products",
              depth: 2,
              limit: 1,
              pagination: false,
              where: tenantWhere(tenant!.id, {
                id: {
                  equals: input.id,
                },
              }),
              select: {
                content: false,
              },
            })
          ).docs[0]
        : await ctx.db.findByID({
            collection: "products",
            id: input.id,
            depth: 2,
            select: {
              content: false,
            },
          });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      if (product.isArchived) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      let isPurchased = false;
      const productTenantId = toTenantId(product.tenant);

      if (ctx.user) {
        const purchasedWhere: Where = {
          and: [
            {
              product: {
                equals: input.id,
              },
            },
            {
              user: {
                equals: ctx.user.id,
              },
            },
          ],
        };

        const ordersData = await ctx.db.find({
          collection: "orders",
          limit: 1,
          where: productTenantId
            ? tenantWhere(productTenantId, purchasedWhere)
            : purchasedWhere,
        });

        isPurchased = !!ordersData.docs[0];
      }

      const reviewSummary = await getReviewSummaryForProduct(ctx.db, product);

      return {
        ...product,
        isPurchased,
        image: isPopulatedMedia(product.image) ? product.image : null,
        tenant: isPopulatedTenant(product.tenant)
          ? {
              ...product.tenant,
              image: isPopulatedMedia(product.tenant.image)
                ? product.tenant.image
                : null,
            }
          : null,
        reviewRating: reviewSummary.reviewRating,
        reviewCount: reviewSummary.reviewCount,
        ratingDistribution: reviewSummary.ratingDistribution,
      };
    }),
  getMany: baseProcedure
    .input(
      z.object({
        categorySlug: z.string().nullable().optional(),
        subCategorySlug: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        sort: z.enum(productSortValues).nullable().optional(),
        tags: z.array(z.string()).optional(),
        cursor: z.number().int().positive().nullish(),
        limit: z.number().int().positive().max(50).default(10),
        tenantSlug: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const categorySlug = normalizeSlug(input.categorySlug);
      const subCategorySlug = normalizeSlug(input.subCategorySlug);
      const tagIds = [
        ...new Set((input.tags ?? []).map((tag) => tag.trim()).filter(Boolean)),
      ];
      let where: Where = {
        isArchived: {
          not_equals: true,
        },
      };

      let sort: Sort = "-createdAt";

      if (
        input.sort === ProductSort.CURATED ||
        input.sort === ProductSort.TRENDING
      ) {
        sort = "-createdAt";
      }

      if (input.sort === ProductSort.HOT_AND_NEW) {
        sort = "createdAt";
      }

      if (subCategorySlug && !categorySlug) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Subcategory slug requires a category slug",
        });
      }
      const minPriceNum = input.minPrice ? parseFloat(input.minPrice) : NaN;
      const maxPriceNum = input.maxPrice ? parseFloat(input.maxPrice) : NaN;

      if (!Number.isNaN(minPriceNum)) {
        where.price = { greater_than_equal: minPriceNum };
      }
      if (!Number.isNaN(maxPriceNum)) {
        where.price = {
          ...where.price,
          less_than_equal: maxPriceNum,
        };
      }

      if (tagIds.length > 0) {
        where.tags = {
          in: tagIds,
        };
      }

      if (input.tenantSlug) {
        const tenant = await findTenantBySlug(ctx.db, input.tenantSlug);

        if (!tenant) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tenant not found",
          });
        }

        where = tenantWhere(tenant.id, where);
      } else {
        where.isPrivate = {
          not_equals: true,
        };
      }

      if (categorySlug === "all") {
        if (subCategorySlug) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              'Subcategory slug cannot be used when category slug is "all"',
          });
        }
      } else if (categorySlug) {
        const categoriesData = await ctx.db.find({
          collection: "categories",
          limit: 1,
          depth: 1,
          pagination: false,
          where: {
            slug: {
              equals: categorySlug,
            },
          },
        });
        const parentCategoryDoc = categoriesData.docs[0];
        if (!parentCategoryDoc) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category does not exist",
          });
        }
        const parentCategory = formatCategory(parentCategoryDoc as Category);
        if (subCategorySlug) {
          const subCategoryData = await ctx.db.find({
            collection: "categories",
            limit: 1,
            depth: 0,
            pagination: false,
            where: {
              slug: {
                equals: subCategorySlug,
              },
            },
          });
          const existingSubCategory = subCategoryData.docs[0];
          if (!existingSubCategory) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Subcategory does not exist",
            });
          }
          const belongsToCategory = parentCategory.subcategories.some(
            (subcategory) => subcategory.slug === subCategorySlug,
          );

          if (!belongsToCategory) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Subcategory does not belong to category",
            });
          }

          where["category.slug"] = {
            equals: subCategorySlug,
          };
        } else {
          const subcategoriesSlugs = parentCategory.subcategories.map(
            (subcategory) => subcategory.slug,
          );

          where["category.slug"] = {
            in: [parentCategory.slug, ...subcategoriesSlugs],
          };
        }
      }

      const page = input.cursor ?? 1;

      const data = await ctx.db.find({
        collection: "products",
        depth: 2, // Populate "category" & "image",
        where,
        sort,
        page,
        limit: input.limit,
        select: {
          content: false,
        },
        // overrideAccess: false,
        // user,
      });

      const docs = data.docs.map((doc) => {
        const product = doc as Product;
        const tenant = isPopulatedTenant(product.tenant)
          ? product.tenant
          : undefined;

        return {
          ...product,
          image: isPopulatedMedia(product.image) ? product.image : undefined,
          tenant: tenant
            ? {
                ...tenant,
                image: isPopulatedMedia(tenant.image)
                  ? tenant.image
                  : undefined,
              }
            : undefined,
        };
      });

      const reviewSummaries = await getReviewSummariesByProductIds(
        ctx.db,
        docs.map((doc) => doc.id),
      );

      return {
        ...data,
        docs: docs.map((doc) => ({
          ...doc,
          ...(reviewSummaries.get(doc.id) ?? {
            reviewCount: 0,
            reviewRating: 0,
          }),
        })),
        nextCursor: data.hasNextPage ? (data.nextPage ?? undefined) : undefined,
      };
    }),
});

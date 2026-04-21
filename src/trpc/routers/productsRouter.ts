import z from "zod";
import { headers as getHeaders } from "next/headers";
import { TRPCError } from "@trpc/server";
import { Sort, Where } from "payload";

import { baseProcedure, createTRPCRouter } from "../init";
import { Category, Media, Product, Tenant } from "@/payload-types";
import { ProductSort, productSortValues } from "@/constants";

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
      }),
    )
    .query(async ({ ctx, input }) => {
      const headers = await getHeaders();
      const session = await ctx.db.auth({ headers });
      const product = await ctx.db.findByID({
        collection: "products",
        id: input.id,
        depth: 2, // Load the "product.image", "product.tenant", and "product.tenant.image"
      });

      let isPurchased = false;

      if (session.user) {
        const ordersData = await ctx.db.find({
          collection: "orders",
          limit: 1,
          where: {
            and: [
              {
                product: {
                  equals: input.id,
                },
              },
              {
                user: {
                  equals: session.user.id,
                },
              },
            ],
          },
        });

        isPurchased = !!ordersData.docs[0];
      }

      const reviews = await ctx.db.find({
        collection: "reviews",
        pagination: false,
        where: {
          product: {
            equals: input.id,
          },
        },
      });

      const reviewRating =
        reviews.docs.length > 0
          ? reviews.docs.reduce((acc, review) => acc + review.rating, 0) /
            reviews.totalDocs
          : 0;

      const ratingDistribution: Record<number, number> = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      if (reviews.totalDocs > 0) {
        reviews.docs.forEach((review) => {
          const rating = review.rating;

          if (rating >= 1 && rating <= 5) {
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
          }
        });

        Object.keys(ratingDistribution).forEach((key) => {
          const rating = Number(key);
          const count = ratingDistribution[rating] || 0;
          ratingDistribution[rating] = Math.round(
            (count / reviews.totalDocs) * 100,
          );
        });
      }

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
          : product.tenant,
        reviewRating,
        reviewCount: reviews.totalDocs,
        ratingDistribution,
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
      // const headers = await getHeader();
      // const { user } = await ctx.db.auth({ headers });

      // if (!user) {
      //   throw new TRPCError({
      //     code: "UNAUTHORIZED",
      //     message: "Please sign in to view products",
      //   });
      // }

      const categorySlug = normalizeSlug(input.categorySlug);
      const subCategorySlug = normalizeSlug(input.subCategorySlug);
      const tagIds = [
        ...new Set((input.tags ?? []).map((tag) => tag.trim()).filter(Boolean)),
      ];
      const where: Where = {};

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
        where["tenant.slug"] = {
          equals: input.tenantSlug,
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

      const dataWithSummarizedReviews = await Promise.all(
        data.docs.map(async (doc) => {
          const reviewsData = await ctx.db.find({
            collection: "reviews",
            pagination: false,
            where: {
              product: {
                equals: doc.id,
              },
            },
          });

          return {
            ...doc,
            reviewCount: reviewsData.totalDocs,
            reviewRating:
              reviewsData.docs.length === 0
                ? 0
                : reviewsData.docs.reduce(
                    (acc, review) => acc + review.rating,
                    0,
                  ) / reviewsData.totalDocs,
          };
        }),
      );

      return {
        ...data,
        docs: dataWithSummarizedReviews,
        nextCursor: data.hasNextPage ? (data.nextPage ?? undefined) : undefined,
      };
    }),
});

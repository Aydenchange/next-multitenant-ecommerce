import z from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure, createTRPCRouter } from "../init";
import { Where } from "payload";
import { Category } from "@/payload-types";

const normalizeSlug = (value?: string | null) => value?.trim().toLowerCase();

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
  getMany: baseProcedure
    .input(
      z.object({
        categorySlug: z.string().nullable().optional(),
        subCategorySlug: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const categorySlug = normalizeSlug(input.categorySlug);
      const subCategorySlug = normalizeSlug(input.subCategorySlug);
      const where: Where = {};

      if (subCategorySlug && !categorySlug) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Subcategory slug requires a category slug",
        });
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

      const data = await ctx.db.find({
        collection: "products",
        depth: 1, // Populate "category" & "image",
        pagination: false,
        where,
      });

      return data;
    }),
});

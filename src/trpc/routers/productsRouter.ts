import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { Where } from "payload";
import { Category } from "@/payload-types";

export const productsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        categorySlug: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};
      //TODO：subCategorySlug should validate if it belongs to categorySlug, and if it doesn't exist, return an error
      //TODO: if categorySlug is not exist, return an error
      if (input.categorySlug) {
        if (input.categorySlug !== "all") {
          const categoriesData = await ctx.db.find({
            collection: "categories",
            limit: 1,
            depth: 1, // Populate subcategories, subcategores.[0] will be a type of "Category"
            pagination: false,
            where: {
              slug: {
                equals: input.categorySlug,
              },
            },
          });

          const formattedData = categoriesData.docs.map((doc) => ({
            ...doc,
            subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
              // Because of "depth: 1" we are confident "doc" will be a type of "Category"
              ...(doc as Category),
              subcategories: undefined,
            })),
          }));

          const subcategoriesSlugs = [];
          const parentCategory = formattedData[0];

          if (parentCategory) {
            subcategoriesSlugs.push(
              ...parentCategory.subcategories.map(
                (subcategory) => subcategory.slug,
              ),
            );
            where["category.slug"] = {
              in: [parentCategory.slug, ...subcategoriesSlugs],
            };
          }
        }
      }

      const data = await ctx.db.find({
        collection: "products",
        depth: 1, // Populate "category" & "image",
        where,
      });

      return data;
    }),
});

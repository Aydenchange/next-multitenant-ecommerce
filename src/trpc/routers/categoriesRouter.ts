import { baseProcedure, createTRPCRouter } from "../init";
import { CategoryNavItem } from "@/app/(app)/(home)/search-filters/types";
import { Category } from "@/payload-types";

export const categoriesRouter = createTRPCRouter({
  getAll: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.find({
      collection: "categories",
      depth: 1, // Populate subcategories, subcategores.[0] will be a type of "Category"
      pagination: false,
      where: {
        parent: {
          exists: false,
        },
      },
    });

    const formattedData = data.docs.map((doc) => ({
      id: doc.id,
      name: doc.name,
      slug: doc.slug,
      color: doc.color ?? null,
      subcategories: (doc.subcategories?.docs ?? [])
        .filter((item): item is Category => typeof item !== "string")
        .map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
        })),
    })) satisfies CategoryNavItem[];
    return formattedData;
  }),
});

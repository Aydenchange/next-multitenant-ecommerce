import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const productsRouter = createTRPCRouter({
  getAll: baseProcedure
    .input(
      z.object({
        categorySlug: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.find({
        collection: "products",
        depth: 1,
      });
      return data;
    }),
});

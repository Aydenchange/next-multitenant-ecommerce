import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const tagsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().int().positive().nullish(),
        limit: z.number().int().positive().max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const page = input.cursor ?? 1;

      const data = await ctx.db.find({
        collection: "tags",
        depth: 0,
        limit: input.limit,
        page,
        sort: "name",
      });

      return {
        docs: data.docs.map((doc) => ({
          id: doc.id,
          name: doc.name,
        })),
        hasMore: data.hasNextPage,
        nextCursor: data.hasNextPage ? page + 1 : undefined,
      };
    }),
});

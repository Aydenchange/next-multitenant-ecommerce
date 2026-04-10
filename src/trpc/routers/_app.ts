import { authRouter } from "./authRouter";
import { createTRPCRouter } from "../init";
import { categoriesRouter } from "./categoriesRouter";
import { productsRouter } from "./productsRouter";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  categories: categoriesRouter,
  products: productsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

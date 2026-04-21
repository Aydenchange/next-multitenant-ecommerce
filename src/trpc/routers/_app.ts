import { authRouter } from "./authRouter";
import { createTRPCRouter } from "../init";
import { categoriesRouter } from "./categoriesRouter";
import { productsRouter } from "./productsRouter";
import { tagsRouter } from "./tagsRouter";
import { tenantsRouter } from "./tenantsRouter";
import { checkoutRouter } from "./checkoutRouter";
import { libraryRouter } from "./libraryRouter";
import { reviewsRouter } from "./reviewRouter";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  categories: categoriesRouter,
  products: productsRouter,
  tags: tagsRouter,
  tenants: tenantsRouter,
  checkout: checkoutRouter,
  library: libraryRouter,
  reviews: reviewsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

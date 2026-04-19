import {
  buildProductsInfiniteQuery,
  buildTagsInfiniteQuery,
} from "@/modules/product/query-options";
import type { ProductViewFilters } from "@/modules/product/query-options";
import { getQueryClient, trpc } from "@/trpc/server";

type PrefetchProductViewDataParams = {
  categorySlug?: string;
  subCategorySlug?: string;
  tenantSlug?: string;
  productFilters: ProductViewFilters;
};

export const prefetchProductViewData = async ({
  categorySlug,
  subCategorySlug,
  tenantSlug,
  productFilters,
}: PrefetchProductViewDataParams) => {
  const queryClient = getQueryClient();
  const productsQuery = buildProductsInfiniteQuery({
    categorySlug,
    subCategorySlug,
    tenantSlug,
    productFilters,
  });
  const tagsQuery = buildTagsInfiniteQuery();

  await Promise.all([
    queryClient.prefetchInfiniteQuery(
      trpc.products.getMany.infiniteQueryOptions(
        productsQuery.input,
        productsQuery.options,
      ),
    ),
    queryClient.prefetchInfiniteQuery(
      trpc.tags.getMany.infiniteQueryOptions(
        tagsQuery.input,
        tagsQuery.options,
      ),
    ),
  ]);

  return queryClient;
};

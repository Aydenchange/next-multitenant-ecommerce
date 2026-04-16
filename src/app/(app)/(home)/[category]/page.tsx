import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";

import { loadProductFilters } from "@/modules/product/search-params";
import {
  getProductsNextPageParam,
  getTagsNextPageParam,
  productsInfiniteQueryInput,
  tagsInfiniteQueryInput,
} from "@/modules/product/constants";
import ProductList, {
  ProductListSkeleton,
} from "@/modules/product/ui/product-list";

import ProductView from "@/modules/product/product-view";

type props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<SearchParams>;
};

const Page = async ({ params, searchParams }: props) => {
  const { category } = await params;

  // Guard against asset-like paths (e.g. /favicon.ico) matching this dynamic route.
  if (category.includes(".")) {
    notFound();
  }

  const productFilters = await loadProductFilters(searchParams);

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchInfiniteQuery(
      trpc.products.getMany.infiniteQueryOptions(
        {
          categorySlug: category,
          ...productFilters,
          ...productsInfiniteQueryInput,
        },
        {
          getNextPageParam: getProductsNextPageParam,
        },
      ),
    ),
    queryClient.prefetchInfiniteQuery(
      trpc.tags.getMany.infiniteQueryOptions(tagsInfiniteQueryInput, {
        getNextPageParam: getTagsNextPageParam,
      }),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductView>
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList categorySlug={category} />
        </Suspense>
      </ProductView>
    </HydrationBoundary>
  );
};

export default Page;

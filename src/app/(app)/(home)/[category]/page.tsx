import { loadProductFilters } from "@/modules/product/search-params";
import {
  getTagsNextPageParam,
  tagsInfiniteQueryInput,
} from "@/modules/product/constants";
import ProductFilters from "@/modules/product/ui/product-filters";
import ProductList, {
  ProductListSkeleton,
} from "@/modules/product/ui/product-list";
import ProductSort from "@/modules/product/ui/product-sort";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { SearchParams } from "nuqs";
import { Suspense } from "react";

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
    queryClient.prefetchQuery(
      trpc.products.getMany.queryOptions({
        categorySlug: category,
        ...productFilters,
      }),
    ),
    queryClient.prefetchInfiniteQuery(
      trpc.tags.getMany.infiniteQueryOptions(tagsInfiniteQueryInput, {
        getNextPageParam: getTagsNextPageParam,
      }),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="px-4 lg:px-12 py-8 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-y-2 lg:gap-y-0 justify-between">
          <p className="text-2xl font-medium">Curated for you</p>
          <ProductSort />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12">
          <div className="lg:col-span-2 xl:col-span-2">
            <ProductFilters />
          </div>
          <div className="lg:col-span-4 xl:col-span-6">
            <Suspense fallback={<ProductListSkeleton />}>
              <ProductList categorySlug={category} />
            </Suspense>
          </div>
        </div>
      </div>
    </HydrationBoundary>
  );
};

export default Page;

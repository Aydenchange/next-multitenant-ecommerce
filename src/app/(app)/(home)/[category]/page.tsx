import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";

import { loadProductFilters } from "@/modules/product/search-params";
import ProductList, {
  ProductListSkeleton,
} from "@/modules/product/ui/product-list";

import ProductView from "@/modules/product/product-view";
import { prefetchProductViewData } from "@/modules/product/server/prefetch-product-view-data";

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
  const queryClient = await prefetchProductViewData({
    categorySlug: category,
    productFilters,
  });

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

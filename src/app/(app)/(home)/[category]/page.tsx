import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";

import { loadProductFilters } from "@/modules/product/search-params";
import { prefetchProductViewData } from "@/modules/product/server/prefetch-product-view-data";
import ProductListLayout from "@/modules/product/ui/product-list-layout";
import ProductListView, {
  ProductListSkeleton,
} from "@/modules/product/view/product-list-view";

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
      <ProductListLayout>
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductListView categorySlug={category} />
        </Suspense>
      </ProductListLayout>
    </HydrationBoundary>
  );
};

export default Page;

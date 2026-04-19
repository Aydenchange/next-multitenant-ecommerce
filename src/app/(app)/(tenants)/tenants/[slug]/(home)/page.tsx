import type { SearchParams } from "nuqs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { loadProductFilters } from "@/modules/product/search-params";
import { prefetchProductViewData } from "@/modules/product/server/prefetch-product-view-data";
import ProductListView, {
  ProductListSkeleton,
} from "@/modules/product/view/product-list-view";
import ProductListLayout from "@/modules/product/ui/product-list-layout";

interface Props {
  searchParams: Promise<SearchParams>;
  params: Promise<{ slug: string }>;
}

const Page = async ({ params, searchParams }: Props) => {
  const { slug } = await params;
  const productFilters = await loadProductFilters(searchParams);

  const queryClient = await prefetchProductViewData({
    tenantSlug: slug,
    productFilters,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListLayout>
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductListView tenantSlug={slug} />
        </Suspense>
      </ProductListLayout>
    </HydrationBoundary>
  );
};

export default Page;

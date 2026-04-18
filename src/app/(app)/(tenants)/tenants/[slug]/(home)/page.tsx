import type { SearchParams } from "nuqs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { ProductListView } from "@/modules/products/ui/views/product-list-view";
import { loadProductFilters } from "@/modules/product/search-params";
import { prefetchProductViewData } from "@/modules/product/server/prefetch-product-view-data";
import { Suspense } from "react";
import ProductView from "@/modules/product/product-view";
import ProductList, {
  ProductListSkeleton,
} from "@/modules/product/ui/product-list";

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
      <ProductView>
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList tenantSlug={slug} />
        </Suspense>
      </ProductView>
    </HydrationBoundary>
  );
};

export default Page;

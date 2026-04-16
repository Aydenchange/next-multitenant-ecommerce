import { SearchParams } from "nuqs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import ProductList, {
  ProductListSkeleton,
} from "@/modules/product/ui/product-list";
import ProductView from "@/modules/product/product-view";
import { loadProductFilters } from "@/modules/product/search-params";
import { prefetchProductViewData } from "@/modules/product/server/prefetch-product-view-data";

type props = {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams: Promise<SearchParams>;
};

const Page = async ({ params, searchParams }: props) => {
  const { category, subcategory } = await params;

  // Guard against asset-like paths matching this dynamic route.
  if (category.includes(".") || subcategory.includes(".")) {
    notFound();
  }

  const productFilters = await loadProductFilters(searchParams);
  const queryClient = await prefetchProductViewData({
    categorySlug: category,
    subCategorySlug: subcategory,
    productFilters,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductView>
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList categorySlug={category} subCategorySlug={subcategory} />
        </Suspense>
      </ProductView>
    </HydrationBoundary>
  );
};

export default Page;

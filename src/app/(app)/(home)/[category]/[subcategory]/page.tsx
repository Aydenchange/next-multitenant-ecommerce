import ProductList, { ProductListSkeleton } from "@/modules/home/product-list";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type props = {
  params: Promise<{ category: string; subcategory: string }>;
};

const Page = async ({ params }: props) => {
  const { category, subcategory } = await params;

  // Guard against asset-like paths matching this dynamic route.
  if (category.includes(".") || subcategory.includes(".")) {
    notFound();
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({
      categorySlug: category,
      subCategorySlug: subcategory,
    }),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList categorySlug={category} subCategorySlug={subcategory} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;

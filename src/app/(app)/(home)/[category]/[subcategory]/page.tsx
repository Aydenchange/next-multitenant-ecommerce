import { TRPCError } from "@trpc/server";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import ProductList, {
  ProductListSkeleton,
} from "@/modules/product/ui/product-list";

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
  const queryOptions = trpc.products.getMany.queryOptions({
    categorySlug: category,
    subCategorySlug: subcategory,
  });

  try {
    await queryClient.fetchQuery(queryOptions);
  } catch (error) {
    if (
      error instanceof TRPCError &&
      (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")
    ) {
      notFound();
    }

    throw error;
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList categorySlug={category} subCategorySlug={subcategory} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;

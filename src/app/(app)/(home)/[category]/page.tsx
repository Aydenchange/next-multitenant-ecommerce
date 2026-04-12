import ProductList, { ProductListSkeleton } from "@/modules/home/product-list";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type props = {
  params: Promise<{ category: string }>;
};

const Page = async ({ params }: props) => {
  const { category } = await params;

  // Guard against asset-like paths (e.g. /favicon.ico) matching this dynamic route.
  if (category.includes(".")) {
    notFound();
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({ categorySlug: category }),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList categorySlug={category} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;

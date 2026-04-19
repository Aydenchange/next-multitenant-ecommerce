import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { ProductDetailView } from "@/modules/product/view/product-detail-view";

interface PageProps {
  params: Promise<{ slug: string; productId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { slug, productId } = await params;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    trpc.products.getOne.queryOptions({
      id: productId,
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductDetailView tenantSlug={slug} productId={productId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;

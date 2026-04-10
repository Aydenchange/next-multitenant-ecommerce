import ProductList from "@/modules/home/product-list";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

type props = {
  params: Promise<{ category: string }>;
};

const Page = async ({ params }: props) => {
  const { category } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getAll.queryOptions({ categorySlug: category }),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductList />
    </HydrationBoundary>
  );
};

export default Page;

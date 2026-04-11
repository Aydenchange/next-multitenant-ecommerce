"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQueries } from "@tanstack/react-query";

type props = {
  category: string;
};

const ProductList = ({ category }: props) => {
  const trpc = useTRPC();
  const [data] = useSuspenseQueries({
    queries: [trpc.products.getMany.queryOptions({ categorySlug: category })],
  });
  return <div> {JSON.stringify(data, null, 2)}</div>;
};

export const ProductListSkeleton = () => {
  return <div>Loading...</div>;
};

export default ProductList;

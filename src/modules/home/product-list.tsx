"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQueries } from "@tanstack/react-query";

const ProductList = () => {
  const trpc = useTRPC();
  const [data] = useSuspenseQueries({
    queries: [trpc.products.getAll.queryOptions({})],
  });
  return <div> {JSON.stringify(data, null, 2)}</div>;
};

export default ProductList;

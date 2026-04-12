"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

type props = {
  categorySlug?: string;
  subCategorySlug?: string;
};

const ProductList = ({ categorySlug, subCategorySlug }: props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.products.getMany.queryOptions({ categorySlug, subCategorySlug }),
  );
  return <div> {JSON.stringify(data, null, 2)}</div>;
};

export const ProductListSkeleton = () => {
  return <div>Loading...</div>;
};

export default ProductList;

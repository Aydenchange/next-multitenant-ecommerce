"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useProductFilters } from "../hooks/use-product-filters";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import {
  getProductsNextPageParam,
  productsInfiniteQueryInput,
} from "../constants";
import { Button } from "@/components/ui/button";

type props = {
  categorySlug?: string;
  subCategorySlug?: string;
};

const ProductList = ({ categorySlug, subCategorySlug }: props) => {
  const [productFilters] = useProductFilters();
  const trpc = useTRPC();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      trpc.products.getMany.infiniteQueryOptions(
        {
          categorySlug,
          subCategorySlug,
          ...productFilters,
          ...productsInfiniteQueryInput,
        },
        {
          getNextPageParam: getProductsNextPageParam,
        },
      ),
    );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {data?.pages
          .flatMap((page) => page.docs)
          .map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              imageUrl={
                typeof product.image === "object"
                  ? product.image?.url
                  : undefined
              }
              authorUsername="ayden"
              authorImageUrl={undefined}
              reviewRating={3}
              reviewCount={5}
              price={product.price}
            />
          ))}
      </div>
      <div className="flex justify-center mt-6">
        {hasNextPage ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        ) : null}
      </div>
    </>
  );
};

export const ProductListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {Array.from({ length: productsInfiniteQueryInput.limit }).map(
        (_, index) => (
          <ProductCardSkeleton key={index} />
        ),
      )}
    </div>
  );
};

export default ProductList;

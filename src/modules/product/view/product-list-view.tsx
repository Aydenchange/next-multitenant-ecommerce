"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useProductFilters } from "../hooks/use-product-filters";
import { ProductCard, ProductCardSkeleton } from "../ui/product-card";
import { productsInfiniteQueryInput } from "../../../constants";
import { Button } from "@/components/ui/button";
import { buildProductsInfiniteQuery } from "../query-options";

type props = {
  categorySlug?: string;
  subCategorySlug?: string;
  tenantSlug?: string;
};

const ProductListView = ({
  categorySlug,
  subCategorySlug,
  tenantSlug,
}: props) => {
  const [productFilters] = useProductFilters();
  const trpc = useTRPC();
  const productsQuery = buildProductsInfiniteQuery({
    categorySlug,
    subCategorySlug,
    tenantSlug,
    productFilters,
  });
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      trpc.products.getMany.infiniteQueryOptions(
        productsQuery.input,
        productsQuery.options,
      ),
    );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {data?.pages
          .flatMap((page) => page.docs)
          .flatMap((product) => {
            const tenantSlug = product.tenant?.slug;

            if (!tenantSlug) {
              return [];
            }

            return [
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                tenantSlug={tenantSlug}
                imageUrl={product.image?.url || undefined}
                authorUsername={product.tenant?.name || "Unknown"}
                authorImageUrl={product.tenant?.image?.url || undefined}
                reviewRating={product.reviewRating}
                reviewCount={product.reviewCount}
                price={product.price}
              />,
            ];
          })}
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

export default ProductListView;

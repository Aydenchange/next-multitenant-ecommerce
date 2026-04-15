"use client";

import { useProductFilters } from "../hooks/use-product-filters";
import { ProductSort } from "../constants";

const ProductSortSection = () => {
  const [, setProductFilters] = useProductFilters();
  return (
    <div className="flex gap-4 justify-between">
      <div onClick={() => setProductFilters({ sort: ProductSort.CURATED })}>
        Curated
      </div>
      <div onClick={() => setProductFilters({ sort: ProductSort.TRENDING })}>
        Trending
      </div>
      <div onClick={() => setProductFilters({ sort: ProductSort.HOT_AND_NEW })}>
        Hot & New
      </div>
    </div>
  );
};

export default ProductSortSection;

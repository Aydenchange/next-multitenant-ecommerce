"use client";

import { useProductFilters } from "../hooks/use-product-filters";
import { ProductSort } from "../../../constants";

const ProductSortSection = () => {
  const [filters, setProductFilters] = useProductFilters();

  const sortOptions = [
    { value: ProductSort.CURATED, label: "Curated" },
    { value: ProductSort.TRENDING, label: "Trending" },
    { value: ProductSort.HOT_AND_NEW, label: "Hot & New" },
  ] as const;

  return (
    <div className="flex gap-4 justify-between">
      {sortOptions.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setProductFilters({ sort: value })}
          className={filters.sort === value ? "font-bold underline" : ""}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ProductSortSection;

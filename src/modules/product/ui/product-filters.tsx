"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import PriceFilter from "./price-filter";
import { useProductFilters } from "../hooks/use-product-filters";
import TagFilter from "@/modules/product/ui/tag-filter";

interface ProductFilterProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

const ProductFilter = ({ children, title, className }: ProductFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const Icon = isOpen ? ChevronDownIcon : ChevronRightIcon;

  return (
    <div className={cn("p-4 border-b flex flex-col gap-2", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center justify-between cursor-pointer"
        aria-expanded={isOpen}
      >
        <p className="font-medium">{title}</p>
        <Icon className="size-5" />
      </button>
      {isOpen && children}
    </div>
  );
};

const ProductFilters = () => {
  const [filters, setFilters] = useProductFilters();
  const hasActiveFilters = Boolean(
    (filters.minPrice ?? "").trim() ||
    (filters.maxPrice ?? "").trim() ||
    (filters.tags?.length ?? 0) > 0,
  );

  function handleClear() {
    setFilters({ minPrice: "", maxPrice: "", tags: [] });
  }

  return (
    <div className="border rounded-md bg-white">
      <div className="p-4 border-b flex items-center justify-between">
        <p className="font-medium">Filters</p>
        {hasActiveFilters ? (
          <button className="underline" type="button" onClick={handleClear}>
            Clear
          </button>
        ) : null}
      </div>
      <div>
        <ProductFilter title="Price">
          <PriceFilter
            minPrice={filters.minPrice ?? ""}
            maxPrice={filters.maxPrice ?? ""}
            onMinPriceChange={(value) =>
              setFilters({ ...filters, minPrice: value })
            }
            onMaxPriceChange={(value) =>
              setFilters({ ...filters, maxPrice: value })
            }
          />
        </ProductFilter>
        <ProductFilter title="Tag">
          <TagFilter />
        </ProductFilter>
      </div>
    </div>
  );
};

export default ProductFilters;

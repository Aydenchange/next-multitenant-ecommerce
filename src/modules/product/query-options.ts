import {
  getProductsNextPageParam,
  getTagsNextPageParam,
  productsInfiniteQueryInput,
  tagsInfiniteQueryInput,
} from "@/constants";
import { loadProductFilters } from "@/modules/product/search-params";

type ProductViewFilters = Awaited<ReturnType<typeof loadProductFilters>>;

type BuildProductsInfiniteQueryParams = {
  categorySlug?: string;
  subCategorySlug?: string;
  tenantSlug?: string;
  productFilters: ProductViewFilters;
};

export const buildProductsInfiniteQuery = ({
  categorySlug,
  subCategorySlug,
  tenantSlug,
  productFilters,
}: BuildProductsInfiniteQueryParams) => ({
  input: {
    categorySlug,
    subCategorySlug,
    tenantSlug,
    ...productFilters,
    ...productsInfiniteQueryInput,
  },
  options: {
    getNextPageParam: getProductsNextPageParam,
  },
});

export const buildTagsInfiniteQuery = () => ({
  input: tagsInfiniteQueryInput,
  options: {
    getNextPageParam: getTagsNextPageParam,
  },
});

export type { ProductViewFilters };

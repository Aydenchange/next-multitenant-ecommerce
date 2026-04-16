import {
  getProductsNextPageParam,
  getTagsNextPageParam,
  productsInfiniteQueryInput,
  tagsInfiniteQueryInput,
} from "@/modules/product/constants";
import { loadProductFilters } from "@/modules/product/search-params";

type ProductViewFilters = Awaited<ReturnType<typeof loadProductFilters>>;

type BuildProductsInfiniteQueryParams = {
  categorySlug?: string;
  subCategorySlug?: string;
  productFilters: ProductViewFilters;
};

export const buildProductsInfiniteQuery = ({
  categorySlug,
  subCategorySlug,
  productFilters,
}: BuildProductsInfiniteQueryParams) => ({
  input: {
    categorySlug,
    subCategorySlug,
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

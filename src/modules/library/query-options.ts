import { PRODUCTS_LIMIT } from "@/constants";

type LibraryInfinitePage = {
  docs: unknown[];
  nextPage?: number | null;
};

export const buildLibraryInfiniteQuery = () => ({
  input: {
    limit: PRODUCTS_LIMIT,
  },
  options: {
    getNextPageParam: (lastPage: LibraryInfinitePage) =>
      lastPage.docs.length > 0 ? (lastPage.nextPage ?? undefined) : undefined,
  },
});
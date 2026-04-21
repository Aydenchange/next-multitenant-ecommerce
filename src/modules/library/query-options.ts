import { PRODUCTS_LIMIT } from "@/constants";

type LibraryInfinitePage = {
  docs: unknown[];
  nextCursor?: number;
};

export const buildLibraryInfiniteQuery = () => ({
  input: {
    limit: PRODUCTS_LIMIT,
  },
  options: {
    getNextPageParam: (lastPage: LibraryInfinitePage) => lastPage.nextCursor,
  },
});

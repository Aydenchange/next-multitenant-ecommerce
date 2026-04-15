export enum ProductSort {
  NONE = "",
  CURATED = "curated",
  TRENDING = "trending",
  HOT_AND_NEW = "hot_and_new",
}

export const productSortValues = [
  ProductSort.NONE,
  ProductSort.CURATED,
  ProductSort.HOT_AND_NEW,
  ProductSort.TRENDING,
] as const;

export const TAGS_LIMIT = 3;

type TagsInfinitePage = {
  nextCursor?: number;
};

export const tagsInfiniteQueryInput = {
  limit: TAGS_LIMIT,
} as const;

export const getTagsNextPageParam = (lastPage: TagsInfinitePage) =>
  lastPage.nextCursor;

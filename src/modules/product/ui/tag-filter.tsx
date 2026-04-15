"use client";

import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useProductFilters } from "../hooks/use-product-filters";
import { getTagsNextPageParam, tagsInfiniteQueryInput } from "../constants";

const TagFilter = () => {
  const [filters, setFilters] = useProductFilters();
  const trpc = useTRPC();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery(
    trpc.tags.getMany.infiniteQueryOptions(tagsInfiniteQueryInput, {
      getNextPageParam: getTagsNextPageParam,
    }),
  );

  const selectedTags = filters.tags ?? [];
  const tags = data?.pages.flatMap((page) => page.docs) ?? [];

  const handleCheckedChange = (
    tagId: string,
    checked: boolean | "indeterminate",
  ) => {
    const nextTags = checked
      ? [...selectedTags, tagId]
      : selectedTags.filter((currentTagId) => currentTagId !== tagId);

    setFilters({ tags: [...new Set(nextTags)] });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Selected: {selectedTags.length}
      </p>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading tags...</p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive">Failed to load tags.</p>
      ) : null}
      {!isLoading && !error && tags.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tags available.</p>
      ) : null}

      {tags.map((tag) => {
        const isChecked = selectedTags.includes(tag.id);

        return (
          <label
            key={tag.id}
            htmlFor={`tag-${tag.id}`}
            className="flex items-center gap-3 text-sm cursor-pointer"
          >
            <Checkbox
              id={`tag-${tag.id}`}
              checked={isChecked}
              onCheckedChange={(checked) =>
                handleCheckedChange(tag.id, checked)
              }
            />
            <span>{tag.name}</span>
          </label>
        );
      })}

      {hasNextPage ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="self-start"
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      ) : null}
    </div>
  );
};

export default TagFilter;

"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

import Categories from "./Categories";
import SearchInput from "./SearchInput";

const categoriesStaleTime = 5 * 60 * 1000;

function CategoriesSkeleton() {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex flex-nowrap items-center gap-2 min-w-0">
        <div className="h-10 w-24 rounded-md bg-neutral-200 animate-pulse" />
        <div className="h-10 w-28 rounded-md bg-neutral-200 animate-pulse" />
        <div className="h-10 w-20 rounded-md bg-neutral-200 animate-pulse" />
        <div className="h-10 w-32 rounded-md bg-neutral-200 animate-pulse" />
      </div>
      <div className="h-10 w-24 rounded-md bg-neutral-200 animate-pulse shrink-0" />
    </div>
  );
}

export default function SearchFiltersClient() {
  const trpc = useTRPC();
  const { data = [], isLoading } = useQuery({
    ...trpc.categories.getAll.queryOptions(),
    staleTime: categoriesStaleTime,
  });

  return (
    <div className="mt-4 px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full">
      <SearchInput />
      {isLoading ? <CategoriesSkeleton /> : <Categories data={data} />}
    </div>
  );
}

"use client";

import { useTRPC } from "@/trpc/client";
import Categories from "./Categories";
import SearchInput from "./SearchInput";
import { useQuery } from "@tanstack/react-query";

export default function SearchFilters() {
  const tRPC = useTRPC();
  const { data = [] } = useQuery(tRPC.categories.getAll.queryOptions());
  console.log("Categories data:", data);
  return (
    <div className="mt-4 px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full">
      <SearchInput />
      <Categories data={data} />
    </div>
  );
}

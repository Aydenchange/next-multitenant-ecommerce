import { getQueryClient, trpc } from "@/trpc/server";
import SearchFiltersClient from "./SearchFiltersClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function SearchFilters() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.categories.getAll.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchFiltersClient />
    </HydrationBoundary>
  );
}

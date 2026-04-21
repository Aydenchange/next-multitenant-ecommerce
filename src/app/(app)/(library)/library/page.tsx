import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";

import { buildLibraryInfiniteQuery } from "@/modules/library/query-options";
import { LibraryView } from "@/modules/library/ui/views/library-view";

const Page = async () => {
  const queryClient = getQueryClient();
  const productsQuery = buildLibraryInfiniteQuery();

  await queryClient.prefetchInfiniteQuery(
    trpc.library.getMany.infiniteQueryOptions(
      productsQuery.input,
      productsQuery.options,
    ),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LibraryView />
    </HydrationBoundary>
  );
};

export default Page;

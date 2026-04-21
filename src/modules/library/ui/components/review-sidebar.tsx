"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { ReviewForm } from "./review-form";

export const ReviewSidebar = ({ productId }: { productId: string }) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.reviews.getOne.queryOptions({ productId }),
  );

  return <ReviewForm productId={productId} initialData={data} />;
};

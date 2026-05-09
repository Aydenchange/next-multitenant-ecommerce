import type { Payload, Where } from "payload";

import type { Product, Review } from "@/payload-types";
import { tenantWhere } from "@/lib/tenant";

export type ReviewSummary = {
  reviewCount: number;
  reviewRating: number;
  ratingDistribution: Record<number, number>;
};

const emptyRatingDistribution = () => ({
  5: 0,
  4: 0,
  3: 0,
  2: 0,
  1: 0,
});

const emptySummary = (): ReviewSummary => ({
  reviewCount: 0,
  reviewRating: 0,
  ratingDistribution: emptyRatingDistribution(),
});

const toProductId = (product: Review["product"]) =>
  typeof product === "string" ? product : product.id;

type ReviewSummaryOptions = {
  tenantId?: string | null;
};

export async function getReviewSummariesByProductIds(
  payload: Payload,
  productIds: string[],
  options: ReviewSummaryOptions = {},
) {
  const uniqueProductIds = [...new Set(productIds)].filter(Boolean);
  const summaries = new Map<string, ReviewSummary>();

  uniqueProductIds.forEach((productId) => {
    summaries.set(productId, emptySummary());
  });

  if (uniqueProductIds.length === 0) {
    return summaries;
  }

  const baseWhere: Where = {
    product: {
      in: uniqueProductIds,
    },
  };

  const reviewsData = await payload.find({
    collection: "reviews",
    depth: 0,
    pagination: false,
    where: options.tenantId ? tenantWhere(options.tenantId, baseWhere) : baseWhere,
  });

  reviewsData.docs.forEach((review) => {
    const productId = toProductId(review.product);
    const summary = summaries.get(productId);

    if (!summary) return;

    summary.reviewCount += 1;
    summary.reviewRating += review.rating;

    if (review.rating >= 1 && review.rating <= 5) {
      summary.ratingDistribution[review.rating] =
        (summary.ratingDistribution[review.rating] ?? 0) + 1;
    }
  });

  summaries.forEach((summary) => {
    if (summary.reviewCount === 0) return;

    summary.reviewRating = summary.reviewRating / summary.reviewCount;

    Object.keys(summary.ratingDistribution).forEach((key) => {
      const rating = Number(key);
      const count = summary.ratingDistribution[rating] || 0;
      summary.ratingDistribution[rating] = Math.round(
        (count / summary.reviewCount) * 100,
      );
    });
  });

  return summaries;
}

export async function getReviewSummaryForProduct(
  payload: Payload,
  product: Pick<Product, "id" | "tenant">,
) {
  const summaries = await getReviewSummariesByProductIds(payload, [product.id], {
    tenantId:
      typeof product.tenant === "string" ? product.tenant : product.tenant?.id,
  });

  return summaries.get(product.id) ?? emptySummary();
}

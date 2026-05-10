import { describe, expect, it, vi } from "vitest";

import {
  getReviewSummariesByProductIds,
  getReviewSummaryForProduct,
} from "@/lib/review-summary";
import type { Payload } from "payload";

const createPayloadMock = (docs: Array<{ product: string; rating: number }>) =>
  ({
    find: vi.fn().mockResolvedValue({
      docs: docs.map((doc, index) => ({
        id: `review_${index}`,
        description: `review ${index}`,
        user: "user_1",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        ...doc,
      })),
    }),
  }) as unknown as Payload;

describe("review summary aggregation", () => {
  it("fetches all product reviews in one batched query", async () => {
    const payload = createPayloadMock([
      { product: "product_1", rating: 5 },
      { product: "product_1", rating: 3 },
      { product: "product_2", rating: 4 },
    ]);

    const summaries = await getReviewSummariesByProductIds(payload, [
      "product_1",
      "product_2",
      "product_1",
    ]);

    expect(payload.find).toHaveBeenCalledTimes(1);
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "reviews",
        depth: 0,
        pagination: false,
        where: {
          product: {
            in: ["product_1", "product_2"],
          },
        },
      }),
    );

    expect(summaries.get("product_1")).toEqual({
      reviewCount: 2,
      reviewRating: 4,
      ratingDistribution: {
        5: 50,
        4: 0,
        3: 50,
        2: 0,
        1: 0,
      },
    });

    expect(summaries.get("product_2")).toEqual({
      reviewCount: 1,
      reviewRating: 4,
      ratingDistribution: {
        5: 0,
        4: 100,
        3: 0,
        2: 0,
        1: 0,
      },
    });
  });

  it("keeps empty summaries for products without reviews", async () => {
    const payload = createPayloadMock([]);

    const summaries = await getReviewSummariesByProductIds(payload, [
      "product_1",
    ]);

    expect(summaries.get("product_1")).toEqual({
      reviewCount: 0,
      reviewRating: 0,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    });
  });

  it("applies tenant scope when computing a single product summary", async () => {
    const payload = createPayloadMock([{ product: "product_1", rating: 5 }]);

    await getReviewSummaryForProduct(payload, {
      id: "product_1",
      tenant: "tenant_1",
    });

    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          and: [
            {
              tenant: {
                equals: "tenant_1",
              },
            },
            {
              product: {
                in: ["product_1"],
              },
            },
          ],
        },
      }),
    );
  });
});

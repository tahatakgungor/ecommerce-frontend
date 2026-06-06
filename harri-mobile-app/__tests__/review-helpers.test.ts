import { getReviewStatusMeta, normalizeReviewOverview } from "@/modules/reviews/helpers";

describe("review helpers", () => {
  it("normalizes pending and reviewed overview lists", () => {
    const overview = normalizeReviewOverview({
      data: {
        pending: [
          {
            productId: "product-1",
            orderId: "order-1",
            title: "Bekleyen urun",
          },
        ],
        reviewed: [
          {
            productId: "product-2",
            orderId: "order-1",
            title: "Degerlendirilen urun",
            review: {
              reviewId: "review-2",
              productId: "product-2",
              rating: 4,
              commentBody: "Iyi urun",
              status: "APPROVED",
              updatedAt: "2026-06-06T08:00:00.000Z",
            },
          },
        ],
      },
    });

    expect(overview.pending).toHaveLength(1);
    expect(overview.pending[0]?.hasReview).toBe(false);
    expect(overview.reviewed).toHaveLength(1);
    expect(overview.reviewed[0]?.reviewId).toBe("review-2");
    expect(overview.reviewed[0]?.status).toBe("APPROVED");
  });

  it("provides readable review status meta", () => {
    expect(getReviewStatusMeta("APPROVED").label).toBe("Onaylandi");
    expect(getReviewStatusMeta("PENDING").label).toBe("Onay Bekliyor");
    expect(getReviewStatusMeta("REJECTED").label).toBe("Reddedildi");
  });
});

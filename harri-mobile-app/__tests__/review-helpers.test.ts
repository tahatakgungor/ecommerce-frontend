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
            image: "/uploads/review-pending.jpg",
          },
        ],
        reviewed: [
          {
            productId: "product-2",
            orderId: "order-1",
            title: "Degerlendirilen urun",
            image: "http://localhost:8080/uploads/reviewed.jpg",
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
    expect(overview.pending[0]?.imageUrl).toBe("https://api.serravit.com/uploads/review-pending.jpg");
    expect(overview.reviewed).toHaveLength(1);
    expect(overview.reviewed[0]?.reviewId).toBe("review-2");
    expect(overview.reviewed[0]?.status).toBe("APPROVED");
    expect(overview.reviewed[0]?.imageUrl).toBe("https://api.serravit.com/uploads/reviewed.jpg");
  });

  it("provides readable review status meta", () => {
    expect(getReviewStatusMeta("APPROVED").label).toBe("Onaylandı");
    expect(getReviewStatusMeta("PENDING").label).toBe("Onay Bekliyor");
    expect(getReviewStatusMeta("REJECTED").label).toBe("Reddedildi");
  });
});

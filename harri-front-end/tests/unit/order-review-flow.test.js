import { describe, expect, it } from "vitest";
import {
  buildOrderReviewRedirectPath,
  buildReviewedLookup,
  clearReviewIntentFromPath,
  getReviewItemsForOrder,
} from "../../src/utils/order-review-flow";

describe("order review flow helpers", () => {
  it("builds reviewed lookup from mixed row shapes", () => {
    const lookup = buildReviewedLookup([
      { productId: "p1", review: { status: "approved" } },
      { review: { productId: "p2", status: "pending" } },
      { review: { status: "missing" } },
    ]);

    expect(Object.keys(lookup)).toEqual(["p1", "p2"]);
    expect(lookup.p1.review.status).toBe("approved");
    expect(lookup.p2.review.status).toBe("pending");
  });

  it("collects all review items for an order and merges existing review data", () => {
    const items = getReviewItemsForOrder(
      {
        _id: "order-1",
        cart: [
          { _id: "p1", title: "First Product", image: "/p1.jpg" },
          { id: "p2", title: "Second Product", image: "/p2.jpg" },
          { title: "Missing Product Id" },
        ],
      },
      {
        p2: { reviewId: "r2", review: { status: "approved" } },
      }
    );

    expect(items).toEqual([
      {
        productId: "p1",
        orderId: "order-1",
        title: "First Product",
        image: "/p1.jpg",
      },
      {
        productId: "p2",
        orderId: "order-1",
        title: "Second Product",
        image: "/p2.jpg",
        reviewId: "r2",
        review: { status: "approved" },
      },
    ]);
  });

  it("builds login redirect while preserving existing order lookup params", () => {
    const path = buildOrderReviewRedirectPath(
      "/order/abc",
      new URLSearchParams("invoice=1001&email=test%40mail.com&viewToken=xyz")
    );

    expect(path).toBe(
      "/login?redirect=%2Forder%2Fabc%3Finvoice%3D1001%26email%3Dtest%2540mail.com%26viewToken%3Dxyz%26openReview%3D1"
    );
  });

  it("removes review intent without dropping remaining params", () => {
    const path = clearReviewIntentFromPath(
      "/order/abc",
      new URLSearchParams("invoice=1001&openReview=1&email=test%40mail.com")
    );

    expect(path).toBe("/order/abc?invoice=1001&email=test%40mail.com");
  });

  it("returns plain pathname when review intent is the only transient param", () => {
    const path = clearReviewIntentFromPath(
      "/order/abc",
      new URLSearchParams("openReview=1")
    );

    expect(path).toBe("/order/abc");
  });
});

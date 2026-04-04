import { describe, expect, it } from "vitest";
import { getReviewPageTitle } from "../../src/utils/review-status";

describe("getReviewPageTitle", () => {
  it("returns pending title", () => {
    expect(getReviewPageTitle("PENDING")).toBe("Bekleyen Yorumlar");
  });

  it("returns approved title", () => {
    expect(getReviewPageTitle("APPROVED")).toBe("Onaylanan Yorumlar");
  });

  it("returns rejected title", () => {
    expect(getReviewPageTitle("REJECTED")).toBe("Reddedilen Yorumlar");
  });
});


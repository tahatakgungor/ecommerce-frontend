import { describe, expect, it } from "vitest";
import {
  buildReviewQueryParams,
  getActiveReviewFilterChips,
  hasActiveReviewFilters,
} from "../../src/utils/review-filters";

describe("review filters", () => {
  it("builds query params with optional filters", () => {
    const params = buildReviewQueryParams({
      productId: "abc",
      sort: "most_helpful",
      withMedia: true,
      exactRating: 2,
      minRating: 4,
      verifiedOnly: true,
      page: 2,
      size: 8,
    });

    expect(params.get("sort")).toBe("most_helpful");
    expect(params.get("withMedia")).toBe("true");
    expect(params.get("exactRating")).toBe("2");
    expect(params.get("minRating")).toBe("4");
    expect(params.get("verifiedOnly")).toBe("true");
    expect(params.get("page")).toBe("2");
    expect(params.get("size")).toBe("8");
  });

  it("omits empty min rating and normalizes bounds", () => {
    const params = buildReviewQueryParams({
      minRating: 99,
      page: -2,
      size: 0,
    });

    expect(params.get("minRating")).toBe("5");
    expect(params.get("page")).toBe("0");
    expect(params.get("size")).toBe("1");
  });

  it("returns active chips for non-default filters", () => {
    const chips = getActiveReviewFilterChips({
      lang: "tr",
      sort: "most_helpful",
      withMedia: true,
      exactRating: 2,
      minRating: 4,
      verifiedOnly: true,
    });

    expect(chips.map((chip) => chip.label)).toEqual([
      "En faydalı",
      "Fotoğraflı",
      "Doğrulanmış alıcı",
      "2 yıldız",
      "4+ yıldız",
    ]);
  });

  it("detects whether any review filter is active", () => {
    expect(hasActiveReviewFilters({ sort: "newest", withMedia: false, exactRating: null, minRating: null, verifiedOnly: false })).toBe(false);
    expect(hasActiveReviewFilters({ sort: "highest", withMedia: false, exactRating: null, minRating: null, verifiedOnly: false })).toBe(true);
  });
});

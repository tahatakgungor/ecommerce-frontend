import { describe, expect, it } from "vitest";
import { resolveReviewFormState } from "../../src/utils/review-eligibility";

describe("resolveReviewFormState", () => {
  it("requires authentication", () => {
    const state = resolveReviewFormState({ user: null, eligibility: null, lang: "tr" });
    expect(state.canSubmit).toBe(false);
    expect(state.message).toMatch(/giriş/i);
  });

  it("returns loading state while eligibility is unknown", () => {
    const state = resolveReviewFormState({ user: { id: "1" }, eligibility: null, lang: "en" });
    expect(state.canSubmit).toBe(false);
    expect(state.message).toMatch(/eligibility/i);
  });

  it("allows submission when eligible", () => {
    const state = resolveReviewFormState({
      user: { id: "1" },
      eligibility: { canReview: true },
      lang: "tr",
    });
    expect(state.canSubmit).toBe(true);
    expect(state.message).toBe(null);
  });

  it("returns backend reason when not eligible", () => {
    const state = resolveReviewFormState({
      user: { id: "1" },
      eligibility: { canReview: false, reason: "Teslim edilmemiş sipariş." },
      lang: "tr",
    });
    expect(state.canSubmit).toBe(false);
    expect(state.message).toBe("Teslim edilmemiş sipariş.");
  });
});

import { describe, expect, it } from "vitest";
import { getRatingVisualState } from "../../src/utils/rating-visual";

describe("getRatingVisualState", () => {
  it("shows half fifth star at 4.5", () => {
    const state = getRatingVisualState(4.5);
    expect(state.fullStars).toBe(4);
    expect(state.showHalfOnFifthStar).toBe(true);
  });

  it("shows half fifth star for values between 4.5 and 5", () => {
    const state = getRatingVisualState(4.8);
    expect(state.fullStars).toBe(4);
    expect(state.showHalfOnFifthStar).toBe(true);
  });

  it("does not show half star at exact 5", () => {
    const state = getRatingVisualState(5);
    expect(state.fullStars).toBe(5);
    expect(state.showHalfOnFifthStar).toBe(false);
  });

  it("clamps invalid values", () => {
    expect(getRatingVisualState(-2).average).toBe(0);
    expect(getRatingVisualState(99).average).toBe(5);
    expect(getRatingVisualState("abc").average).toBe(0);
  });
});


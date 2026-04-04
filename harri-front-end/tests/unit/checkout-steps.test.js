import { describe, expect, it } from "vitest";
import { getCheckoutSteps, getStepState } from "../../src/utils/checkout-steps";

describe("checkout step helpers", () => {
  it("returns Turkish labels by default", () => {
    const steps = getCheckoutSteps("tr");
    expect(steps.map((s) => s.label)).toEqual(["Sepet", "Ödeme", "Onay"]);
  });

  it("returns English labels when language is en", () => {
    const steps = getCheckoutSteps("en");
    expect(steps.map((s) => s.label)).toEqual(["Cart", "Checkout", "Confirmation"]);
  });

  it("calculates step state correctly", () => {
    expect(getStepState(1, 2)).toBe("done");
    expect(getStepState(2, 2)).toBe("active");
    expect(getStepState(3, 2)).toBe("upcoming");
  });
});

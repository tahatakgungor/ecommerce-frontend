import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resolveMobilePaymentReturnUrl } from "src/utils/mobile-payment-return-url";

describe("resolveMobilePaymentReturnUrl", () => {
  const originalValue = process.env.MOBILE_PAYMENT_RETURN_URL_PREFIXES;

  beforeEach(() => {
    process.env.MOBILE_PAYMENT_RETURN_URL_PREFIXES = "serravitmobile://,exp://,http://localhost:";
  });

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.MOBILE_PAYMENT_RETURN_URL_PREFIXES;
    } else {
      process.env.MOBILE_PAYMENT_RETURN_URL_PREFIXES = originalValue;
    }
  });

  it("accepts configured mobile deep links", () => {
    expect(resolveMobilePaymentReturnUrl("serravitmobile://payment-result?token=abc")).toBe(
      "serravitmobile://payment-result?token=abc"
    );
  });

  it("rejects open redirect style urls", () => {
    expect(resolveMobilePaymentReturnUrl("https://evil.example/payment-result")).toBeNull();
  });
});

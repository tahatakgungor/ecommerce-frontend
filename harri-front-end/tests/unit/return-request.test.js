import { describe, expect, it } from "vitest";
import {
  buildReturnRequestPayload,
  canSubmitReturnRequest,
} from "../../src/utils/return-request";

describe("return request helpers", () => {
  it("allows submission only when reason exists and submission is idle", () => {
    expect(canSubmitReturnRequest("Hasarlı ürün", false)).toBe(true);
    expect(canSubmitReturnRequest("", false)).toBe(false);
    expect(canSubmitReturnRequest("   ", false)).toBe(false);
    expect(canSubmitReturnRequest("Hasarlı ürün", true)).toBe(false);
  });

  it("builds payload with trimmed optional customer note", () => {
    expect(
      buildReturnRequestPayload("order-1", "Yanlış ürün", "  Paket açık geldi  ")
    ).toEqual({
      orderId: "order-1",
      reason: "Yanlış ürün",
      customerNote: "Paket açık geldi",
    });
  });

  it("omits empty customer note from payload", () => {
    expect(buildReturnRequestPayload("order-1", "Fikrim değişti", "   ")).toEqual({
      orderId: "order-1",
      reason: "Fikrim değişti",
      customerNote: undefined,
    });
  });
});

import { describe, expect, it } from "vitest";
import { getOrderStatusMeta } from "../../src/utils/order-status";

describe("getOrderStatusMeta", () => {
  it("returns Turkish metadata for delivered orders", () => {
    const meta = getOrderStatusMeta("delivered", "tr");
    expect(meta.label).toBe("Teslim Edildi");
    expect(meta.tone).toBe("success");
  });

  it("returns English metadata for processing orders", () => {
    const meta = getOrderStatusMeta("processing", "en");
    expect(meta.label).toBe("Preparing");
    expect(meta.tone).toBe("info");
  });

  it("returns fallback for unknown status", () => {
    const meta = getOrderStatusMeta("unknown", "tr");
    expect(meta.label).toMatch(/Durum/);
    expect(meta.tone).toBe("secondary");
  });
});

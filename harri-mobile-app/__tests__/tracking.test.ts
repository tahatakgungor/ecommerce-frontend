import { buildCarrierTrackingMeta } from "@/modules/orders/tracking";

describe("tracking helper", () => {
  it("builds carrier specific tracking url", () => {
    const tracking = buildCarrierTrackingMeta("Aras Kargo", "TEST123456");
    expect(tracking?.url).toContain("araskargo");
  });

  it("falls back to search url for unknown carriers", () => {
    const tracking = buildCarrierTrackingMeta("Bilinmeyen", "ZX-99");
    expect(tracking?.url).toContain("google.com/search");
  });
});

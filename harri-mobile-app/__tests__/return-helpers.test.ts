import { normalizeReturnRequest } from "@/modules/returns/helpers";

describe("return helpers", () => {
  it("normalizes return request payload", () => {
    const request = normalizeReturnRequest({
      _id: "return-1",
      orderId: "order-1",
      invoice: "SRV-1001",
      status: "REQUESTED",
      reason: "Hasarli teslimat",
      customerNote: "Kutu ezik geldi.",
      createdAt: "2026-06-06T08:00:00.000Z",
      updatedAt: "2026-06-06T08:30:00.000Z",
    });

    expect(request).not.toBeNull();
    expect(request?.status).toBe("REQUESTED");
    expect(request?.statusLabel).toBe("İade Talebi");
    expect(request?.invoice).toBe("SRV-1001");
  });
});

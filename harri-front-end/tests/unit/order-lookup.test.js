import { describe, expect, it } from "vitest";
import { buildOrderLookupRedirect, resolveLookupOrder } from "../../src/utils/order-lookup";

describe("order lookup helpers", () => {
  it("resolves direct order payload", () => {
    const order = resolveLookupOrder({ data: { order: { _id: "o1" } } });
    expect(order).toEqual({ _id: "o1" });
  });

  it("resolves nested order payloads", () => {
    expect(resolveLookupOrder({ data: { data: { order: { _id: "o2" } } } })).toEqual({ _id: "o2" });
    expect(resolveLookupOrder({ data: { result: { order: { _id: "o3" } } } })).toEqual({ _id: "o3" });
  });

  it("returns null when response does not contain order", () => {
    expect(resolveLookupOrder({ data: {} })).toBe(null);
    expect(resolveLookupOrder(null)).toBe(null);
  });

  it("builds order lookup redirect with encoded query params", () => {
    const path = buildOrderLookupRedirect("order-1", {
      invoice: " INV-001 ",
      email: "user+test@mail.com ",
    });

    expect(path).toBe("/order/order-1?invoice=INV-001&email=user%2Btest%40mail.com");
  });
});

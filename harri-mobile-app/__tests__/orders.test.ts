import { buildOrderOverview, filterOrdersByStatus, normalizeOrder } from "../src/modules/orders/helpers";
import { getOrderStatusMeta } from "../src/modules/orders/status";
import type { OrderDetail, OrderSummary } from "../src/modules/orders/types";

const normalizedOrder: OrderDetail = normalizeOrder({
  _id: "order-1",
  name: "Tahat Takgungor",
  email: "customer@example.com",
  address: "Istanbul / Kadikoy",
  contact: "5551112233",
  city: "Istanbul",
  country: "Turkey",
  zipCode: "34000",
  status: "shipped",
  invoice: "SRV-1001",
  subTotal: 1200,
  shippingCost: 49.9,
  discount: 0,
  totalAmount: 1249.9,
  paymentMethod: "Kredi Karti",
  createdAt: "2026-06-05T10:00:00.000Z",
  shippingCarrier: "Aras Kargo",
  trackingNumber: "TEST123",
  cart: [
    {
      _id: "product-1",
      title: "Humata Leo",
      price: 1200,
      orderQuantity: 1,
      parent: "Yasam",
      category: {
        name: "Takviye",
      },
    },
  ],
});

describe("orders helpers", () => {
  it("normalizes backend order payload into mobile order detail", () => {
    expect(normalizedOrder).toMatchObject({
      id: "order-1",
      invoice: "SRV-1001",
      status: "shipped",
      statusText: "Kargoda",
      itemCount: 1,
      shippingCarrier: "Aras Kargo",
    });
    expect(normalizedOrder.totalAmountText).toContain("₺");
  });

  it("builds order overview counters and filters by status", () => {
    const orders: OrderSummary[] = [
      normalizedOrder,
      {
        ...normalizedOrder,
        id: "order-2",
        status: "pending",
        statusText: "Sipariş Alındı",
        statusDescription: "Siparişiniz hazırlık kuyruğuna alındı.",
        statusTone: "warning",
      },
    ];

    expect(buildOrderOverview(orders)).toEqual({
      total: 2,
      pending: 1,
      processing: 0,
      shipped: 1,
      delivered: 0,
    });
    expect(filterOrdersByStatus(orders, "shipped")).toHaveLength(1);
  });

  it("returns fallback metadata for unknown order statuses", () => {
    expect(getOrderStatusMeta("mystery")).toEqual({
      status: "unknown",
      label: "Durum Güncelleniyor",
      description: "Sipariş durumu güncelleniyor.",
      tone: "secondary",
    });
  });
});

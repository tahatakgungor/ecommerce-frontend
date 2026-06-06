import { buildNotificationFeed } from "../src/modules/notifications/logic";
import { DEFAULT_COMMERCE_PREFERENCES_STATE } from "../src/modules/preferences/types";
import type { OrderSummary } from "../src/modules/orders/types";
import type { ReviewOverview } from "../src/modules/reviews/types";

const baseOrder: OrderSummary = {
  id: "order-1",
  invoice: "SRV-1001",
  status: "shipped",
  statusText: "Kargoda",
  statusDescription: "Siparisiniz kargoda.",
  statusTone: "info",
  totalAmount: 1249.9,
  totalAmountText: "₺1.249,90",
  subtotalText: "₺1.200,00",
  shippingCostText: "₺49,90",
  discountText: "₺0,00",
  paymentMethod: "Kredi Karti",
  createdAt: "2026-06-06T06:00:00.000Z",
  createdAtText: "6 Haziran 2026",
  itemCount: 2,
  isGuest: false,
  hasOpenReturn: false,
  shippingCarrier: "Aras Kargo",
  trackingNumber: "TRACK123",
};

const emptyReviews: ReviewOverview = {
  pending: [],
  reviewed: [],
};

describe("notifications logic", () => {
  it("prioritizes order updates and review prompts for authenticated users", () => {
    const feed = buildNotificationFeed({
      isAuthenticated: true,
      orderOverview: {
        total: 3,
        pending: 0,
        processing: 1,
        shipped: 1,
        delivered: 1,
      },
      recentOrders: [baseOrder],
      reviewOverview: {
        pending: [
          {
            productId: "product-1",
            orderId: "order-1",
            title: "Humata Leo",
            imageUrl: null,
            reviewId: "",
            rating: 0,
            commentTitle: "",
            commentBody: "",
            mediaUrls: [],
            status: "UNKNOWN",
            statusLabel: "Hazir",
            updatedAt: "",
            updatedAtText: "",
            hasReview: false,
          },
        ],
        reviewed: [],
      },
      returnRequests: [],
      offers: [],
      preferences: DEFAULT_COMMERCE_PREFERENCES_STATE,
    });

    expect(feed[0]?.route).toBe("/orders/order-1");
    expect(feed.some((item) => item.route === "/reviews")).toBe(true);
  });

  it("omits campaign alerts when that notification channel is closed", () => {
    const feed = buildNotificationFeed({
      isAuthenticated: false,
      orderOverview: {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
      },
      recentOrders: [],
      reviewOverview: emptyReviews,
      returnRequests: [],
      offers: [
        {
          id: "offer-1",
          title: "Haziran kuponu",
          couponCode: "JUNE10",
          discountPercentage: 10,
          minimumAmount: 500,
          productType: "all",
          productScope: "all_products",
          status: "active",
          scope: "public",
          assignedUserEmail: "",
          startTime: "",
          endTime: "",
        },
      ],
      preferences: {
        ...DEFAULT_COMMERCE_PREFERENCES_STATE,
        notifications: {
          ...DEFAULT_COMMERCE_PREFERENCES_STATE.notifications,
          campaignAlerts: false,
        },
      },
    });

    expect(feed.some((item) => item.route === "/roadmap")).toBe(false);
  });
});

import type { CouponOffer } from "@/modules/coupons/types";
import type { OrderOverview, OrderSummary } from "@/modules/orders/types";
import type { CommercePreferencesState } from "@/modules/preferences/types";
import type { ReviewOverview } from "@/modules/reviews/types";
import type { ReturnRequest } from "@/modules/returns/types";

export type NotificationTone = "primary" | "accent" | "info" | "neutral";

export type NotificationFeedItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  ctaLabel: string;
  priority: number;
  tone: NotificationTone;
  badge?: string;
};

export type BuildNotificationFeedInput = {
  isAuthenticated: boolean;
  orderOverview: OrderOverview;
  recentOrders: OrderSummary[];
  reviewOverview: ReviewOverview;
  returnRequests: ReturnRequest[];
  offers: CouponOffer[];
  preferences: CommercePreferencesState;
};

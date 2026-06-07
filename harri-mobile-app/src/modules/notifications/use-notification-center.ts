import { useMemo } from "react";

import { useSession } from "@/modules/auth/session-provider";
import { useCouponOffers } from "@/modules/coupons/use-coupon-offers";
import { buildNotificationFeed, countUnreadNotifications } from "@/modules/notifications/logic";
import { buildOrderOverview } from "@/modules/orders/helpers";
import { useOrderHistory } from "@/modules/orders/use-order-history";
import { usePreferences } from "@/modules/preferences/preferences-provider";
import { useReviewOverview } from "@/modules/reviews/use-review-overview";
import { useReturnRequests } from "@/modules/returns/use-return-requests";

export function useNotificationCenter() {
  const { isAuthenticated } = useSession();
  const { preferences } = usePreferences();
  const { data: orders } = useOrderHistory(isAuthenticated);
  const { data: reviewOverview } = useReviewOverview(isAuthenticated);
  const { data: returnRequests } = useReturnRequests(isAuthenticated);
  const { data: offers } = useCouponOffers();

  const orderOverview = useMemo(() => buildOrderOverview(orders), [orders]);
  const feed = useMemo(
    () =>
      buildNotificationFeed({
        isAuthenticated,
        orderOverview,
        recentOrders: orders,
        reviewOverview,
        returnRequests,
        offers,
        preferences,
      }),
    [isAuthenticated, offers, orderOverview, orders, preferences, returnRequests, reviewOverview]
  );
  const unreadCount = useMemo(() => countUnreadNotifications(feed), [feed]);
  const enabledCount = useMemo(
    () => Object.values(preferences.notifications).filter(Boolean).length,
    [preferences.notifications]
  );

  return {
    enabledCount,
    feed,
    inTransitCount: orderOverview.shipped + orderOverview.processing,
    isAuthenticated,
    pendingActionCount: reviewOverview.pending.length + returnRequests.length,
    unreadCount,
  };
}

import { toFilterSlug } from "@/modules/catalog/query";

import type { BuildNotificationFeedInput, NotificationFeedItem } from "@/modules/notifications/types";

export function countUnreadNotifications(items: NotificationFeedItem[]) {
  return items.reduce((total, item) => total + Math.max(0, item.unreadCount || 0), 0);
}

export function buildNotificationFeed({
  isAuthenticated,
  orderOverview,
  recentOrders,
  reviewOverview,
  returnRequests,
  offers,
  preferences,
}: BuildNotificationFeedInput): NotificationFeedItem[] {
  const items: NotificationFeedItem[] = [];
  const latestOrder = recentOrders[0];
  const activeReturn = returnRequests[0];
  const firstOffer = offers[0];
  const lastViewed = preferences.recentlyViewed[0];
  const latestSearch = preferences.recentSearches[0];

  if (isAuthenticated && preferences.notifications.orderUpdates && latestOrder) {
    items.push({
      id: `order-${latestOrder.id}`,
      title:
        latestOrder.status === "shipped"
          ? "Kargon yolda"
          : latestOrder.status === "processing"
            ? "Siparişin hazırlanıyor"
            : latestOrder.status === "pending"
              ? "Siparişin alındı"
              : "Sipariş özeti hazır",
      description: `${latestOrder.invoice} için son durum: ${latestOrder.statusText}.`,
      icon: latestOrder.status === "shipped" ? "truck" : "package",
      route: `/orders/${latestOrder.id}`,
      ctaLabel: "Siparişi aç",
      priority: latestOrder.status === "shipped" ? 100 : 90,
      tone: latestOrder.status === "shipped" ? "info" : "primary",
      badge: latestOrder.statusText,
      unreadCount: 1,
    });
  }

  if (isAuthenticated && reviewOverview.pending.length > 0) {
    items.push({
      id: "reviews-pending",
      title: "Değerlendirme bekleyen ürünler var",
      description: `${reviewOverview.pending.length} ürün teslim edildi. Değerlendirme ekleyip deneyimini paylaşabilirsin.`,
      icon: "star",
      route: "/reviews",
      ctaLabel: "Değerlendir",
      priority: 88,
      tone: "accent",
      badge: "Değerlendirme",
      unreadCount: reviewOverview.pending.length,
    });
  }

  if (isAuthenticated && activeReturn) {
    items.push({
      id: `return-${activeReturn.id}`,
      title: "İade süreci güncel",
      description: `${activeReturn.invoice} için ${activeReturn.statusLabel.toLowerCase()} durumu açık.`,
      icon: "rotate-ccw",
      route: "/returns",
      ctaLabel: "İadeyi gör",
      priority: 84,
      tone: "neutral",
      badge: activeReturn.statusLabel,
      unreadCount: 1,
    });
  }

  if (preferences.notifications.campaignAlerts && firstOffer) {
    items.push({
      id: `offer-${firstOffer.id}`,
      title: `${firstOffer.couponCode} kuponu hazır`,
      description: `${firstOffer.minimumAmount} TL ve üzeri siparişlerde %${firstOffer.discountPercentage} indirim var.`,
      icon: "tag",
      route: "/roadmap",
      ctaLabel: "Kuponları gör",
      priority: 72,
      tone: "accent",
      badge: `%${firstOffer.discountPercentage}`,
      unreadCount: 1,
    });
  }

  if (preferences.personalization.recentlyViewed && lastViewed) {
    const categoryLabel = lastViewed.parentCategory || lastViewed.category;
    items.push({
      id: `viewed-${lastViewed.id}`,
      title: "Son baktığın ürüne dön",
      description: `${lastViewed.title}${categoryLabel ? ` • ${categoryLabel}` : ""}`,
      icon: "clock",
      route: `/product/${lastViewed.id}`,
      ctaLabel: "Detayı aç",
      priority: 64,
      tone: "primary",
    });
  }

  if (preferences.personalization.recentSearches && latestSearch) {
    items.push({
      id: `search-${latestSearch}`,
      title: "Son aramanla devam et",
      description: `"${latestSearch}" araması için listeyi tekrar açabilirsin.`,
      icon: "search",
      route: `/catalog?query=${encodeURIComponent(latestSearch)}`,
      ctaLabel: "Aramayı aç",
      priority: 62,
      tone: "neutral",
    });
  }

  if (preferences.personalization.categoryRecommendations && lastViewed) {
    const categoryLabel = lastViewed.parentCategory || lastViewed.category;
    if (categoryLabel) {
      items.push({
        id: `category-${categoryLabel}`,
        title: "Benzer ürün önerisi",
        description: `${categoryLabel} kategorisinde keşfe devam et.`,
        icon: "grid",
        route: `/catalog?parent=${encodeURIComponent(toFilterSlug(categoryLabel))}`,
        ctaLabel: "Kategoriye git",
        priority: 58,
        tone: "info",
      });
    }
  }

  if (isAuthenticated && orderOverview.delivered > 0 && reviewOverview.pending.length === 0) {
    items.push({
      id: "delivered-orders",
      title: "Teslim edilen siparişlerini kontrol et",
      description: `${orderOverview.delivered} teslim edilen siparişin var. Tekrar sipariş, değerlendirme ve iade adımları hazır.`,
      icon: "check-circle",
      route: "/account",
      ctaLabel: "Hesabı aç",
      priority: 54,
      tone: "primary",
      unreadCount: 1,
    });
  }

  return items.sort((left, right) => right.priority - left.priority).slice(0, 6);
}

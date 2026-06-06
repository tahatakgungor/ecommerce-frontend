import { toFilterSlug } from "@/modules/catalog/query";

import type { BuildNotificationFeedInput, NotificationFeedItem } from "@/modules/notifications/types";

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
            ? "Siparisin hazirlaniyor"
            : latestOrder.status === "pending"
              ? "Siparisin alindi"
              : "Siparis ozeti hazir",
      description: `${latestOrder.invoice} icin son durum: ${latestOrder.statusText}.`,
      icon: latestOrder.status === "shipped" ? "truck" : "package",
      route: `/orders/${latestOrder.id}`,
      ctaLabel: "Siparisi ac",
      priority: latestOrder.status === "shipped" ? 100 : 90,
      tone: latestOrder.status === "shipped" ? "info" : "primary",
      badge: latestOrder.statusText,
    });
  }

  if (isAuthenticated && reviewOverview.pending.length > 0) {
    items.push({
      id: "reviews-pending",
      title: "Yorum bekleyen urunler var",
      description: `${reviewOverview.pending.length} urun teslim edildi. Yorum ekleyip guven tazeleyebilirsin.`,
      icon: "star",
      route: "/reviews",
      ctaLabel: "Yorum yaz",
      priority: 88,
      tone: "accent",
      badge: `${reviewOverview.pending.length} bekliyor`,
    });
  }

  if (isAuthenticated && activeReturn) {
    items.push({
      id: `return-${activeReturn.id}`,
      title: "Iade sureci guncel",
      description: `${activeReturn.invoice} icin ${activeReturn.statusLabel.toLowerCase()} durumu acik.`,
      icon: "rotate-ccw",
      route: "/returns",
      ctaLabel: "Iadeyi gor",
      priority: 84,
      tone: "neutral",
      badge: activeReturn.statusLabel,
    });
  }

  if (preferences.notifications.campaignAlerts && firstOffer) {
    items.push({
      id: `offer-${firstOffer.id}`,
      title: `${firstOffer.couponCode} kuponu hazir`,
      description: `${firstOffer.minimumAmount} TL ve uzeri siparislerde %${firstOffer.discountPercentage} indirim var.`,
      icon: "tag",
      route: "/roadmap",
      ctaLabel: "Kuponlari gor",
      priority: 72,
      tone: "accent",
      badge: `%${firstOffer.discountPercentage}`,
    });
  }

  if (preferences.personalization.recentlyViewed && lastViewed) {
    const categoryLabel = lastViewed.parentCategory || lastViewed.category;
    items.push({
      id: `viewed-${lastViewed.id}`,
      title: "Son baktigin urune don",
      description: `${lastViewed.title}${categoryLabel ? ` • ${categoryLabel}` : ""}`,
      icon: "clock",
      route: `/product/${lastViewed.id}`,
      ctaLabel: "Detayi ac",
      priority: 64,
      tone: "primary",
    });
  }

  if (preferences.personalization.recentSearches && latestSearch) {
    items.push({
      id: `search-${latestSearch}`,
      title: "Son aramanla devam et",
      description: `"${latestSearch}" aramasi icin listing'i tekrar acabilirsin.`,
      icon: "search",
      route: `/catalog?query=${encodeURIComponent(latestSearch)}`,
      ctaLabel: "Aramayi ac",
      priority: 62,
      tone: "neutral",
    });
  }

  if (preferences.personalization.categoryRecommendations && lastViewed) {
    const categoryLabel = lastViewed.parentCategory || lastViewed.category;
    if (categoryLabel) {
      items.push({
        id: `category-${categoryLabel}`,
        title: "Benzer urun onerisi",
        description: `${categoryLabel} kategorisinde kesfe devam et.`,
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
      title: "Teslim edilen siparislerini kontrol et",
      description: `${orderOverview.delivered} teslim edilen siparisin var. Tekrar siparis, yorum ve iade araclari hazir.`,
      icon: "check-circle",
      route: "/account",
      ctaLabel: "Hesabi ac",
      priority: 54,
      tone: "primary",
    });
  }

  return items.sort((left, right) => right.priority - left.priority).slice(0, 6);
}

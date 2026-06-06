import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { FilterChip } from "@/components/filter-chip";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";
import { buildNotificationFeed } from "@/modules/notifications/logic";
import { useSession } from "@/modules/auth/session-provider";
import { buildOrderOverview } from "@/modules/orders/helpers";
import { useOrderHistory } from "@/modules/orders/use-order-history";
import { usePreferences } from "@/modules/preferences/preferences-provider";
import { useReviewOverview } from "@/modules/reviews/use-review-overview";
import { useReturnRequests } from "@/modules/returns/use-return-requests";
import { useCouponOffers } from "@/modules/coupons/use-coupon-offers";

const toneMap = {
  primary: {
    backgroundColor: "#eef7f0",
    borderColor: "#cde8d4",
    textColor: activeTenant.palette.primary,
  },
  accent: {
    backgroundColor: "#fff5ea",
    borderColor: "#f3dcc3",
    textColor: activeTenant.palette.accent,
  },
  info: {
    backgroundColor: "#eef4fb",
    borderColor: "#c7dbf6",
    textColor: "#265ea8",
  },
  neutral: {
    backgroundColor: "#f6f7f8",
    borderColor: "#dde2e7",
    textColor: "#445164",
  },
} as const;

export default function NotificationsScreen() {
  const router = useRouter();
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
    [isAuthenticated, orderOverview, orders, offers, preferences, returnRequests, reviewOverview]
  );

  const enabledCount = Object.values(preferences.notifications).filter(Boolean).length;

  return (
    <ScreenShell>
      <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.primary }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Feather name="bell" size={14} color="#ffffff" />
            <ThemedText type="smallBold" style={styles.heroBadgeText}>
              Bildirim merkezi
            </ThemedText>
          </View>
          <View style={styles.heroPill}>
            <ThemedText type="smallBold" style={styles.heroPillText}>
              {feed.length} aktif kart
            </ThemedText>
          </View>
        </View>
        <ThemedText type="subtitle" style={styles.heroTitle}>
          Siparis ve kampanya bildirimlerini gor
        </ThemedText>
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <ThemedText type="smallBold" style={styles.metricValue}>
              {enabledCount}
            </ThemedText>
            <ThemedText type="small" style={styles.metricLabel}>
              acik kanal
            </ThemedText>
          </View>
          <View style={styles.metricCard}>
            <ThemedText type="smallBold" style={styles.metricValue}>
              {orderOverview.shipped + orderOverview.processing}
            </ThemedText>
            <ThemedText type="small" style={styles.metricLabel}>
              takipte siparis
            </ThemedText>
          </View>
          <View style={styles.metricCard}>
            <ThemedText type="smallBold" style={styles.metricValue}>
              {reviewOverview.pending.length + returnRequests.length}
            </ThemedText>
            <ThemedText type="small" style={styles.metricLabel}>
              aksiyon bekliyor
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.utilityCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.utilityHeader}>
          <View style={[styles.utilityIcon, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <Feather name="sliders" size={16} color={activeTenant.palette.primary} />
          </View>
          <View style={styles.utilityCopy}>
            <ThemedText type="smallBold">Bildirim tercihleri</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Hangi bildirimleri almak istedigini sec.
            </ThemedText>
          </View>
        </View>
        <View style={styles.utilityActions}>
          <FilterChip compact label="Tercihler" onPress={() => router.push("/preferences")} />
          <FilterChip compact label="Hesabim" onPress={() => router.push("/account")} />
        </View>
      </View>

      {feed.length ? (
        feed.map((item) => {
          const tone = toneMap[item.tone];
          return (
            <Pressable
              key={item.id}
              onPress={() => router.push(item.route as never)}
              style={({ pressed }) => [
                styles.feedCard,
                {
                  backgroundColor: activeTenant.palette.surface,
                  borderColor: activeTenant.palette.border,
                  opacity: pressed ? 0.94 : 1,
                },
              ]}
              testID={`notification-card-${item.id}`}
            >
              <View style={styles.feedTopRow}>
                <View style={[styles.feedIconWrap, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }]}>
                  <Feather name={item.icon as never} size={16} color={tone.textColor} />
                </View>
                <View style={styles.feedCopy}>
                  <ThemedText type="smallBold">{item.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.description}
                  </ThemedText>
                </View>
                {item.badge ? (
                  <View style={[styles.badgePill, { backgroundColor: tone.backgroundColor }]}>
                    <ThemedText type="smallBold" style={{ color: tone.textColor }}>
                      {item.badge}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
              <PrimaryButton label={item.ctaLabel} onPress={() => router.push(item.route as never)} variant="outline" />
            </Pressable>
          );
        })
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: "#f6f7f8" }]}>
            <Feather name="bell-off" size={18} color={activeTenant.palette.primary} />
          </View>
          <ThemedText type="smallBold">Simdilik yeni bildirim yok</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isAuthenticated
              ? "Yeni siparis veya kampanya oldugunda burada gorunur."
              : "Giris yaptiginda bildirimlerin burada gorunur."}
          </ThemedText>
          <View style={styles.utilityActions}>
            {!isAuthenticated ? <PrimaryButton label="Hesaba Gir" onPress={() => router.push("/account")} /> : null}
            <PrimaryButton label="Kataloga Don" onPress={() => router.push("/catalog")} variant="outline" />
          </View>
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 30,
    padding: 22,
    gap: 16,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroBadgeText: {
    color: "#ffffff",
  },
  heroPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(11,23,14,0.18)",
  },
  heroPillText: {
    color: "#d9f5de",
  },
  heroTitle: {
    color: "#ffffff",
  },
  metricRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    gap: 4,
  },
  metricValue: {
    color: "#ffffff",
  },
  metricLabel: {
    color: "#e6f7ea",
  },
  utilityCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
    ...commerceShadow("#102117", 8, 20, 0.05, 2),
  },
  utilityHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  utilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  utilityCopy: {
    flex: 1,
    gap: 4,
  },
  utilityActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  feedCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
    ...commerceShadow("#102117", 8, 20, 0.04, 2),
  },
  feedTopRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  feedIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  feedCopy: {
    flex: 1,
    gap: 4,
  },
  badgePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignSelf: "flex-start",
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});

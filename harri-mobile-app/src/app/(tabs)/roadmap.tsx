import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as ExpoLinking from "expo-linking";
import { Feather } from "@expo/vector-icons";

import { FilterChip } from "@/components/filter-chip";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { commerceShadow } from "@/constants/theme";
import { isPreviewLikeVariant } from "@/config/app-variant";
import { activeTenant } from "@/domain/active-tenant";
import { useCouponOffers } from "@/modules/coupons/use-coupon-offers";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";

export default function RoadmapScreen() {
  const router = useRouter();
  const canShowQaActions = isPreviewLikeVariant();
  const { data: offers, isLoading, error } = useCouponOffers();
  const { data: siteSettings } = useSiteSettings();

  return (
    <ScreenShell>
      <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.primary }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Feather name="gift" size={14} color="#ffffff" />
            <ThemedText type="smallBold" style={styles.heroBadgeText}>
              Fırsatlar
            </ThemedText>
          </View>
          <ThemedText type="smallBold" style={styles.heroMetaText}>
            {offers.length} kupon
          </ThemedText>
        </View>
        <ThemedText type="subtitle" style={styles.heroTitle}>
          Kuponları ve kargo avantajını kullan
        </ThemedText>
        <View style={styles.heroActionRow}>
          <FilterChip compact label="Katalog" onPress={() => router.push("/catalog")} />
          <FilterChip compact label="Sepet" onPress={() => router.push("/cart")} />
          <FilterChip compact label="Ödeme" onPress={() => router.push("/checkout")} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        <View style={[styles.statCard, { backgroundColor: "#f6fbf6", borderColor: "#cfe7d4" }]}>
          <Feather name="truck" size={18} color={activeTenant.palette.primary} />
          <ThemedText type="smallBold">{siteSettings.freeShippingThreshold} TL</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            ücretsiz kargo limiti
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <Feather name="percent" size={18} color={activeTenant.palette.primary} />
          <ThemedText type="smallBold">%{offers[0]?.discountPercentage || 0}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            en yüksek görünen indirim
          </ThemedText>
        </View>
      </ScrollView>

      <View style={[styles.shippingCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.shippingHeader}>
          <ThemedText type="smallBold">Kargo avantajı</ThemedText>
          <Feather name="truck" size={16} color={activeTenant.palette.primary} />
        </View>
        <ThemedText type="default" style={styles.shippingTitle}>
          {siteSettings.freeShippingThreshold} TL ve üzeri siparişlerde teslimat ücretsiz
        </ThemedText>
        <View style={styles.footerRow}>
          <FilterChip compact label="Ürünlere dön" onPress={() => router.push("/catalog")} />
          <FilterChip compact label="Sepete git" onPress={() => router.push("/cart")} />
        </View>
      </View>

      {isLoading ? <ThemedText type="small">Kuponlar yükleniyor...</ThemedText> : null}
      {error ? <ThemedText type="small">{error}</ThemedText> : null}

      {offers.map((offer) => (
        <View
          key={offer.id}
          style={[styles.offerCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
        >
          <View style={styles.offerHeaderRow}>
            <View style={[styles.offerCodePill, { backgroundColor: activeTenant.palette.primarySoft }]}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                {offer.couponCode}
              </ThemedText>
            </View>
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
              %{offer.discountPercentage}
            </ThemedText>
          </View>
          <ThemedText type="default" style={styles.offerTitle}>
            Min. {offer.minimumAmount} TL siparişte kullan
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Durum: {offer.status}
          </ThemedText>
          <View style={styles.footerRow}>
            <FilterChip compact label="Kasada kullan" onPress={() => router.push("/checkout")} />
            <FilterChip compact label="Uygun ürünler" onPress={() => router.push("/catalog?sort=price_desc")} />
          </View>
        </View>
      ))}

      {canShowQaActions ? (
        <View style={[styles.qaCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Önizleme QA</ThemedText>
          <PrimaryButton
            label="QA ödeme testi"
            onPress={() => {
              void ExpoLinking.openURL(ExpoLinking.createURL("/qa/checkout-smoke"));
            }}
            variant="outline"
          />
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 28,
    padding: 20,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  heroMetaText: {
    color: "#d8f5df",
  },
  heroTitle: {
    color: "#ffffff",
  },
  heroActionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  horizontalList: {
    gap: 12,
    paddingRight: 8,
  },
  statCard: {
    minWidth: 180,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 8,
    ...commerceShadow("#17324a", 10, 22, 0.05, 2),
  },
  shippingCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  shippingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  shippingTitle: {
    fontWeight: "700",
    lineHeight: 24,
  },
  offerCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  offerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  offerCodePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  offerTitle: {
    fontWeight: "700",
    lineHeight: 24,
  },
  footerRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  qaCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
});

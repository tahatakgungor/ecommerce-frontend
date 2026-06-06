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
  const campaignActions = [
    { label: "Kataloga git", route: "/catalog" },
    { label: "Checkout", route: "/checkout" },
    { label: "Hesabim", route: "/account" },
  ];
  const supportTiles = [
    { label: "Kupon kosullari", route: "/policy", icon: "file-text" },
    { label: "Blog onerileri", route: "/blog", icon: "book-open" },
    { label: "Destek hatti", route: "/support", icon: "life-buoy" },
  ];

  return (
    <ScreenShell>
      <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.primary }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Feather name="gift" size={14} color="#ffffff" />
            <ThemedText type="smallBold" style={styles.heroBadgeText}>
              Firsatlar
            </ThemedText>
          </View>
          <View style={styles.heroTrustRow}>
            <Feather name="tag" size={14} color="#d8f5df" />
            <ThemedText type="smallBold" style={styles.heroTrustText}>
              Anlik teklifler
            </ThemedText>
          </View>
        </View>
        <ThemedText type="subtitle" style={styles.heroTitle}>
          Kargo avantaji ve kuponlar tek sekmede
        </ThemedText>
        <ThemedText type="small" style={styles.heroDescription}>
          Kampanya yapisini musteri tarafinda daha okunur hale getiriyoruz: once kazanc, sonra kullanma kosulu gorunuyor.
        </ThemedText>
        <View style={styles.heroActionRow}>
          {campaignActions.map((item) => (
            <FilterChip key={item.label} compact label={item.label} onPress={() => router.push(item.route as never)} />
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        <View style={[styles.statCard, { backgroundColor: "#f6fbf6", borderColor: "#cfe7d4" }]}>
          <Feather name="truck" size={18} color={activeTenant.palette.primary} />
          <ThemedText type="smallBold">{siteSettings.freeShippingThreshold} TL</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            ucretsiz kargo limiti
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <Feather name="percent" size={18} color={activeTenant.palette.primary} />
          <ThemedText type="smallBold">{offers.length}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            aktif kupon gorunuyor
          </ThemedText>
        </View>
      </ScrollView>

      <View style={[styles.offerCard, styles.offerCardPrimary, { borderColor: "#cfe7d4" }]}>
        <View style={styles.offerHeaderRow}>
          <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
            Kargo avantaji
          </ThemedText>
          <Feather name="truck" size={16} color={activeTenant.palette.primary} />
        </View>
        <ThemedText type="default" style={styles.offerTitle}>
          {siteSettings.freeShippingThreshold} TL ve uzeri siparislerde teslimat ucretsiz
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Standart kargo ucreti {siteSettings.defaultShippingFee} TL olarak hesaplanir.
        </ThemedText>
        <View style={styles.offerFooterRow}>
          <View style={[styles.highlightPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
              Sepette otomatik gorunur
            </ThemedText>
          </View>
          <FilterChip compact label="Sepeti buyut" onPress={() => router.push("/catalog")} />
        </View>
      </View>

      {isLoading ? <ThemedText type="small">Kuponlar yukleniyor...</ThemedText> : null}
      {error ? <ThemedText type="small">{error}</ThemedText> : null}

      {offers.map((offer) => (
        <View
          key={offer.id}
          style={[styles.offerCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
        >
          <View style={styles.offerHeaderRow}>
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
              {offer.couponCode}
            </ThemedText>
            <View style={[styles.offerCodePill, { backgroundColor: activeTenant.palette.primarySoft }]}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                %{offer.discountPercentage}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="default" style={styles.offerTitle}>
            Sepette ekstra indirim
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Min. {offer.minimumAmount} TL sipariste kullan. Durum: {offer.status}
          </ThemedText>
          <View style={styles.offerFooterRow}>
            <View style={[styles.highlightPill, { backgroundColor: "#fff4e8" }]}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.accent }}>
                Kasada kullan
              </ThemedText>
            </View>
            <FilterChip compact label="Uygun urunler" onPress={() => router.push("/catalog?sort=price_desc")} />
          </View>
        </View>
      ))}

      <View style={styles.supportGrid}>
        {supportTiles.map((item) => (
          <View
            key={item.label}
            style={[styles.supportCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
          >
            <View style={[styles.supportIcon, { backgroundColor: item.label === "Blog onerileri" ? "#fff4e8" : activeTenant.palette.primarySoft }]}>
              <Feather
                name={item.icon as never}
                size={16}
                color={item.label === "Blog onerileri" ? activeTenant.palette.accent : activeTenant.palette.primary}
              />
            </View>
            <ThemedText type="smallBold">{item.label}</ThemedText>
            <PrimaryButton label="Ac" onPress={() => router.push(item.route as never)} variant="outline" />
          </View>
        ))}
      </View>

      {canShowQaActions ? (
        <View style={[styles.qaCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Preview QA</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Deep link callback smoke ve pending session senaryolari icin gizli QA ekranini acar.
          </ThemedText>
          <PrimaryButton
            label="QA Checkout Smoke"
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
  heroTrustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroTrustText: {
    color: "#d8f5df",
  },
  heroTitle: {
    color: "#ffffff",
  },
  heroDescription: {
    color: "#e6f7ea",
  },
  heroActionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  horizontalList: {
    gap: 12,
    paddingRight: 6,
  },
  statCard: {
    width: 170,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 6,
    ...commerceShadow("#102117", 10, 20, 0.05, 2),
  },
  offerCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 10,
    ...commerceShadow("#102117", 10, 20, 0.05, 2),
  },
  offerCardPrimary: {
    backgroundColor: "#f6fbf6",
  },
  offerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  offerCodePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  offerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  offerFooterRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  highlightPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  supportGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  supportCard: {
    width: "47.5%",
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    ...commerceShadow("#102117", 10, 20, 0.05, 2),
  },
  supportIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  qaCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
});

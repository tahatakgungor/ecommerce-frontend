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
    { label: "Katalog", route: "/catalog" },
    { label: "Ödeme", route: "/checkout" },
    { label: "Hesabım", route: "/account" },
  ];
  const supportTiles = [
    { label: "Kupon koşulları", route: "/policy", icon: "file-text" },
    { label: "Blog", route: "/blog", icon: "book-open" },
    { label: "Destek", route: "/support", icon: "life-buoy" },
  ];
  const highlightedOffers = offers.slice(0, 3);

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
          <View style={styles.heroTrustRow}>
            <Feather name="tag" size={14} color="#d8f5df" />
            <ThemedText type="smallBold" style={styles.heroTrustText}>
              Aktif kuponlar
            </ThemedText>
          </View>
        </View>
        <ThemedText type="subtitle" style={styles.heroTitle}>
          Kuponları ve kargo avantajını gör
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
            ücretsiz kargo limiti
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <Feather name="percent" size={18} color={activeTenant.palette.primary} />
          <ThemedText type="smallBold">{offers.length}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            aktif kupon görünüyor
          </ThemedText>
        </View>
      </ScrollView>

      <View style={[styles.offerCard, styles.offerCardPrimary, { borderColor: "#cfe7d4" }]}>
        <View style={styles.offerHeaderRow}>
          <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
            Kargo avantajı
          </ThemedText>
          <Feather name="truck" size={16} color={activeTenant.palette.primary} />
        </View>
        <ThemedText type="default" style={styles.offerTitle}>
          {siteSettings.freeShippingThreshold} TL ve üzeri siparişlerde teslimat ücretsiz
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Standart kargo ücreti {siteSettings.defaultShippingFee} TL.
        </ThemedText>
        <View style={styles.offerFooterRow}>
          <View style={[styles.highlightPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
              Sepette otomatik görünür
            </ThemedText>
          </View>
          <FilterChip compact label="Sepeti büyüt" onPress={() => router.push("/catalog")} />
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
            Min. {offer.minimumAmount} TL siparişte kullan. Durum: {offer.status}
          </ThemedText>
          <View style={styles.offerFooterRow}>
            <View style={[styles.highlightPill, { backgroundColor: "#fff4e8" }]}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.accent }}>
                Kasada kullan
              </ThemedText>
            </View>
            <FilterChip compact label="Uygun ürünler" onPress={() => router.push("/catalog?sort=price_desc")} />
          </View>
        </View>
      ))}

      <View style={[styles.walletCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.walletHeader}>
          <View style={[styles.walletIcon, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <Feather name="credit-card" size={16} color={activeTenant.palette.primary} />
          </View>
          <View style={styles.walletCopy}>
            <ThemedText type="smallBold">Kupon cüzdanı</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Aktif kuponları burada toplu gör.
            </ThemedText>
          </View>
        </View>
        <View style={styles.walletGrid}>
          {highlightedOffers.length ? (
            highlightedOffers.map((offer) => (
              <View key={`wallet-${offer.id}`} style={[styles.walletOfferCard, { backgroundColor: "#f9fbf8" }]}>
                <ThemedText type="smallBold">{offer.couponCode}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  %{offer.discountPercentage} • min {offer.minimumAmount} TL
                </ThemedText>
              </View>
            ))
          ) : (
            <View style={[styles.walletOfferCard, { backgroundColor: "#f9fbf8" }]}>
              <ThemedText type="smallBold">Yeni teklif bekleniyor</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Aktif kupon geldiğinde burada görünecek.
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.offerFooterRow}>
          <FilterChip compact label="Ödemeye git" onPress={() => router.push("/checkout")} />
          <FilterChip compact label="Bildirimler" onPress={() => router.push("/notifications" as never)} />
          <FilterChip compact label="Sepet" onPress={() => router.push("/cart")} />
        </View>
      </View>

      <View style={[styles.walletCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.walletHeader}>
          <View style={[styles.walletIcon, { backgroundColor: "#fff4e8" }]}>
            <Feather name="compass" size={16} color={activeTenant.palette.accent} />
          </View>
          <View style={styles.walletCopy}>
            <ThemedText type="smallBold">Hızlı geçiş</ThemedText>
          </View>
        </View>
        <View style={styles.offerFooterRow}>
          <FilterChip compact label="Katalog" onPress={() => router.push("/catalog")} />
          <FilterChip compact label="Hesabım" onPress={() => router.push("/account")} />
          <FilterChip compact label="Destek" onPress={() => router.push("/support")} />
        </View>
      </View>

      <View style={styles.supportGrid}>
        {supportTiles.map((item) => (
          <View
            key={item.label}
            style={[styles.supportCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
          >
            <View style={[styles.supportIcon, { backgroundColor: item.label === "Blog" ? "#fff4e8" : activeTenant.palette.primarySoft }]}>
              <Feather
                name={item.icon as never}
                size={16}
                color={item.label === "Blog" ? activeTenant.palette.accent : activeTenant.palette.primary}
              />
            </View>
            <ThemedText type="smallBold">{item.label}</ThemedText>
            <PrimaryButton label="Aç" onPress={() => router.push(item.route as never)} variant="outline" />
          </View>
        ))}
      </View>

      {canShowQaActions ? (
        <View style={[styles.qaCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Önizleme QA</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Deep link callback ve bekleyen oturum senaryoları için gizli test ekranını açar.
          </ThemedText>
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
  walletCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
    ...commerceShadow("#102117", 10, 20, 0.05, 2),
  },
  walletHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  walletCopy: {
    flex: 1,
    gap: 4,
  },
  walletGrid: {
    gap: 10,
  },
  walletOfferCard: {
    borderRadius: 18,
    padding: 14,
    gap: 4,
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

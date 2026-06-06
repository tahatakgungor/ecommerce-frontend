import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";

import { BrandLockup } from "@/components/brand-lockup";
import { CommerceSearchBar } from "@/components/commerce-search-bar";
import { FilterChip } from "@/components/filter-chip";
import { ProductCard } from "@/components/product-card";
import { ScreenShell } from "@/components/screen-shell";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { commerceShadow } from "@/constants/theme";
import { hasApiBaseUrl } from "@/config/runtime";
import { activeTenant } from "@/domain/active-tenant";
import { useCart } from "@/modules/cart/cart-provider";
import { useCatalogSnapshot } from "@/modules/catalog/use-catalog-snapshot";
import type { CatalogProduct } from "@/modules/catalog/types";
import { useCategories } from "@/modules/categories/use-categories";
import { useCouponOffers } from "@/modules/coupons/use-coupon-offers";
import { usePreferences } from "@/modules/preferences/preferences-provider";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ homeReset?: string | string[] }>();
  const [searchText, setSearchText] = useState("");
  const { itemCount } = useCart();
  const { recordSearch, buildRail } = usePreferences();
  const { data, isLoading, error } = useCatalogSnapshot({ page: 1, size: 12, includeFacets: true });
  const { data: categories } = useCategories();
  const { data: offers } = useCouponOffers();
  const { data: siteSettings } = useSiteSettings();

  const featuredProducts = data?.products.slice(0, 6) || [];
  const discountedProducts = (data?.products || []).filter((product) => product.discount > 0).slice(0, 6);
  const quickCategories = categories.slice(0, 8);
  const curatedProducts = useMemo(() => buildRail(data?.products || []), [buildRail, data?.products]);
  const searchQuery = searchText.trim().toLocaleLowerCase("tr-TR");
  const liveSearchProducts = useMemo(() => {
    if (searchQuery.length < 2) {
      return [];
    }

    return (data?.products || [])
      .filter((product) => {
        const haystacks = [product.title, product.brand, product.parentCategory, product.category]
          .filter(Boolean)
          .map((value) => String(value).toLocaleLowerCase("tr-TR"));

        return haystacks.some((value) => value.includes(searchQuery));
      })
      .slice(0, 6);
  }, [data?.products, searchQuery]);

  const isSearchMode = searchQuery.length >= 2;
  const topProducts = isSearchMode ? liveSearchProducts : curatedProducts.length ? curatedProducts : featuredProducts;
  const visibleHomeProducts = topProducts.slice(0, 4);
  const notificationCount = Math.min(offers.length, 9);

  const handleSearchSubmit = () => {
    const trimmed = searchText.trim();
    if (trimmed) {
      recordSearch(trimmed);
    }
    router.push(trimmed ? `/catalog?query=${encodeURIComponent(trimmed)}` : "/catalog");
  };

  const homeResetKey = Array.isArray(params.homeReset) ? params.homeReset[0] : params.homeReset;

  return (
    <ScreenShell resetScrollKey={homeResetKey || "home-initial"}>
      <View style={styles.topBar}>
        <BrandLockup />
        <View style={styles.utilityRail}>
          <Pressable
            onPress={() => router.push("/notifications" as never)}
            style={({ pressed }) => [
              styles.utilityButton,
              { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <Feather name="bell" size={18} color={activeTenant.palette.primary} />
            <ThemedText type="smallBold">Bildirim</ThemedText>
            {notificationCount ? (
              <View style={[styles.utilityBadge, { backgroundColor: activeTenant.palette.accent }]}>
                <ThemedText type="smallBold" style={styles.utilityBadgeText}>
                  {notificationCount}
                </ThemedText>
              </View>
            ) : null}
          </Pressable>
          <Pressable
            onPress={() => router.push("/cart")}
            style={({ pressed }) => [
              styles.utilityButton,
              { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <Feather name="shopping-bag" size={18} color={activeTenant.palette.primary} />
            <ThemedText type="smallBold">Sepet</ThemedText>
            {itemCount > 0 ? (
              <View style={[styles.utilityBadge, { backgroundColor: activeTenant.palette.primary }]}>
                <ThemedText type="smallBold" style={styles.utilityBadgeText}>
                  {itemCount}
                </ThemedText>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <CommerceSearchBar
        value={searchText}
        onChangeText={setSearchText}
        onSubmit={handleSearchSubmit}
        testID="home-search-input"
      />

      <View style={styles.section}>
        <SectionHeader
          title={isSearchMode ? "Arama sonuçları" : "Ürünler"}
          actionLabel="Kataloğa git"
          onPressAction={() =>
            router.push(
              isSearchMode && searchText.trim()
                ? (`/catalog?query=${encodeURIComponent(searchText.trim())}` as never)
                : "/catalog"
            )
          }
        />
        {!hasApiBaseUrl() && !isSearchMode ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.noticeHeader}>
              <Feather name="wifi-off" size={16} color="#8b5e17" />
              <ThemedText type="smallBold">Canlı katalog bağlantısı kapalı</ThemedText>
            </View>
          </View>
        ) : null}
        {isLoading && hasApiBaseUrl() && !isSearchMode ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="small">Katalog yükleniyor...</ThemedText>
          </View>
        ) : null}
        {error && !isSearchMode ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Bağlantı durumu</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {error}
            </ThemedText>
          </View>
        ) : null}
        {isSearchMode && !liveSearchProducts.length ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Sonuç bulunamadı</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Daha kısa bir kelime dene ya da tüm katalogda ara.
            </ThemedText>
          </View>
        ) : null}
        {visibleHomeProducts.length ? (
          <View style={styles.productGrid}>
            {visibleHomeProducts.map((product: CatalogProduct) => (
              <View key={`home-top-${product.id}`} style={styles.productGridItem}>
                <ProductCard product={product} />
              </View>
            ))}
          </View>
        ) : null}
        {!isLoading && !error && !visibleHomeProducts.length ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Ürünler hazırlanıyor</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Tüm ürünleri katalogdan açabilirsin.
            </ThemedText>
          </View>
        ) : null}
      </View>

      {!isSearchMode && quickCategories.length ? (
        <View style={styles.section}>
          <SectionHeader title="Kategoriler" actionLabel="Tüm katalog" onPressAction={() => router.push("/catalog")} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {quickCategories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => router.push(`/catalog?parent=${encodeURIComponent(category.slug)}`)}
                style={({ pressed }) => [
                  styles.categoryTile,
                  {
                    backgroundColor: activeTenant.palette.surface,
                    borderColor: activeTenant.palette.border,
                    opacity: pressed ? 0.94 : 1,
                  },
                ]}
              >
                <View style={[styles.categoryIconBubble, { backgroundColor: activeTenant.palette.primarySoft }]}>
                  <Feather name="box" size={16} color={activeTenant.palette.primary} />
                </View>
                <ThemedText type="smallBold" numberOfLines={2} style={styles.categoryLabel}>
                  {category.label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {!isSearchMode ? (
        <View style={styles.section}>
          <SectionHeader title="Fırsatlar" actionLabel="Tümünü gör" onPressAction={() => router.push("/roadmap")} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            <View style={[styles.offerCard, { backgroundColor: activeTenant.palette.primary }]}>
              <View style={styles.offerTopRow}>
                <View style={styles.offerBadge}>
                  <Feather name="truck" size={14} color="#ffffff" />
                  <ThemedText type="smallBold" style={styles.offerBadgeText}>
                    Kargo
                  </ThemedText>
                </View>
                <ThemedText type="smallBold" style={styles.offerMetaText}>
                  {siteSettings.freeShippingThreshold} TL
                </ThemedText>
              </View>
              <ThemedText type="default" style={styles.offerTitle}>
                Ücretsiz kargo limitine uygun ürünleri gör
              </ThemedText>
              <View style={styles.offerActions}>
                <FilterChip compact label="Ürünleri aç" onPress={() => router.push("/catalog")} />
                <FilterChip compact label="Sepet" onPress={() => router.push("/cart")} />
              </View>
            </View>
            {offers.slice(0, 2).map((offer) => (
              <View
                key={offer.id}
                style={[styles.offerCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
              >
                <View style={styles.offerTopRow}>
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
                  Sepette kullanabileceğin kupon
                </ThemedText>
                <View style={styles.offerActions}>
                  <FilterChip compact label="Kasada kullan" onPress={() => router.push("/checkout")} />
                  <FilterChip compact label="Uygun ürünler" onPress={() => router.push("/catalog?sort=price_desc")} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {!isSearchMode && discountedProducts.length ? (
        <View style={styles.section}>
          <SectionHeader title="İndirimli ürünler" actionLabel="Katalog" onPressAction={() => router.push("/catalog?sort=price_desc")} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {discountedProducts.map((product: CatalogProduct) => (
              <ProductCard key={`discount-${product.id}`} product={product} variant="rail" />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  utilityRail: {
    flexDirection: "row",
    gap: 10,
  },
  utilityButton: {
    minHeight: 46,
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    gap: 6,
    ...commerceShadow("#102117", 8, 20, 0.08, 2),
  },
  utilityBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: -5,
    right: -5,
  },
  utilityBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    lineHeight: 12,
  },
  section: {
    gap: 14,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  productGridItem: {
    width: "47.8%",
  },
  horizontalList: {
    gap: 12,
    paddingRight: 8,
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryTile: {
    width: 138,
    minHeight: 118,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    gap: 16,
    justifyContent: "space-between",
    ...commerceShadow("#17324a", 8, 18, 0.05, 2),
  },
  categoryIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    lineHeight: 20,
  },
  offerCard: {
    width: 266,
    minHeight: 176,
    borderRadius: 28,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    ...commerceShadow("#17324a", 10, 24, 0.05, 2),
  },
  offerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  offerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  offerBadgeText: {
    color: "#ffffff",
  },
  offerMetaText: {
    color: "#d8f5df",
  },
  offerTitle: {
    fontWeight: "700",
    lineHeight: 24,
    color: activeTenant.palette.text,
  },
  offerActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: "auto",
  },
  offerCodePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
});

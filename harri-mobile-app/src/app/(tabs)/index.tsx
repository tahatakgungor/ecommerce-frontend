import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

import { CommerceSearchBar } from "@/components/commerce-search-bar";
import { FilterChip } from "@/components/filter-chip";
import { ProductCard } from "@/components/product-card";
import { ScreenShell } from "@/components/screen-shell";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { hasApiBaseUrl } from "@/config/runtime";
import { useCart } from "@/modules/cart/cart-provider";
import { useCatalogSnapshot } from "@/modules/catalog/use-catalog-snapshot";
import { useCategories } from "@/modules/categories/use-categories";
import { useCouponOffers } from "@/modules/coupons/use-coupon-offers";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";
import type { CatalogProduct } from "@/modules/catalog/types";

export default function HomeScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const { itemCount } = useCart();
  const { data, isLoading, error } = useCatalogSnapshot({ page: 1, size: 12, includeFacets: true });
  const { data: categories } = useCategories();
  const { data: offers } = useCouponOffers();
  const { data: siteSettings } = useSiteSettings();

  const featuredProducts = data?.products.slice(0, 6) || [];
  const discountedProducts = (data?.products || []).filter((product) => product.discount > 0).slice(0, 6);
  const quickCategories = categories.slice(0, 8);

  const handleSearchSubmit = () => {
    const trimmed = searchText.trim();
    router.push(trimmed ? `/catalog?query=${encodeURIComponent(trimmed)}` : "/catalog");
  };

  return (
    <ScreenShell>
      <View style={styles.topBar}>
        <View style={styles.topBarCopy}>
          <ThemedText type="smallBold" style={[styles.eyebrow, { color: activeTenant.palette.accent }]}>
            {activeTenant.brandName}
          </ThemedText>
          <ThemedText type="default" style={styles.greeting}>
            Mobil magaza ana ekrani
          </ThemedText>
        </View>
        <View style={[styles.cartBubble, { backgroundColor: activeTenant.palette.primarySoft }]}>
          <ThemedText type="smallBold">{itemCount > 0 ? `${itemCount} urun` : "Sepet"}</ThemedText>
        </View>
      </View>

      <CommerceSearchBar
        value={searchText}
        onChangeText={setSearchText}
        onSubmit={handleSearchSubmit}
        testID="home-search-input"
      />

      <View style={[styles.hero, { backgroundColor: activeTenant.palette.primary }]}>
        <View style={styles.heroHeader}>
          <ThemedText type="smallBold" style={styles.heroEyebrow}>
            Ayni gun kesif akisi
          </ThemedText>
          <ThemedText type="subtitle" style={styles.heroTitle}>
            Kampanya, kategori ve urunler tek ekranda
          </ThemedText>
          <ThemedText type="small" style={styles.heroDescription}>
            Hepsiburada ve Trendyol benzeri mobil ticaret kurgusunda arama, hizli kategori secimi ve firsat urunleri ilk bakista gorunur.
          </ThemedText>
        </View>
        <View style={styles.heroMetrics}>
          <View style={[styles.metricCard, { backgroundColor: "rgba(255,255,255,0.14)" }]}>
            <ThemedText type="smallBold" style={styles.metricValue}>
              {data?.total || 0}+
            </ThemedText>
            <ThemedText type="small" style={styles.metricLabel}>
              listelenen urun
            </ThemedText>
          </View>
          <View style={[styles.metricCard, { backgroundColor: "rgba(255,255,255,0.14)" }]}>
            <ThemedText type="smallBold" style={styles.metricValue}>
              {siteSettings.freeShippingThreshold} TL
            </ThemedText>
            <ThemedText type="small" style={styles.metricLabel}>
              ucretsiz kargo limiti
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Hizli kategoriler" actionLabel="Tum katalog" onPressAction={() => router.push("/catalog")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {quickCategories.map((category) => (
            <View
              key={category.id}
              style={[styles.categoryTile, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
            >
              <ThemedText type="smallBold" numberOfLines={2}>
                {category.label}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {category.children.slice(0, 2).map((child) => child.label).join(" / ") || "Tum urunler"}
              </ThemedText>
              <FilterChip
                compact
                label="Incele"
                onPress={() => router.push(`/catalog?parent=${encodeURIComponent(category.slug)}`)}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Kampanyalar" actionLabel="Firsatlar" onPressAction={() => router.push("/roadmap")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          <View style={[styles.offerCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Ucretsiz kargo</ThemedText>
            <ThemedText type="default" style={styles.offerHeadline}>
              {siteSettings.freeShippingThreshold} TL ve uzeri siparislerde kargo bedava
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Varsayilan kargo ucreti {siteSettings.defaultShippingFee} TL.
            </ThemedText>
          </View>
          {offers.slice(0, 4).map((offer) => (
            <View
              key={offer.id}
              style={[styles.offerCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
            >
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                {offer.couponCode}
              </ThemedText>
              <ThemedText type="default" style={styles.offerHeadline}>
                %{offer.discountPercentage} indirim
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {offer.minimumAmount} TL ve uzeri siparislerde kullan.
              </ThemedText>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Sizin icin sectiklerimiz" actionLabel="Tumunu gor" onPressAction={() => router.push("/catalog")} />
        {!hasApiBaseUrl() && (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">EXPO_PUBLIC_API_BASE_URL gerekli</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              `.env` olusturup API taban URL'sini tanimladiginda mobil uygulama ayni katalog backend'ini kullanacak.
            </ThemedText>
          </View>
        )}
        {isLoading && hasApiBaseUrl() ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="small">Katalog yukleniyor...</ThemedText>
          </View>
        ) : null}
        {error ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Baglanti durumu</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {error}
            </ThemedText>
          </View>
        ) : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {featuredProducts.map((product: CatalogProduct) => (
            <ProductCard key={product.id} product={product} variant="rail" />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Indirimli urunler" actionLabel="Katalog" onPressAction={() => router.push("/catalog?sort=price_desc")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {(discountedProducts.length ? discountedProducts : featuredProducts).map((product: CatalogProduct) => (
            <ProductCard key={`discount-${product.id}`} product={product} variant="rail" />
          ))}
        </ScrollView>
      </View>
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
  topBarCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  greeting: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 800,
  },
  cartBubble: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hero: {
    borderRadius: 30,
    padding: 24,
    gap: 18,
  },
  heroHeader: {
    gap: 10,
  },
  heroEyebrow: {
    color: "#d7f2df",
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  heroTitle: {
    lineHeight: 38,
    color: "#ffffff",
    fontWeight: 800,
  },
  heroDescription: {
    lineHeight: 22,
    color: "rgba(255,255,255,0.84)",
  },
  heroMetrics: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    gap: 4,
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 18,
  },
  metricLabel: {
    color: "rgba(255,255,255,0.8)",
  },
  section: {
    gap: 12,
  },
  horizontalList: {
    gap: 12,
    paddingRight: 6,
  },
  categoryTile: {
    width: 168,
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 10,
    justifyContent: "space-between",
  },
  offerCard: {
    width: 232,
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 10,
  },
  offerHeadline: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 800,
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
});

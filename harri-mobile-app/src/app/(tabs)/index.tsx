import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
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
import { activeTenant } from "@/domain/active-tenant";
import { hasApiBaseUrl } from "@/config/runtime";
import { toFilterSlug } from "@/modules/catalog/query";
import { useCart } from "@/modules/cart/cart-provider";
import { useCatalogSnapshot } from "@/modules/catalog/use-catalog-snapshot";
import { useCategories } from "@/modules/categories/use-categories";
import { useCouponOffers } from "@/modules/coupons/use-coupon-offers";
import { usePreferences } from "@/modules/preferences/preferences-provider";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";
import type { CatalogProduct } from "@/modules/catalog/types";

export default function HomeScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const { itemCount } = useCart();
  const { preferences, recordSearch, buildRail } = usePreferences();
  const { data, isLoading, error } = useCatalogSnapshot({ page: 1, size: 12, includeFacets: true });
  const { data: categories } = useCategories();
  const { data: offers } = useCouponOffers();
  const { data: siteSettings } = useSiteSettings();

  const featuredProducts = data?.products.slice(0, 6) || [];
  const discountedProducts = (data?.products || []).filter((product) => product.discount > 0).slice(0, 6);
  const quickCategories = categories.slice(0, 8);
  const personalizedProducts = useMemo(() => buildRail(data?.products || []), [buildRail, data?.products]);
  const recentlyViewed = preferences.personalization.recentlyViewed ? preferences.recentlyViewed.slice(0, 6) : [];
  const lastViewedProduct = recentlyViewed[0];
  const latestSearch = preferences.recentSearches[0];
  const recentCategory = lastViewedProduct?.parentCategory || lastViewedProduct?.category || "";
  const recentBrand = lastViewedProduct?.brand || "";
  const categoryTones = ["#f4efe7", "#eaf3ea", "#eef2f8", "#f7efe4"];
  const quickActions = [
    { label: "Bildirimler", icon: "bell", route: "/notifications", tone: "#eef2f8" },
    { label: "Kampanyalar", icon: "tag", route: "/roadmap", tone: "#fff6ed" },
    { label: "Favorilerim", icon: "heart", route: "/wishlist", tone: "#f8f2ec" },
    { label: "Blog", icon: "book-open", route: "/blog", tone: "#eef4ee" },
    { label: "Destek", icon: "life-buoy", route: "/support", tone: "#edf6f0" },
  ];
  const serviceLinks = [
    { label: "Siparis Takibi", icon: "truck", route: "/account" },
    { label: "Iade Merkezi", icon: "rotate-ccw", route: "/returns" },
    { label: "Blog", icon: "book", route: "/blog" },
    { label: "Profil", icon: "user", route: "/account" },
  ];

  const handleSearchSubmit = () => {
    const trimmed = searchText.trim();
    if (trimmed) {
      recordSearch(trimmed);
    }
    router.push(trimmed ? `/catalog?query=${encodeURIComponent(trimmed)}` : "/catalog");
  };

  return (
    <ScreenShell>
      <View style={styles.topBar}>
        <View style={styles.topBarCopy}>
          <BrandLockup subtitle={activeTenant.industry} />
          <ThemedText type="default" style={styles.greeting}>
            Mobil magazada kesif, kampanya ve siparis yonetimi ayni duzende
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {activeTenant.tagline}
          </ThemedText>
        </View>
        <View style={styles.utilityRail}>
          <Pressable
            onPress={() => router.push("/notifications" as never)}
            style={({ pressed }) => [
              styles.utilityBubble,
              { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <Feather name="bell" size={18} color={activeTenant.palette.primary} />
            <ThemedText type="smallBold">{offers.length ? `${Math.min(offers.length, 9)}+` : "0"}</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => router.push("/cart")}
            style={({ pressed }) => [
              styles.utilityBubble,
              { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <Feather name="shopping-bag" size={18} color={activeTenant.palette.primary} />
            <ThemedText type="smallBold">{itemCount > 0 ? `${itemCount}` : "0"}</ThemedText>
          </Pressable>
        </View>
      </View>

      <CommerceSearchBar
        value={searchText}
        onChangeText={setSearchText}
        onSubmit={handleSearchSubmit}
        testID="home-search-input"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionList}>
        {quickActions.map((action) => (
          <View
            key={action.label}
            style={[
              styles.quickActionCard,
              { backgroundColor: action.tone, borderColor: activeTenant.palette.border },
            ]}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: activeTenant.palette.surface }]}>
              <Feather name={action.icon as never} size={16} color={activeTenant.palette.primary} />
            </View>
            <View style={styles.quickActionCopy}>
              <ThemedText type="smallBold">{action.label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Hemen ac
              </ThemedText>
            </View>
            <FilterChip compact label="Git" onPress={() => router.push(action.route as never)} />
          </View>
        ))}
      </ScrollView>

      <View style={[styles.hero, { backgroundColor: activeTenant.palette.primary }]}>
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />
        <View style={styles.heroHeader}>
          <View style={styles.heroEyebrowRow}>
            <View style={styles.heroEyebrowPill}>
              <ThemedText type="smallBold" style={styles.heroEyebrow}>
                Marketplace duzeni
              </ThemedText>
            </View>
            <View style={styles.heroTrustPill}>
              <Feather name="shield" size={14} color="#d9f5de" />
              <ThemedText type="smallBold" style={styles.heroTrustText}>
                Guvenli odeme
              </ThemedText>
            </View>
          </View>
          <ThemedText type="subtitle" style={styles.heroTitle}>
            Kategori, kampanya, servisler ve tekrar alisveris tek akista
          </ThemedText>
          <ThemedText type="small" style={styles.heroDescription}>
            Hepsiburada benzeri mobil ticaret mantigini; daha net section ayrimi, daha guclu basliklar ve daha okunur kartlarla tenant yapina uyarladim.
          </ThemedText>
        </View>
        <View style={styles.heroMetrics}>
          <View style={[styles.metricCard, { backgroundColor: "rgba(255,255,255,0.14)" }]}>
            <Feather name="layers" size={18} color="#ffffff" />
            <ThemedText type="smallBold" style={styles.metricValue}>
              {data?.total || 0}+
            </ThemedText>
            <ThemedText type="small" style={styles.metricLabel}>
              urun vitrinde
            </ThemedText>
          </View>
          <View style={[styles.metricCard, { backgroundColor: "rgba(255,255,255,0.14)" }]}>
            <Feather name="truck" size={18} color="#ffffff" />
            <ThemedText type="smallBold" style={styles.metricValue}>
              {siteSettings.freeShippingThreshold} TL
            </ThemedText>
            <ThemedText type="small" style={styles.metricLabel}>
              kargo limiti
            </ThemedText>
          </View>
          <View style={[styles.metricCard, { backgroundColor: "rgba(255,255,255,0.14)" }]}>
            <Feather name="repeat" size={18} color="#ffffff" />
            <ThemedText type="smallBold" style={styles.metricValue}>
              7/24
            </ThemedText>
            <ThemedText type="small" style={styles.metricLabel}>
              siparis takibi
            </ThemedText>
          </View>
        </View>
        <View style={styles.heroActionRow}>
          <FilterChip label="Tum kategoriler" active onPress={() => router.push("/catalog")} />
          <FilterChip label="Kuponlar" onPress={() => router.push("/roadmap")} />
          <FilterChip label="Bildirimler" onPress={() => router.push("/notifications" as never)} />
          <FilterChip label="Hesabim" onPress={() => router.push("/account")} />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Hizli servisler" actionLabel="Hesabim" onPressAction={() => router.push("/account")} />
        <View style={styles.serviceGrid}>
          {serviceLinks.map((item) => (
            <View
              key={item.label}
              style={[styles.serviceCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
            >
              <View style={[styles.serviceIcon, { backgroundColor: item.label === "Blog" ? "#fff4e8" : activeTenant.palette.primarySoft }]}>
                <Feather
                  name={item.icon as never}
                  size={17}
                  color={item.label === "Blog" ? activeTenant.palette.accent : activeTenant.palette.primary}
                />
              </View>
              <ThemedText type="smallBold">{item.label}</ThemedText>
              <FilterChip compact label="Ac" onPress={() => router.push(item.route as never)} />
            </View>
          ))}
        </View>
      </View>

      {latestSearch || lastViewedProduct ? (
        <View style={styles.section}>
          <SectionHeader
            title="Kaldigin yerden devam et"
            actionLabel={lastViewedProduct ? "Urunu ac" : "Kataloga git"}
            onPressAction={() =>
              router.push(
                lastViewedProduct
                  ? (`/product/${lastViewedProduct.id}` as never)
                  : latestSearch
                    ? (`/catalog?query=${encodeURIComponent(latestSearch)}` as never)
                    : "/catalog"
              )
            }
          />
          <View style={[styles.journeyCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.journeyHeader}>
              <View style={[styles.journeyIcon, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <Feather name="compass" size={18} color={activeTenant.palette.primary} />
              </View>
              <View style={styles.journeyCopy}>
                <ThemedText type="smallBold">
                  {lastViewedProduct ? `${lastViewedProduct.title} ve benzerleri seni bekliyor` : "Son aramanla hizli devam et"}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {lastViewedProduct
                    ? `${recentCategory || "Ilgili kategori"} icinde tekrar arama yapmadan devam edebilirsin.`
                    : "Tekrar arama yazmadan son baktigin ihtiyaca dogrudan donebilirsin."}
                </ThemedText>
              </View>
            </View>
            <View style={styles.journeyActions}>
              {latestSearch ? (
                <FilterChip compact label={`Ara: ${latestSearch}`} onPress={() => router.push(`/catalog?query=${encodeURIComponent(latestSearch)}`)} />
              ) : null}
              {recentCategory ? (
                <FilterChip
                  compact
                  label={recentCategory}
                  onPress={() => router.push(`/catalog?parent=${encodeURIComponent(toFilterSlug(recentCategory))}`)}
                />
              ) : null}
              {recentBrand ? (
                <FilterChip
                  compact
                  label={recentBrand}
                  onPress={() => router.push(`/catalog?brand=${encodeURIComponent(toFilterSlug(recentBrand))}`)}
                />
              ) : null}
              {lastViewedProduct ? (
                <FilterChip compact label="Urun detayina don" active onPress={() => router.push(`/product/${lastViewedProduct.id}`)} />
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      {preferences.personalization.recentSearches && preferences.recentSearches.length ? (
        <View style={styles.section}>
          <SectionHeader title="Son aradiklarin" actionLabel="Katalog" onPressAction={() => router.push("/catalog")} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {preferences.recentSearches.map((item) => (
              <FilterChip key={item} compact label={item} onPress={() => router.push(`/catalog?query=${encodeURIComponent(item)}`)} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Hemen basla" actionLabel="Tum katalog" onPressAction={() => router.push("/catalog")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {quickCategories.map((category, index) => (
            <View
              key={category.id}
              style={[
                styles.categoryTile,
                { backgroundColor: categoryTones[index % categoryTones.length], borderColor: activeTenant.palette.border },
              ]}
            >
              <View style={styles.categoryTop}>
                <View style={[styles.categoryIconBubble, { backgroundColor: activeTenant.palette.surface }]}>
                  <Feather name="box" size={16} color={activeTenant.palette.primary} />
                </View>
                <ThemedText type="smallBold" numberOfLines={2}>
                  {category.label}
                </ThemedText>
              </View>
              <View style={styles.categoryBottom}>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                  {category.children.slice(0, 2).map((child) => child.label).join(" • ") || "Tum urunler"}
                </ThemedText>
                <FilterChip compact label="Incele" onPress={() => router.push(`/catalog?parent=${encodeURIComponent(category.slug)}`)} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Kampanyalar" actionLabel="Firsatlar" onPressAction={() => router.push("/roadmap")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          <View style={[styles.offerCard, styles.offerCardPrimary, { borderColor: "#cfe7d4" }]}>
            <View style={styles.offerHeaderRow}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                Ucretsiz kargo
              </ThemedText>
              <Feather name="truck" size={16} color={activeTenant.palette.primary} />
            </View>
            <ThemedText type="default" style={styles.offerHeadline}>
              {siteSettings.freeShippingThreshold} TL ve uzeri siparislerde kargo bedava
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Varsayilan kargo ucreti {siteSettings.defaultShippingFee} TL.
            </ThemedText>
            <View style={styles.offerActionRow}>
              <FilterChip compact label="Sepeti buyut" onPress={() => router.push("/catalog")} />
              <FilterChip compact label="Limit detayi" onPress={() => router.push("/checkout")} />
            </View>
          </View>
          {offers.slice(0, 4).map((offer) => (
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
              <ThemedText type="default" style={styles.offerHeadline}>
                Sepette ekstra indirim
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {offer.minimumAmount} TL ve uzeri siparislerde kullan.
              </ThemedText>
              <View style={styles.offerActionRow}>
                <FilterChip compact label="Kuponu kullan" onPress={() => router.push("/checkout")} />
                <FilterChip compact label="Uygun urunler" onPress={() => router.push("/catalog?sort=price_desc")} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title={preferences.personalization.personalizedHome ? "Sana uygun urunler" : "Sizin icin sectiklerimiz"}
          actionLabel="Tumunu gor"
          onPressAction={() => router.push("/catalog")}
        />
        {!hasApiBaseUrl() && (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.noticeHeader}>
              <Feather name="wifi-off" size={16} color="#8b5e17" />
              <ThemedText type="smallBold">Canli katalog baglantisi kapali</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              Bu build'de API taban URL tanimli degil. Canli urunler icin release env'e gerçek backend adresini baglayacagim.
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
          {(personalizedProducts.length ? personalizedProducts : featuredProducts).map((product: CatalogProduct) => (
            <ProductCard key={product.id} product={product} variant="rail" />
          ))}
        </ScrollView>
      </View>

      {recentlyViewed.length ? (
        <View style={styles.section}>
          <SectionHeader title="Son baktigin urunler" actionLabel="Tercihler" onPressAction={() => router.push("../preferences")} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {recentlyViewed.map((product: CatalogProduct) => (
              <ProductCard key={`viewed-${product.id}`} product={product} variant="rail" />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Indirimli urunler" actionLabel="Katalog" onPressAction={() => router.push("/catalog?sort=price_desc")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {(discountedProducts.length ? discountedProducts : featuredProducts).map((product: CatalogProduct) => (
            <ProductCard key={`discount-${product.id}`} product={product} variant="rail" />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Tekrar satin alma" actionLabel="Hesap" onPressAction={() => router.push("/account")} />
        <View style={[styles.reorderCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <View style={styles.reorderHeader}>
            <View style={[styles.reorderIcon, { backgroundColor: activeTenant.palette.primarySoft }]}>
              <Feather name="rotate-ccw" size={16} color={activeTenant.palette.primary} />
            </View>
            <View style={styles.reorderCopy}>
              <ThemedText type="smallBold">Sik kullandiginiz urunleri hizla donun</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Son siparisler, favoriler ve son baktiginiz urunler ayni ekosistemde bagli calisiyor.
              </ThemedText>
            </View>
          </View>
          <View style={styles.reorderActions}>
            <FilterChip compact label="Favoriler" onPress={() => router.push("/wishlist")} />
            <FilterChip compact label="Siparisler" onPress={() => router.push("/account")} />
            <FilterChip compact label="Katalog" onPress={() => router.push("/catalog")} />
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  topBarCopy: {
    flex: 1,
    gap: 6,
  },
  greeting: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: 800,
  },
  utilityRail: {
    flexDirection: "row",
    gap: 10,
  },
  utilityBubble: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    ...commerceShadow("#102117", 8, 20, 0.08, 2),
  },
  hero: {
    borderRadius: 34,
    padding: 24,
    gap: 20,
    overflow: "hidden",
    position: "relative",
  },
  heroGlowOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -40,
    right: -30,
  },
  heroGlowTwo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -20,
    left: -16,
  },
  heroHeader: {
    gap: 10,
    zIndex: 1,
  },
  heroEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  heroEyebrowPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroTrustPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(11,23,14,0.18)",
  },
  heroEyebrow: {
    color: "#eff9f1",
    letterSpacing: 0.7,
  },
  heroTrustText: {
    color: "#d9f5de",
  },
  heroTitle: {
    lineHeight: 40,
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
    zIndex: 1,
    flexWrap: "wrap",
  },
  metricCard: {
    flex: 1,
    minWidth: 96,
    borderRadius: 22,
    padding: 16,
    gap: 6,
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 18,
  },
  metricLabel: {
    color: "rgba(255,255,255,0.8)",
  },
  heroActionRow: {
    flexDirection: "row",
    gap: 10,
    zIndex: 1,
    flexWrap: "wrap",
  },
  section: {
    gap: 12,
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  serviceCard: {
    width: "47.5%",
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    ...commerceShadow("#2a1a10", 10, 22, 0.06, 2),
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionList: {
    gap: 12,
    paddingRight: 6,
  },
  quickActionCard: {
    width: 214,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...commerceShadow("#102117", 10, 22, 0.05, 2),
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionCopy: {
    flex: 1,
    gap: 2,
  },
  horizontalList: {
    gap: 12,
    paddingRight: 6,
  },
  categoryTile: {
    width: 188,
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    gap: 14,
    justifyContent: "space-between",
    ...commerceShadow("#102117", 12, 22, 0.06, 2),
  },
  categoryTop: {
    gap: 12,
  },
  categoryBottom: {
    gap: 12,
  },
  categoryIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  offerCard: {
    width: 258,
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    gap: 12,
    ...commerceShadow("#102117", 12, 22, 0.06, 2),
  },
  offerCardPrimary: {
    backgroundColor: "#fff9f2",
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
  offerHeadline: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 800,
  },
  offerActionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 10,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  journeyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  journeyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  journeyIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  journeyCopy: {
    flex: 1,
    gap: 4,
  },
  journeyActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  reorderCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  reorderHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  reorderIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  reorderCopy: {
    flex: 1,
    gap: 4,
  },
  reorderActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
});

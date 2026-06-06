import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";

import { AnnouncementStrip } from "@/components/announcement-strip";
import { BrandLockup } from "@/components/brand-lockup";
import { CommerceSearchBar } from "@/components/commerce-search-bar";
import { FilterChip } from "@/components/filter-chip";
import { HeroBannerCarousel } from "@/components/hero-banner-carousel";
import { ProductCard } from "@/components/product-card";
import { ScreenShell } from "@/components/screen-shell";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { commerceShadow } from "@/constants/theme";
import { hasApiBaseUrl } from "@/config/runtime";
import { activeTenant } from "@/domain/active-tenant";
import { useCatalogSnapshot } from "@/modules/catalog/use-catalog-snapshot";
import type { CatalogProduct } from "@/modules/catalog/types";
import { useCategories } from "@/modules/categories/use-categories";
import { useHeroBanners } from "@/modules/banners/use-hero-banners";
import { useBlogPosts } from "@/modules/blog/use-blog-posts";
import { buildBlogExcerpt, getBlogReadTime } from "@/modules/blog/utils";
import { useCouponOffers } from "@/modules/coupons/use-coupon-offers";
import { usePreferences } from "@/modules/preferences/preferences-provider";
import { useProductReviewSummaries } from "@/modules/reviews/product-feedback";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";
import { useEffect } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ homeReset?: string | string[] }>();
  const [searchText, setSearchText] = useState("");
  const { recordSearch, buildRail } = usePreferences();
  const { data, isLoading, error } = useCatalogSnapshot({ page: 1, size: 12, includeFacets: true });
  const { data: categories } = useCategories();
  const { data: heroBanners } = useHeroBanners();
  const { data: blogPosts } = useBlogPosts();
  const { data: offers } = useCouponOffers();
  const { data: siteSettings, error: siteSettingsError } = useSiteSettings();

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
  const homeBlogPosts = blogPosts.slice(0, 2);
  const highlightedBlogPost = homeBlogPosts[0] || null;
  const homeReviewProductIds = useMemo(
    () => Array.from(new Set([...visibleHomeProducts, ...discountedProducts].map((product) => product.id).filter(Boolean))),
    [discountedProducts, visibleHomeProducts]
  );
  const { data: homeReviewSummaries } = useProductReviewSummaries(homeReviewProductIds);
  const announcementText = siteSettings.announcementTextTr || siteSettings.announcementTextEn || activeTenant.tagline;
  const showAnnouncement = Boolean((siteSettings.announcementActive && announcementText) || siteSettingsError);

  const handleSearchSubmit = () => {
    const trimmed = searchText.trim();
    if (trimmed) {
      recordSearch(trimmed);
    }
    router.push(trimmed ? `/catalog?query=${encodeURIComponent(trimmed)}` : "/catalog");
  };

  const homeResetKey = Array.isArray(params.homeReset) ? params.homeReset[0] : params.homeReset;

  useEffect(() => {
    if (!homeResetKey) {
      return;
    }

    setSearchText("");
  }, [homeResetKey]);

  return (
    <ScreenShell resetScrollKey={homeResetKey || "home-initial"}>
      {showAnnouncement ? (
        <View style={styles.topAnnouncement}>
          <AnnouncementStrip
            text={announcementText}
            href={siteSettings.announcementLink}
            speed={siteSettings.announcementSpeed}
            variant="topbar"
          />
        </View>
      ) : null}

      <View style={styles.topBar}>
        <BrandLockup />
      </View>

      <CommerceSearchBar
        value={searchText}
        onChangeText={setSearchText}
        onSubmit={handleSearchSubmit}
        testID="home-search-input"
        clearTestID="home-search-clear"
      />

      {!isSearchMode && heroBanners.length ? <HeroBannerCarousel banners={heroBanners} /> : null}

      {!isSearchMode && quickCategories.length ? (
        <View style={styles.section}>
          <View style={styles.categoryGrid}>
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
                {category.imageUrl ? (
                  <Image source={{ uri: category.imageUrl }} style={styles.categoryImage} contentFit="cover" transition={120} />
                ) : (
                  <View style={[styles.categoryImageFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
                    <Feather name="box" size={20} color={activeTenant.palette.primary} />
                  </View>
                )}
                <ThemedText type="smallBold" numberOfLines={2} style={styles.categoryLabel}>
                  {category.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {!isSearchMode && highlightedBlogPost ? (
        <Pressable
          onPress={() => router.push({ pathname: "/blog/[slug]", params: { slug: highlightedBlogPost.slug } })}
          style={[styles.blogLeadCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
        >
          <View style={styles.blogLeadCopy}>
            <View style={styles.blogLeadHeader}>
              <View style={styles.blogLeadEyebrow}>
                <Feather name="book-open" size={14} color={activeTenant.palette.primary} />
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  Blog
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {getBlogReadTime(highlightedBlogPost)} dk
              </ThemedText>
            </View>
            <ThemedText type="default" numberOfLines={2} style={styles.blogLeadTitle}>
              {highlightedBlogPost.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
              {buildBlogExcerpt(highlightedBlogPost, 92)}
            </ThemedText>
          </View>
          <View style={[styles.blogLeadAction, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <Feather name="arrow-up-right" size={18} color={activeTenant.palette.primary} />
          </View>
        </Pressable>
      ) : null}

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
                <ProductCard product={product} reviewSummary={homeReviewSummaries[product.id]} />
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

      {!isSearchMode ? (
        <View style={styles.section}>
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
              <ProductCard key={`discount-${product.id}`} product={product} variant="rail" reviewSummary={homeReviewSummaries[product.id]} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {!isSearchMode && homeBlogPosts.length > 1 ? (
        <View style={styles.section}>
          <SectionHeader title="Son yazılar" actionLabel="Tüm yazılar" onPressAction={() => router.push("/blog")} />
          <View style={styles.blogGrid}>
            {homeBlogPosts.slice(1).map((post) => (
              <Pressable
                key={post.slug}
                onPress={() => router.push({ pathname: "/blog/[slug]", params: { slug: post.slug } })}
                style={[styles.blogCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
              >
                {post.coverImage ? <Image source={{ uri: post.coverImage }} style={styles.blogImage} contentFit="cover" transition={120} /> : null}
                <View style={styles.blogContent}>
                  <View style={styles.blogMetaRow}>
                    <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                      Blog
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {getBlogReadTime(post)} dk
                    </ThemedText>
                  </View>
                  <ThemedText type="default" numberOfLines={2} style={styles.blogTitle}>
                    {post.title}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
                    {buildBlogExcerpt(post, 100)}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topAnnouncement: {
    marginTop: -18,
    marginHorizontal: -20,
  },
  topBar: {
    alignItems: "center",
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
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
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
  blogLeadCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...commerceShadow("#17324a", 8, 20, 0.05, 2),
  },
  blogLeadCopy: {
    flex: 1,
    gap: 8,
  },
  blogLeadHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  blogLeadEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  blogLeadTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  blogLeadAction: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTile: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    gap: 12,
    alignItems: "center",
    ...commerceShadow("#17324a", 8, 18, 0.05, 2),
  },
  categoryImage: {
    width: "100%",
    height: 96,
    borderRadius: 16,
  },
  categoryImageFallback: {
    width: "100%",
    height: 96,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    lineHeight: 20,
    textAlign: "center",
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
  blogGrid: {
    gap: 12,
  },
  blogCard: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden",
    ...commerceShadow("#17324a", 10, 24, 0.05, 2),
  },
  blogImage: {
    width: "100%",
    height: 180,
  },
  blogContent: {
    padding: 16,
    gap: 8,
  },
  blogMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  blogTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
});

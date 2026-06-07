import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";

import { AnnouncementStrip } from "@/components/announcement-strip";
import { BrandLockup } from "@/components/brand-lockup";
import { CommerceSearchBar } from "@/components/commerce-search-bar";
import { HeroBannerCarousel } from "@/components/hero-banner-carousel";
import { NotificationCountBadge } from "@/components/notification-count-badge";
import { ProductCard } from "@/components/product-card";
import { SearchSuggestionList } from "@/components/search-suggestion-list";
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
import { usePreferences } from "@/modules/preferences/preferences-provider";
import { useNotificationCenter } from "@/modules/notifications/use-notification-center";
import { useProductReviewSummaries } from "@/modules/reviews/product-feedback";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";
import { useEffect } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ homeReset?: string | string[] }>();
  const [searchText, setSearchText] = useState("");
  const [submittedSearchText, setSubmittedSearchText] = useState("");
  const [announcementRestartKey, setAnnouncementRestartKey] = useState(0);
  const { recordSearch, buildRail } = usePreferences();
  const submittedSearchQuery = submittedSearchText.trim();
  const deferredDraftSearchQuery = useDeferredValue(searchText.trim());
  const hasSubmittedSearch = submittedSearchQuery.length >= 2;
  const hasDraftSearch = deferredDraftSearchQuery.length >= 2;
  const { data, isLoading, error } = useCatalogSnapshot({ page: 1, size: 12, includeFacets: true });
  const {
    data: liveSearchSnapshot,
    isLoading: isSearchLoading,
    error: searchError,
  } = useCatalogSnapshot(
    {
      page: 1,
      size: 8,
      includeFacets: true,
      q: deferredDraftSearchQuery || undefined,
    },
    { enabled: hasDraftSearch }
  );
  const { data: categories } = useCategories();
  const { data: heroBanners } = useHeroBanners();
  const { data: blogPosts } = useBlogPosts();
  const { data: siteSettings, error: siteSettingsError } = useSiteSettings();
  const { unreadCount } = useNotificationCenter();

  const featuredProducts = data?.products.slice(0, 6) || [];
  const discountedProducts = (data?.products || []).filter((product) => product.discount > 0).slice(0, 6);
  const quickCategories = categories.slice(0, 8);
  const curatedProducts = useMemo(() => buildRail(data?.products || []), [buildRail, data?.products]);
  const liveSearchProducts = liveSearchSnapshot?.products || [];
  const searchSuggestions = liveSearchProducts.slice(0, 6);
  const visibleHomeProducts = (curatedProducts.length ? curatedProducts : featuredProducts).slice(0, 4);
  const homeBlogPosts = blogPosts.slice(0, 2);
  const highlightedBlogPost = homeBlogPosts[0] || null;
  const homeReviewProductIds = useMemo(
    () => Array.from(new Set([...visibleHomeProducts, ...discountedProducts].map((product) => product.id).filter(Boolean))),
    [discountedProducts, visibleHomeProducts]
  );
  const { data: homeReviewSummaries } = useProductReviewSummaries(homeReviewProductIds);
  const announcementText = siteSettings.announcementTextTr || siteSettings.announcementTextEn || activeTenant.tagline;
  const showAnnouncement = Boolean((siteSettings.announcementActive && announcementText) || siteSettingsError);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    if (submittedSearchText && value.trim() !== submittedSearchText) {
      setSubmittedSearchText("");
    }
  };

  const handleSearchSubmit = () => {
    const trimmed = searchText.trim();
    setSubmittedSearchText(trimmed);

    if (trimmed.length >= 2) {
      recordSearch(trimmed);
    }
  };

  const homeResetKey = Array.isArray(params.homeReset) ? params.homeReset[0] : params.homeReset;

  useEffect(() => {
    if (!homeResetKey) {
      return;
    }

    setSearchText("");
    setSubmittedSearchText("");
  }, [homeResetKey]);

  useFocusEffect(
    useCallback(() => {
      setAnnouncementRestartKey((current) => current + 1);
      return undefined;
    }, [])
  );

  return (
    <ScreenShell resetScrollKey={homeResetKey || "home-initial"}>
      {showAnnouncement ? (
        <View style={styles.topAnnouncement}>
          <AnnouncementStrip
            text={announcementText}
            href={siteSettings.announcementLink}
            speed={siteSettings.announcementSpeed}
            variant="topbar"
            restartKey={announcementRestartKey}
          />
        </View>
      ) : null}

      <View style={styles.topBar}>
        <View style={styles.brandLockupWrap}>
          <BrandLockup compact />
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchGrow}>
          <CommerceSearchBar
            value={searchText}
            onChangeText={handleSearchChange}
            onSubmit={handleSearchSubmit}
            testID="home-search-input"
            clearTestID="home-search-clear"
          />
        </View>
        <Pressable
          accessibilityLabel="Bildirimleri aç"
          accessibilityRole="button"
          onPress={() => router.push("/notifications")}
          style={({ pressed }) => [
            styles.notificationButton,
            {
              backgroundColor: unreadCount > 0 ? activeTenant.palette.primarySoft : "#f7faf8",
              borderColor: unreadCount > 0 ? "rgba(42, 137, 78, 0.24)" : activeTenant.palette.border,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
          testID="home-open-notifications"
        >
          <View style={[styles.notificationIconWrap, { backgroundColor: unreadCount > 0 ? "#ffffff" : activeTenant.palette.surface }]}>
            <Feather name="bell" size={19} color={activeTenant.palette.primary} />
          </View>
          <NotificationCountBadge count={unreadCount} compact style={styles.notificationBadge} />
        </Pressable>
      </View>

      <SearchSuggestionList
        products={searchSuggestions}
        query={searchText}
        onSelect={(product) => router.push(`/product/${product.id}`)}
      />

      {hasDraftSearch && isSearchLoading && !liveSearchProducts.length ? (
        <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="small">Ürünler aranıyor...</ThemedText>
        </View>
      ) : null}

      {hasDraftSearch && searchError && !liveSearchProducts.length ? (
        <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Arama sonucu alınamadı</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {searchError}
          </ThemedText>
        </View>
      ) : null}

      {hasDraftSearch && !isSearchLoading && !searchError && !liveSearchProducts.length ? (
        <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Sonuç bulunamadı</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Daha kısa bir kelime ya da farklı bir ürün adı dene.
          </ThemedText>
        </View>
      ) : null}

      {!hasSubmittedSearch && heroBanners.length ? <HeroBannerCarousel banners={heroBanners} /> : null}

      {!hasSubmittedSearch && quickCategories.length ? (
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
                <ThemedText type="smallBold" numberOfLines={3} style={styles.categoryLabel}>
                  {category.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {!hasSubmittedSearch && highlightedBlogPost ? (
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

      {!hasSubmittedSearch ? (
        <View style={styles.section}>
          <SectionHeader
            title="Ürünler"
            actionLabel="Kataloğa git"
            onPressAction={() =>
              router.push(submittedSearchQuery ? (`/catalog?query=${encodeURIComponent(submittedSearchQuery)}` as never) : "/catalog")
            }
          />
          {!hasApiBaseUrl() ? (
            <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <View style={styles.noticeHeader}>
                <Feather name="wifi-off" size={16} color="#8b5e17" />
                <ThemedText type="smallBold">Canlı katalog bağlantısı kapalı</ThemedText>
              </View>
            </View>
          ) : null}
          {isLoading && hasApiBaseUrl() ? (
            <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <ThemedText type="small">Katalog yükleniyor...</ThemedText>
            </View>
          ) : null}
          {error ? (
            <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <ThemedText type="smallBold">Bağlantı durumu</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {error}
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
      ) : null}

      {!hasSubmittedSearch && discountedProducts.length ? (
        <View style={styles.section}>
          <SectionHeader title="İndirimli ürünler" actionLabel="Katalog" onPressAction={() => router.push("/catalog?sort=price_desc")} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {discountedProducts.map((product: CatalogProduct) => (
              <ProductCard key={`discount-${product.id}`} product={product} variant="rail" reviewSummary={homeReviewSummaries[product.id]} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {!hasSubmittedSearch && homeBlogPosts.length > 1 ? (
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
  brandLockupWrap: {
    alignSelf: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchGrow: {
    flex: 1,
  },
  notificationButton: {
    width: 54,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...commerceShadow("#17324a", 10, 22, 0.05, 2),
  },
  notificationIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
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
    padding: 10,
    gap: 10,
    alignItems: "center",
    ...commerceShadow("#17324a", 8, 18, 0.05, 2),
  },
  categoryImage: {
    width: "100%",
    height: 92,
    borderRadius: 16,
  },
  categoryImageFallback: {
    width: "100%",
    height: 92,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    minHeight: 42,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    width: "100%",
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

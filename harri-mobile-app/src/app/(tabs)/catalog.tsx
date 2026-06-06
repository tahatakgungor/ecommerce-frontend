import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { CommerceSearchBar } from "@/components/commerce-search-bar";
import { FilterChip } from "@/components/filter-chip";
import { PrimaryButton } from "@/components/primary-button";
import { ProductCard } from "@/components/product-card";
import { ScreenShell } from "@/components/screen-shell";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { CATALOG_SORT, normalizeCatalogSort, toFilterSlug } from "@/modules/catalog/query";
import { useCategories } from "@/modules/categories/use-categories";
import { useCatalogSnapshot } from "@/modules/catalog/use-catalog-snapshot";
import type { CatalogProduct } from "@/modules/catalog/types";
import { usePreferences } from "@/modules/preferences/preferences-provider";

export default function CatalogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string; parent?: string; brand?: string; sort?: string; category?: string | string[] }>();
  const initialQuery = typeof params.query === "string" ? params.query : "";
  const initialParent = typeof params.parent === "string" ? params.parent : "";
  const initialBrand = typeof params.brand === "string" ? params.brand : "";
  const initialSort = normalizeCatalogSort(typeof params.sort === "string" ? params.sort : CATALOG_SORT.latest);
  const initialCategory = Array.isArray(params.category)
    ? params.category.flatMap((item) => String(item).split(",")).filter(Boolean)
    : typeof params.category === "string"
      ? params.category.split(",").filter(Boolean)
      : [];

  const [searchText, setSearchText] = useState(initialQuery);
  const [selectedParent, setSelectedParent] = useState(initialParent);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [selectedChildren, setSelectedChildren] = useState(initialCategory);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(
    Boolean(initialParent || initialBrand || initialSort !== CATALOG_SORT.latest || initialCategory.length)
  );
  const [activePanel, setActivePanel] = useState<"parent" | "child" | "brand" | "sort" | null>(
    initialCategory.length ? "child" : initialParent ? "parent" : initialBrand ? "brand" : initialSort !== CATALOG_SORT.latest ? "sort" : null
  );
  const { preferences, recordSearch, clearRecentSearches } = usePreferences();

  const deferredQuery = useDeferredValue(searchText.trim());
  const { data: categories } = useCategories();
  const query = useMemo(
    () => ({
      page: 1,
      size: 24,
      includeFacets: true,
      q: deferredQuery || undefined,
      parentCategory: selectedParent || undefined,
      category: selectedChildren.length ? selectedChildren : undefined,
      brand: selectedBrand || undefined,
      sort: selectedSort,
      categoryItems: categories.map((item) => ({ parent: item.label, children: item.children.map((child) => child.label) })),
    }),
    [categories, deferredQuery, selectedBrand, selectedChildren, selectedParent, selectedSort]
  );
  const { data, isLoading, error } = useCatalogSnapshot(query);
  const products = data?.products || [];
  const parentOptions = categories.slice(0, 10);
  const childOptions = parentOptions.find((item) => item.slug === toFilterSlug(selectedParent))?.children || [];
  const brandOptions = (data?.brands || []).slice(0, 10);
  const totalCount = data?.total || products.length;
  const activeFilterCount = [selectedParent, selectedBrand, selectedSort !== CATALOG_SORT.latest, selectedChildren.length > 0].filter(Boolean).length;
  const selectedParentLabel = parentOptions.find((item) => item.slug === toFilterSlug(selectedParent))?.label;
  const selectedBrandLabel = brandOptions.find((item) => toFilterSlug(item) === toFilterSlug(selectedBrand));
  const selectedChildLabels = childOptions
    .filter((item) => selectedChildren.includes(item.slug))
    .map((item) => item.label);
  const selectedSortLabel =
    selectedSort === CATALOG_SORT.priceAsc
      ? "Fiyat artan"
      : selectedSort === CATALOG_SORT.priceDesc
        ? "Fiyat azalan"
        : "Onerilen";
  const recentSearch = preferences.recentSearches[0];
  const recentViewed = preferences.personalization.recentlyViewed ? preferences.recentlyViewed[0] : null;
  const recentViewedCategory = recentViewed?.parentCategory || recentViewed?.category || "";
  const recentViewedBrand = recentViewed?.brand || "";
  const hasActiveFilters = Boolean(searchText.trim() || selectedParent || selectedBrand || selectedSort !== CATALOG_SORT.latest || selectedChildren.length);
  const activeContextChips = [
    searchText.trim() ? `Arama: ${searchText.trim()}` : null,
    selectedParentLabel ? `Kategori: ${selectedParentLabel}` : null,
    selectedChildLabels.length ? `Alt kategori: ${selectedChildLabels.join(", ")}` : null,
    selectedBrandLabel ? `Marka: ${selectedBrandLabel}` : null,
  ].filter(Boolean) as string[];

  useEffect(() => {
    setSearchText(initialQuery);
    setSelectedParent(initialParent);
    setSelectedBrand(initialBrand);
    setSelectedSort(initialSort);
    setSelectedChildren(initialCategory);
  }, [initialBrand, initialCategory, initialParent, initialQuery, initialSort]);

  useEffect(() => {
    if (!selectedParent) {
      if (selectedChildren.length) {
        setSelectedChildren([]);
      }
      if (activePanel === "child") {
        setActivePanel(null);
      }
      return;
    }

    const validChildSlugs = new Set(childOptions.map((item) => item.slug));
    const nextChildren = selectedChildren.filter((item) => validChildSlugs.has(item));
    if (nextChildren.length !== selectedChildren.length) {
      setSelectedChildren(nextChildren);
    }
  }, [childOptions, selectedChildren, selectedParent]);

  const openPanel = (panel: "parent" | "child" | "brand" | "sort") => {
    setShowAdvancedFilters(true);
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const commitSearch = () => {
    const nextQuery = searchText.trim();
    if (nextQuery) {
      recordSearch(nextQuery);
    }
    const nextParams = new URLSearchParams();
    if (nextQuery) nextParams.set("query", nextQuery);
    if (selectedParent) nextParams.set("parent", selectedParent);
    if (selectedChildren.length) nextParams.set("category", selectedChildren.join(","));
    if (selectedBrand) nextParams.set("brand", selectedBrand);
    if (selectedSort !== CATALOG_SORT.latest) nextParams.set("sort", selectedSort);
    const href = nextParams.toString() ? `/catalog?${nextParams.toString()}` : "/catalog";
    router.replace(href as Href);
  };

  const resetFilters = () => {
    setSearchText("");
    setSelectedParent("");
    setSelectedChildren([]);
    setSelectedBrand("");
    setSelectedSort(CATALOG_SORT.latest);
    setActivePanel(null);
    router.replace("/catalog");
  };

  return (
    <ScreenShell scroll={false}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrap}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.primary }]}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroBadge}>
                  <Feather name="search" size={14} color="#ffffff" />
                  <ThemedText type="smallBold" style={styles.heroBadgeText}>
                    Akıllı katalog
                  </ThemedText>
                </View>
                <View style={styles.heroMeta}>
                  <Feather name="sliders" size={14} color="#d7f5de" />
                  <ThemedText type="smallBold" style={styles.heroMetaText}>
                    {activeFilterCount} aktif filtre
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="subtitle" style={styles.heroTitle}>
                Ürünleri hızlı bul
              </ThemedText>
              <View style={styles.heroMetrics}>
                <View style={styles.heroMetricCard}>
                  <ThemedText type="smallBold" style={styles.heroMetricValue}>
                    {totalCount}
                  </ThemedText>
                  <ThemedText type="small" style={styles.heroMetricLabel}>
                    ürün listede
                  </ThemedText>
                </View>
                <View style={styles.heroMetricCard}>
                  <ThemedText type="smallBold" style={styles.heroMetricValue}>
                    {brandOptions.length}
                  </ThemedText>
                  <ThemedText type="small" style={styles.heroMetricLabel}>
                    marka seçeneği
                  </ThemedText>
                </View>
              </View>
            </View>

            <CommerceSearchBar
              value={searchText}
              onChangeText={setSearchText}
              onSubmit={commitSearch}
              testID="catalog-search-input"
            />

            <View style={[styles.toolbarCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryCopy}>
                  <ThemedText type="smallBold">{totalCount} ürün bulundu</ThemedText>
                </View>
                {hasActiveFilters ? <PrimaryButton label="Sıfırla" onPress={resetFilters} variant="outline" style={styles.resetButton} /> : null}
              </View>

              <View style={styles.selectGrid}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openPanel("parent")}
                  style={[styles.selectField, activePanel === "parent" ? styles.selectFieldActive : null, { borderColor: activeTenant.palette.border }]}
                >
                  <ThemedText type="small" themeColor="textSecondary">
                    Kategori
                  </ThemedText>
                  <View style={styles.selectValueRow}>
                    <ThemedText type="smallBold" numberOfLines={1} style={styles.selectValueText}>
                      {selectedParentLabel || "Tum kategoriler"}
                    </ThemedText>
                    <Feather name={activePanel === "parent" ? "chevron-up" : "chevron-down"} size={16} color={activeTenant.palette.primary} />
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => openPanel("brand")}
                  style={[styles.selectField, activePanel === "brand" ? styles.selectFieldActive : null, { borderColor: activeTenant.palette.border }]}
                >
                  <ThemedText type="small" themeColor="textSecondary">
                    Marka
                  </ThemedText>
                  <View style={styles.selectValueRow}>
                    <ThemedText type="smallBold" numberOfLines={1} style={styles.selectValueText}>
                      {selectedBrandLabel || "Tum markalar"}
                    </ThemedText>
                    <Feather name={activePanel === "brand" ? "chevron-up" : "chevron-down"} size={16} color={activeTenant.palette.primary} />
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => openPanel("sort")}
                  style={[styles.selectField, activePanel === "sort" ? styles.selectFieldActive : null, { borderColor: activeTenant.palette.border }]}
                >
                  <ThemedText type="small" themeColor="textSecondary">
                    Sıralama
                  </ThemedText>
                  <View style={styles.selectValueRow}>
                    <ThemedText type="smallBold" numberOfLines={1} style={styles.selectValueText}>
                      {selectedSortLabel}
                    </ThemedText>
                    <Feather name={activePanel === "sort" ? "chevron-up" : "chevron-down"} size={16} color={activeTenant.palette.primary} />
                  </View>
                </Pressable>

                {selectedParent && childOptions.length ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openPanel("child")}
                    style={[styles.selectField, activePanel === "child" ? styles.selectFieldActive : null, { borderColor: activeTenant.palette.border }]}
                  >
                    <ThemedText type="small" themeColor="textSecondary">
                      Alt kategori
                    </ThemedText>
                    <View style={styles.selectValueRow}>
                      <ThemedText type="smallBold" numberOfLines={1} style={styles.selectValueText}>
                        {selectedChildLabels.length ? `${selectedChildLabels.length} seçili` : "Tüm alt kategoriler"}
                      </ThemedText>
                      <Feather name={activePanel === "child" ? "chevron-up" : "chevron-down"} size={16} color={activeTenant.palette.primary} />
                    </View>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.discoveryGrid}>
                <FilterChip compact label="Yeni gelenler" active={selectedSort === CATALOG_SORT.latest} onPress={() => setSelectedSort(CATALOG_SORT.latest)} />
                <FilterChip compact label="Sepete uygunlar" active={selectedSort === CATALOG_SORT.priceAsc} onPress={() => setSelectedSort(CATALOG_SORT.priceAsc)} />
                <FilterChip compact label="Kampanyalar" onPress={() => router.push("/roadmap")} />
                <FilterChip compact label="Favoriler" onPress={() => router.push("/wishlist")} />
              </View>

              {activeContextChips.length ? (
                <View style={styles.activeFilterRow}>
                  {activeContextChips.map((item) => (
                    <View key={item} style={[styles.activeFilterPill, { backgroundColor: "#f7faf7" }]}>
                      <ThemedText type="smallBold">{item}</ThemedText>
                    </View>
                  ))}
                </View>
              ) : null}

              {showAdvancedFilters && activePanel ? (
                <View style={[styles.panelCard, { borderColor: activeTenant.palette.border }]}>
                  <View style={styles.panelHeader}>
                    <ThemedText type="smallBold">
                      {activePanel === "parent"
                        ? "Kategori sec"
                        : activePanel === "child"
                          ? "Alt kategori sec"
                          : activePanel === "brand"
                            ? "Marka sec"
                            : "Siralama sec"}
                    </ThemedText>
                    <Pressable accessibilityRole="button" onPress={() => setActivePanel(null)} style={styles.panelCloseButton}>
                      <Feather name="x" size={16} color={activeTenant.palette.primary} />
                    </Pressable>
                  </View>

                  {activePanel === "parent" ? (
                    <View style={styles.chipGrid}>
                      <FilterChip label="Tüm ürünler" active={!selectedParent} onPress={() => setSelectedParent("")} />
                      {parentOptions.map((category) => (
                        <FilterChip
                          key={category.id}
                          label={category.label}
                          active={toFilterSlug(selectedParent) === category.slug}
                          onPress={() => setSelectedParent(toFilterSlug(selectedParent) === category.slug ? "" : category.slug)}
                        />
                      ))}
                    </View>
                  ) : null}

                  {activePanel === "child" ? (
                    <View style={styles.chipGrid}>
                      <FilterChip compact label="Tum alt kategoriler" active={!selectedChildren.length} onPress={() => setSelectedChildren([])} />
                      {childOptions.map((category) => (
                        <FilterChip
                          compact
                          key={category.slug}
                          label={category.label}
                          active={selectedChildren.includes(category.slug)}
                          onPress={() =>
                            setSelectedChildren((current) =>
                              current.includes(category.slug)
                                ? current.filter((item) => item !== category.slug)
                                : [...current, category.slug]
                            )
                          }
                        />
                      ))}
                    </View>
                  ) : null}

                  {activePanel === "brand" ? (
                    <View style={styles.chipGrid}>
                      <FilterChip label="Tum markalar" active={!selectedBrand} onPress={() => setSelectedBrand("")} compact />
                      {brandOptions.map((brand) => (
                        <FilterChip
                          compact
                          key={brand}
                          label={brand}
                          active={toFilterSlug(selectedBrand) === toFilterSlug(brand)}
                          onPress={() =>
                            setSelectedBrand(toFilterSlug(selectedBrand) === toFilterSlug(brand) ? "" : toFilterSlug(brand))
                          }
                        />
                      ))}
                    </View>
                  ) : null}

                  {activePanel === "sort" ? (
                    <View style={styles.chipGrid}>
                      <FilterChip compact label="Onerilen" active={selectedSort === CATALOG_SORT.latest} onPress={() => setSelectedSort(CATALOG_SORT.latest)} />
                      <FilterChip compact label="Fiyat artan" active={selectedSort === CATALOG_SORT.priceAsc} onPress={() => setSelectedSort(CATALOG_SORT.priceAsc)} />
                      <FilterChip compact label="Fiyat azalan" active={selectedSort === CATALOG_SORT.priceDesc} onPress={() => setSelectedSort(CATALOG_SORT.priceDesc)} />
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

            {recentSearch || recentViewed ? (
              <View style={[styles.filterCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
                <SectionHeader title="Kısayollar" actionLabel="Temizle" onPressAction={resetFilters} />
                <View style={styles.chipGrid}>
                  {recentSearch ? (
                    <FilterChip
                      compact
                      label={`Ara: ${recentSearch}`}
                      onPress={() => {
                        setSearchText(recentSearch);
                        router.replace(`/catalog?query=${encodeURIComponent(recentSearch)}` as Href);
                      }}
                    />
                  ) : null}
                  {recentViewedCategory ? (
                    <FilterChip
                      compact
                      label={recentViewedCategory}
                      onPress={() => {
                        setSelectedParent(toFilterSlug(recentViewedCategory));
                        setShowAdvancedFilters(true);
                      }}
                    />
                  ) : null}
                  {recentViewedBrand ? (
                    <FilterChip
                      compact
                      label={recentViewedBrand}
                      onPress={() => {
                        setSelectedBrand(toFilterSlug(recentViewedBrand));
                        setShowAdvancedFilters(true);
                      }}
                    />
                  ) : null}
                  {recentViewed ? (
                    <FilterChip compact label="Son ürünü aç" active onPress={() => router.push(`/product/${recentViewed.id}`)} />
                  ) : null}
                </View>
              </View>
            ) : null}

            {preferences.personalization.recentSearches && preferences.recentSearches.length ? (
              <View style={[styles.filterCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
                <SectionHeader title="Son aramalar" actionLabel="Temizle" onPressAction={clearRecentSearches} />
                <View style={styles.chipGrid}>
                  {preferences.recentSearches.map((item) => (
                    <FilterChip
                      compact
                      key={item}
                      label={item}
                      onPress={() => {
                        setSearchText(item);
                        router.replace(`/catalog?query=${encodeURIComponent(item)}` as Href);
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {isLoading ? (
              <View style={styles.inlineNotice}>
                <Feather name="loader" size={14} color={activeTenant.palette.primary} />
                <ThemedText type="small">Ürünler yenileniyor...</ThemedText>
              </View>
            ) : null}
            {error ? (
              <View style={styles.inlineNotice}>
                <Feather name="alert-circle" size={14} color="#b42318" />
                <ThemedText type="small" style={{ color: "#b42318" }}>
                  {error}
                </ThemedText>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }: { item: CatalogProduct }) => <ProductCard product={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={[styles.emptyState, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <View style={styles.emptyIcon}>
                <Feather name="inbox" size={22} color={activeTenant.palette.primary} />
              </View>
              <ThemedText type="smallBold">Sonuc bulunamadi</ThemedText>
              {hasActiveFilters ? <PrimaryButton label="Filtreleri Temizle" onPress={resetFilters} variant="outline" /> : null}
            </View>
          ) : null
        }
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    gap: 16,
    marginBottom: 16,
  },
  heroCard: {
    borderRadius: 30,
    padding: 20,
    gap: 14,
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
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroMetaText: {
    color: "#d7f5de",
  },
  heroTitle: {
    color: "#ffffff",
  },
  heroMetrics: {
    flexDirection: "row",
    gap: 12,
  },
  heroMetricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    gap: 4,
  },
  heroMetricValue: {
    color: "#ffffff",
    fontSize: 24,
    lineHeight: 30,
  },
  heroMetricLabel: {
    color: "#e7f7eb",
  },
  listContent: {
    padding: 20,
    paddingBottom: 30,
  },
  toolbarCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryCopy: {
    flex: 1,
  },
  resetButton: {
    minWidth: 88,
  },
  contextRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  contextPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  selectField: {
    width: "47.5%",
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#fbfcfb",
  },
  selectFieldActive: {
    backgroundColor: "#f1f7f2",
  },
  selectValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  selectValueText: {
    flex: 1,
  },
  panelCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 12,
    backgroundColor: "#fbfcfb",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  panelCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef7f0",
  },
  filterCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  activeFilterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  activeFilterPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  discoveryGrid: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  separator: {
    height: 14,
  },
  columnWrap: {
    gap: 14,
  },
  inlineNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
    gap: 10,
    alignItems: "flex-start",
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef7f0",
  },
});

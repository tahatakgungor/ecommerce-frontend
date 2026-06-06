import { FlatList, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { CommerceSearchBar } from "@/components/commerce-search-bar";
import { FilterChip } from "@/components/filter-chip";
import { PrimaryButton } from "@/components/primary-button";
import { ProductCard } from "@/components/product-card";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";
import { CATALOG_SORT, normalizeCatalogSort, toFilterSlug } from "@/modules/catalog/query";
import { useCategories } from "@/modules/categories/use-categories";
import { useCatalogSnapshot } from "@/modules/catalog/use-catalog-snapshot";
import type { CatalogProduct } from "@/modules/catalog/types";
import { usePreferences } from "@/modules/preferences/preferences-provider";

type FilterPanel = "parent" | "child" | "brand" | "sort" | null;

export default function CatalogScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
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
  const [activePanel, setActivePanel] = useState<FilterPanel>(
    initialCategory.length ? "child" : initialParent ? "parent" : initialBrand ? "brand" : initialSort !== CATALOG_SORT.latest ? "sort" : null
  );
  const { preferences, recordSearch } = usePreferences();

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
  const recentSearch = preferences.recentSearches[0];
  const recentViewed = preferences.personalization.recentlyViewed ? preferences.recentlyViewed[0] : null;
  const recentViewedCategory = recentViewed?.parentCategory || recentViewed?.category || "";
  const recentViewedBrand = recentViewed?.brand || "";
  const columnCount = width < 400 ? 1 : 2;

  const selectedParentLabel = parentOptions.find((item) => item.slug === toFilterSlug(selectedParent))?.label || "Kategori";
  const selectedBrandLabel = brandOptions.find((item) => toFilterSlug(item) === toFilterSlug(selectedBrand)) || "Marka";
  const selectedChildLabels = childOptions.filter((item) => selectedChildren.includes(item.slug)).map((item) => item.label);
  const selectedSortLabel =
    selectedSort === CATALOG_SORT.priceAsc
      ? "Fiyat artan"
      : selectedSort === CATALOG_SORT.priceDesc
        ? "Fiyat azalan"
        : "Önerilen";

  const hasActiveFilters = Boolean(searchText.trim() || selectedParent || selectedBrand || selectedSort !== CATALOG_SORT.latest || selectedChildren.length);
  const activeFilterCount = [selectedParent, selectedBrand, selectedSort !== CATALOG_SORT.latest, selectedChildren.length > 0].filter(Boolean).length;
  const activeContextChips = [
    searchText.trim() ? `Arama: ${searchText.trim()}` : null,
    selectedParent ? selectedParentLabel : null,
    selectedChildLabels.length ? `${selectedChildLabels.length} alt kategori` : null,
    selectedBrand ? String(selectedBrandLabel) : null,
    selectedSort !== CATALOG_SORT.latest ? selectedSortLabel : null,
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
  }, [activePanel, childOptions, selectedChildren, selectedParent]);

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

  const openPanel = (panel: Exclude<FilterPanel, null>) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  return (
    <ScreenShell scroll={false}>
      <FlatList
        key={columnCount}
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={columnCount}
        columnWrapperStyle={columnCount > 1 ? styles.columnWrap : undefined}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.titleRow}>
              <ThemedText type="subtitle">Katalog</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {totalCount} ürün
              </ThemedText>
            </View>

            <CommerceSearchBar
              value={searchText}
              onChangeText={setSearchText}
              onSubmit={commitSearch}
              testID="catalog-search-input"
            />

            <View style={[styles.filterBarCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openPanel("parent")}
                  style={[styles.filterTrigger, activePanel === "parent" ? styles.filterTriggerActive : null]}
                >
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {selectedParent ? selectedParentLabel : "Kategori"}
                  </ThemedText>
                  <Feather name={activePanel === "parent" ? "chevron-up" : "chevron-down"} size={16} color={activeTenant.palette.primary} />
                </Pressable>

                {selectedParent && childOptions.length ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openPanel("child")}
                    style={[styles.filterTrigger, activePanel === "child" ? styles.filterTriggerActive : null]}
                  >
                    <ThemedText type="smallBold" numberOfLines={1}>
                      {selectedChildLabels.length ? `${selectedChildLabels.length} alt kategori` : "Alt kategori"}
                    </ThemedText>
                    <Feather name={activePanel === "child" ? "chevron-up" : "chevron-down"} size={16} color={activeTenant.palette.primary} />
                  </Pressable>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  onPress={() => openPanel("brand")}
                  style={[styles.filterTrigger, activePanel === "brand" ? styles.filterTriggerActive : null]}
                >
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {selectedBrand ? String(selectedBrandLabel) : "Marka"}
                  </ThemedText>
                  <Feather name={activePanel === "brand" ? "chevron-up" : "chevron-down"} size={16} color={activeTenant.palette.primary} />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => openPanel("sort")}
                  style={[styles.filterTrigger, activePanel === "sort" ? styles.filterTriggerActive : null]}
                >
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {selectedSortLabel}
                  </ThemedText>
                  <Feather name={activePanel === "sort" ? "chevron-up" : "chevron-down"} size={16} color={activeTenant.palette.primary} />
                </Pressable>

                {hasActiveFilters ? (
                  <Pressable accessibilityRole="button" onPress={resetFilters} style={styles.clearTrigger}>
                    <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                      Sıfırla
                    </ThemedText>
                  </Pressable>
                ) : null}
              </ScrollView>

              {activeContextChips.length ? (
                <View style={styles.activeFilterRow}>
                  {activeContextChips.map((item) => (
                    <View key={item} style={styles.activeFilterPill}>
                      <ThemedText type="smallBold">{item}</ThemedText>
                    </View>
                  ))}
                </View>
              ) : null}

              {activePanel ? (
                <View style={[styles.panelCard, { borderColor: activeTenant.palette.border }]}>
                  <View style={styles.panelHeader}>
                    <ThemedText type="smallBold">
                      {activePanel === "parent"
                        ? "Kategori seç"
                        : activePanel === "child"
                          ? "Alt kategori seç"
                          : activePanel === "brand"
                            ? "Marka seç"
                            : "Sıralama seç"}
                    </ThemedText>
                    <Pressable accessibilityRole="button" onPress={() => setActivePanel(null)} style={styles.panelCloseButton}>
                      <Feather name="x" size={16} color={activeTenant.palette.primary} />
                    </Pressable>
                  </View>

                  {activePanel === "parent" ? (
                    <View style={styles.optionWrap}>
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
                    <View style={styles.optionWrap}>
                      <FilterChip compact label="Tüm alt kategoriler" active={!selectedChildren.length} onPress={() => setSelectedChildren([])} />
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
                    <View style={styles.optionWrap}>
                      <FilterChip compact label="Tüm markalar" active={!selectedBrand} onPress={() => setSelectedBrand("")} />
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
                    <View style={styles.optionWrap}>
                      <FilterChip compact label="Önerilen" active={selectedSort === CATALOG_SORT.latest} onPress={() => setSelectedSort(CATALOG_SORT.latest)} />
                      <FilterChip compact label="Fiyat artan" active={selectedSort === CATALOG_SORT.priceAsc} onPress={() => setSelectedSort(CATALOG_SORT.priceAsc)} />
                      <FilterChip compact label="Fiyat azalan" active={selectedSort === CATALOG_SORT.priceDesc} onPress={() => setSelectedSort(CATALOG_SORT.priceDesc)} />
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

            {recentSearch || recentViewed ? (
              <View style={styles.quickRow}>
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
                    onPress={() => setSelectedParent(toFilterSlug(recentViewedCategory))}
                  />
                ) : null}
                {recentViewedBrand ? (
                  <FilterChip
                    compact
                    label={recentViewedBrand}
                    onPress={() => setSelectedBrand(toFilterSlug(recentViewedBrand))}
                  />
                ) : null}
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
              <ThemedText type="smallBold">Sonuç bulunamadı</ThemedText>
              {hasActiveFilters ? <PrimaryButton label="Filtreleri temizle" onPress={resetFilters} variant="outline" /> : null}
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
    gap: 14,
    marginBottom: 14,
  },
  titleRow: {
    gap: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  filterBarCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    ...commerceShadow("#17324a", 10, 22, 0.04, 2),
  },
  filterBar: {
    gap: 10,
    paddingRight: 8,
  },
  filterTrigger: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f8fbfe",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#d8e4ef",
  },
  filterTriggerActive: {
    backgroundColor: "#eef6f2",
    borderColor: "#c5e1d1",
  },
  clearTrigger: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
    backgroundColor: "#f7faf7",
    borderWidth: 1,
    borderColor: "#cfe0d3",
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
    backgroundColor: "#f5f9fd",
  },
  panelCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 12,
    backgroundColor: "#fcfdff",
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
  optionWrap: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  quickRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  inlineNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  separator: {
    height: 10,
  },
  columnWrap: {
    gap: 10,
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.96)",
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

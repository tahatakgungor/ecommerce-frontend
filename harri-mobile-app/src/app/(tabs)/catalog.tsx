import { FlatList, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { CommerceSearchBar } from "@/components/commerce-search-bar";
import { CommercePageHeader } from "@/components/commerce-page-header";
import { PrimaryButton } from "@/components/primary-button";
import { ProductCard } from "@/components/product-card";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";
import { CATALOG_SORT, normalizeBrandFilters, normalizeCatalogSort, normalizeCategoryFilters, toFilterSlug } from "@/modules/catalog/query";
import { useCategories } from "@/modules/categories/use-categories";
import { useCatalogSnapshot } from "@/modules/catalog/use-catalog-snapshot";
import type { CatalogProduct } from "@/modules/catalog/types";
import { usePreferences } from "@/modules/preferences/preferences-provider";
import { useProductReviewSummaries } from "@/modules/reviews/product-feedback";
import type { CategoryItem } from "@/modules/categories/types";

type FilterPanel = "parent" | "child" | "brand" | "sort" | null;

export default function CatalogScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ query?: string; parent?: string; brand?: string; sort?: string; category?: string | string[] }>();
  const initialQuery = typeof params.query === "string" ? params.query : "";
  const initialParent = typeof params.parent === "string" ? params.parent : "";
  const brandParamValue = Array.isArray(params.brand) ? params.brand.join(",") : typeof params.brand === "string" ? params.brand : "";
  const categoryParamValue = Array.isArray(params.category)
    ? params.category.join(",")
    : typeof params.category === "string"
      ? params.category
      : "";
  const initialBrand = useMemo(() => normalizeBrandFilters(brandParamValue), [brandParamValue]);
  const initialSort = normalizeCatalogSort(typeof params.sort === "string" ? params.sort : CATALOG_SORT.latest);
  const initialCategory = useMemo(() => normalizeCategoryFilters(categoryParamValue), [categoryParamValue]);

  const [searchText, setSearchText] = useState(initialQuery);
  const [selectedParent, setSelectedParent] = useState(initialParent);
  const [selectedBrands, setSelectedBrands] = useState(initialBrand);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [selectedChildren, setSelectedChildren] = useState(initialCategory);
  const [activePanel, setActivePanel] = useState<FilterPanel>(
    initialCategory.length ? "child" : initialParent ? "parent" : initialBrand.length ? "brand" : initialSort !== CATALOG_SORT.latest ? "sort" : null
  );
  const { recordSearch } = usePreferences();

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
      brand: selectedBrands.length ? selectedBrands : undefined,
      sort: selectedSort,
      categoryItems: categories.map((item) => ({ parent: item.label, children: item.children.map((child) => child.label) })),
    }),
    [categories, deferredQuery, selectedBrands, selectedChildren, selectedParent, selectedSort]
  );

  const { data, isLoading, error } = useCatalogSnapshot(query);
  const products = data?.products || [];
  const { data: reviewSummaries } = useProductReviewSummaries(products.map((product) => product.id));
  const fallbackCategoryOptions = useMemo<CategoryItem[]>(() => {
    const grouped = new Map<string, Set<string>>();
    (data?.products || []).forEach((product) => {
      const parentLabel = String(product.parentCategory || product.category || "").trim();
      if (!parentLabel) return;

      const currentChildren = grouped.get(parentLabel) || new Set<string>();
      const childLabel = String(product.childCategory || product.category || "").trim();
      if (childLabel && toFilterSlug(childLabel) !== toFilterSlug(parentLabel)) {
        currentChildren.add(childLabel);
      }
      grouped.set(parentLabel, currentChildren);
    });

    return Array.from(grouped.entries()).map(([label, children]) => ({
      id: `fallback-${toFilterSlug(label)}`,
      label,
      slug: toFilterSlug(label),
      imageUrl: null,
      children: Array.from(children).map((child) => ({
        label: child,
        slug: toFilterSlug(child),
      })),
    }));
  }, [data?.products]);

  const parentOptions = useMemo(() => (categories.length ? categories : fallbackCategoryOptions), [categories, fallbackCategoryOptions]);
  const selectedParentOption = parentOptions.find((item) => item.slug === toFilterSlug(selectedParent));
  const childOptions = selectedParentOption?.children || [];
  const brandOptions = useMemo(() => {
    const facetBrands = Array.isArray(data?.brands) ? data.brands : [];
    if (facetBrands.length) {
      return facetBrands;
    }

    return Array.from(new Set((data?.products || []).map((item) => item.brand).filter(Boolean)));
  }, [data?.brands, data?.products]);
  const totalCount = data?.total || products.length;
  const columnCount = width < 340 ? 1 : 2;

  const selectedParentLabel = selectedParentOption?.label || "Kategori";
  const selectedBrandLabel =
    selectedBrands.length === 1
      ? brandOptions.find((item) => toFilterSlug(item) === selectedBrands[0]) || "Marka"
      : selectedBrands.length
        ? `${selectedBrands.length} marka`
        : "Marka";
  const selectedChildLabels = childOptions.filter((item) => selectedChildren.includes(item.slug)).map((item) => item.label);
  const selectedChildLabel = selectedChildLabels.length === 1 ? selectedChildLabels[0] : selectedChildLabels.length ? `${selectedChildLabels.length} alt kategori` : "Alt kategori";
  const selectedSortLabel =
    selectedSort === CATALOG_SORT.priceAsc
      ? "Fiyat artan"
      : selectedSort === CATALOG_SORT.priceDesc
        ? "Fiyat azalan"
        : "Önerilen";

  const hasActiveFilters = Boolean(searchText.trim() || selectedParent || selectedBrands.length || selectedSort !== CATALOG_SORT.latest || selectedChildren.length);
  useEffect(() => {
    setSearchText(initialQuery);
    setSelectedParent(initialParent);
    setSelectedBrands(initialBrand);
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
    if (selectedBrands.length) nextParams.set("brand", selectedBrands.join(","));
    if (selectedSort !== CATALOG_SORT.latest) nextParams.set("sort", selectedSort);
    const href = nextParams.toString() ? `/catalog?${nextParams.toString()}` : "/catalog";
    router.replace(href as Href);
  };

  const resetFilters = () => {
    setSearchText("");
    setSelectedParent("");
    setSelectedChildren([]);
    setSelectedBrands([]);
    setSelectedSort(CATALOG_SORT.latest);
    setActivePanel(null);
    router.replace("/catalog");
  };

  const openPanel = (panel: Exclude<FilterPanel, null>) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const selectParent = (slug: string) => {
    const nextParent = toFilterSlug(selectedParent) === slug ? "" : slug;
    setSelectedParent(nextParent);
    setSelectedChildren([]);
    const nextParentOption = parentOptions.find((item) => item.slug === nextParent);
    setActivePanel(nextParent && nextParentOption?.children?.length ? "child" : null);
  };

  const selectChild = (slug: string) => {
    setSelectedChildren((current) => {
      const nextChildren = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
      return nextChildren;
    });
  };

  const selectBrand = (brand: string) => {
    const brandSlug = toFilterSlug(brand);
    setSelectedBrands((current) => (current.includes(brandSlug) ? current.filter((item) => item !== brandSlug) : [...current, brandSlug]));
  };

  const selectSort = (sort: typeof CATALOG_SORT[keyof typeof CATALOG_SORT]) => {
    setSelectedSort(sort);
    setActivePanel(null);
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
            <CommercePageHeader title="Katalog" meta={`${totalCount} ürün`} />

            <CommerceSearchBar
              value={searchText}
              onChangeText={setSearchText}
              onSubmit={commitSearch}
              testID="catalog-search-input"
            />

            <View style={[styles.filterBarCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <View style={styles.filterBar}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openPanel("parent")}
                  style={[styles.filterTrigger, styles.filterTriggerWide, activePanel === "parent" ? styles.filterTriggerActive : null]}
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
                      {selectedChildLabel}
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
                      {String(selectedBrandLabel)}
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
                  <Pressable accessibilityRole="button" onPress={resetFilters} style={[styles.clearTrigger, styles.filterTrigger]}>
                    <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                      Sıfırla
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>

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
                    <View style={styles.optionList}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => selectParent("")}
                        style={({ pressed }) => [
                          styles.optionRow,
                          !selectedParent ? styles.optionRowActive : null,
                          { opacity: pressed ? 0.9 : 1 },
                        ]}
                      >
                        <ThemedText type="smallBold">Tüm kategoriler</ThemedText>
                        {!selectedParent ? <Feather name="check" size={16} color={activeTenant.palette.primary} /> : null}
                      </Pressable>
                      {parentOptions.map((category) => (
                        <Pressable
                          key={category.id}
                          accessibilityRole="button"
                          onPress={() => selectParent(category.slug)}
                          style={({ pressed }) => [
                            styles.optionRow,
                            toFilterSlug(selectedParent) === category.slug ? styles.optionRowActive : null,
                            { opacity: pressed ? 0.9 : 1 },
                          ]}
                        >
                          <ThemedText type="smallBold" numberOfLines={1} style={styles.optionRowText}>
                            {category.label}
                          </ThemedText>
                          {toFilterSlug(selectedParent) === category.slug ? (
                            <Feather name="check" size={16} color={activeTenant.palette.primary} />
                          ) : null}
                        </Pressable>
                      ))}
                    </View>
                  ) : null}

                  {activePanel === "child" ? (
                    <View style={styles.optionList}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          setSelectedChildren([]);
                        }}
                        style={({ pressed }) => [
                          styles.optionRow,
                          !selectedChildren.length ? styles.optionRowActive : null,
                          { opacity: pressed ? 0.9 : 1 },
                        ]}
                      >
                        <ThemedText type="smallBold">Tüm alt kategoriler</ThemedText>
                        {!selectedChildren.length ? <Feather name="check" size={16} color={activeTenant.palette.primary} /> : null}
                      </Pressable>
                      {childOptions.map((category) => (
                        <Pressable
                          key={category.slug}
                          accessibilityRole="button"
                          onPress={() => selectChild(category.slug)}
                          style={({ pressed }) => [
                            styles.optionRow,
                            selectedChildren.includes(category.slug) ? styles.optionRowActive : null,
                            { opacity: pressed ? 0.9 : 1 },
                          ]}
                        >
                          <ThemedText type="smallBold" numberOfLines={1} style={styles.optionRowText}>
                            {category.label}
                          </ThemedText>
                          {selectedChildren.includes(category.slug) ? <Feather name="check" size={16} color={activeTenant.palette.primary} /> : null}
                        </Pressable>
                      ))}
                    </View>
                  ) : null}

                  {activePanel === "brand" ? (
                    <View style={styles.optionList}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          setSelectedBrands([]);
                        }}
                        style={({ pressed }) => [
                          styles.optionRow,
                          !selectedBrands.length ? styles.optionRowActive : null,
                          { opacity: pressed ? 0.9 : 1 },
                        ]}
                      >
                        <ThemedText type="smallBold">Tüm markalar</ThemedText>
                        {!selectedBrands.length ? <Feather name="check" size={16} color={activeTenant.palette.primary} /> : null}
                      </Pressable>
                      {brandOptions.map((brand) => (
                        <Pressable
                          key={brand}
                          accessibilityRole="button"
                          onPress={() => selectBrand(brand)}
                          style={({ pressed }) => [
                            styles.optionRow,
                            selectedBrands.includes(toFilterSlug(brand)) ? styles.optionRowActive : null,
                            { opacity: pressed ? 0.9 : 1 },
                          ]}
                        >
                          <ThemedText type="smallBold" numberOfLines={1} style={styles.optionRowText}>
                            {brand}
                          </ThemedText>
                          {selectedBrands.includes(toFilterSlug(brand)) ? (
                            <Feather name="check" size={16} color={activeTenant.palette.primary} />
                          ) : null}
                        </Pressable>
                      ))}
                    </View>
                  ) : null}

                  {activePanel === "sort" ? (
                    <View style={styles.optionList}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => selectSort(CATALOG_SORT.latest)}
                        style={({ pressed }) => [
                          styles.optionRow,
                          selectedSort === CATALOG_SORT.latest ? styles.optionRowActive : null,
                          { opacity: pressed ? 0.9 : 1 },
                        ]}
                      >
                        <ThemedText type="smallBold">Önerilen</ThemedText>
                        {selectedSort === CATALOG_SORT.latest ? <Feather name="check" size={16} color={activeTenant.palette.primary} /> : null}
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => selectSort(CATALOG_SORT.priceAsc)}
                        style={({ pressed }) => [
                          styles.optionRow,
                          selectedSort === CATALOG_SORT.priceAsc ? styles.optionRowActive : null,
                          { opacity: pressed ? 0.9 : 1 },
                        ]}
                      >
                        <ThemedText type="smallBold">Fiyat artan</ThemedText>
                        {selectedSort === CATALOG_SORT.priceAsc ? <Feather name="check" size={16} color={activeTenant.palette.primary} /> : null}
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => selectSort(CATALOG_SORT.priceDesc)}
                        style={({ pressed }) => [
                          styles.optionRow,
                          selectedSort === CATALOG_SORT.priceDesc ? styles.optionRowActive : null,
                          { opacity: pressed ? 0.9 : 1 },
                        ]}
                      >
                        <ThemedText type="smallBold">Fiyat azalan</ThemedText>
                        {selectedSort === CATALOG_SORT.priceDesc ? <Feather name="check" size={16} color={activeTenant.palette.primary} /> : null}
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

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
        renderItem={({ item }: { item: CatalogProduct }) => <ProductCard product={item} reviewSummary={reviewSummaries[item.id]} />}
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
    paddingHorizontal: 0,
    paddingTop: 4,
    paddingBottom: 30,
  },
  filterBarCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 12,
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    ...commerceShadow("#17324a", 10, 22, 0.04, 2),
  },
  filterBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterTrigger: {
    flexGrow: 1,
    flexBasis: "47%",
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
  filterTriggerWide: {
    flexBasis: "100%",
  },
  filterTriggerActive: {
    backgroundColor: "#eef6f2",
    borderColor: "#c5e1d1",
  },
  clearTrigger: {
    justifyContent: "center",
    backgroundColor: "#f7faf7",
    borderWidth: 1,
    borderColor: "#cfe0d3",
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
  optionList: {
    gap: 10,
  },
  optionRow: {
    minHeight: 46,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#dbe6ef",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  optionRowActive: {
    backgroundColor: "#eef6f2",
    borderColor: "#c5e1d1",
  },
  optionRowText: {
    flex: 1,
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
    gap: 12,
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

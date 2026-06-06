import { FlatList, StyleSheet, View } from "react-native";
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
  const params = useLocalSearchParams<{ query?: string; parent?: string; brand?: string; sort?: string }>();
  const initialQuery = typeof params.query === "string" ? params.query : "";
  const initialParent = typeof params.parent === "string" ? params.parent : "";
  const initialBrand = typeof params.brand === "string" ? params.brand : "";
  const initialSort = normalizeCatalogSort(typeof params.sort === "string" ? params.sort : CATALOG_SORT.latest);

  const [searchText, setSearchText] = useState(initialQuery);
  const [selectedParent, setSelectedParent] = useState(initialParent);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedSort, setSelectedSort] = useState(initialSort);
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
      brand: selectedBrand || undefined,
      sort: selectedSort,
      categoryItems: categories.map((item) => ({ parent: item.label, children: item.children.map((child) => child.label) })),
    }),
    [categories, deferredQuery, selectedBrand, selectedParent, selectedSort]
  );
  const { data, isLoading, error } = useCatalogSnapshot(query);
  const products = data?.products || [];
  const parentOptions = categories.slice(0, 10);
  const brandOptions = (data?.brands || []).slice(0, 10);
  const totalCount = data?.total || products.length;
  const activeFilterCount = [selectedParent, selectedBrand, selectedSort !== CATALOG_SORT.latest].filter(Boolean).length;
  const selectedParentLabel = parentOptions.find((item) => item.slug === toFilterSlug(selectedParent))?.label;
  const selectedBrandLabel = brandOptions.find((item) => toFilterSlug(item) === toFilterSlug(selectedBrand));
  const hasActiveFilters = Boolean(searchText.trim() || selectedParent || selectedBrand || selectedSort !== CATALOG_SORT.latest);

  useEffect(() => {
    setSearchText(initialQuery);
    setSelectedParent(initialParent);
    setSelectedBrand(initialBrand);
    setSelectedSort(initialSort);
  }, [initialBrand, initialParent, initialQuery, initialSort]);

  const commitSearch = () => {
    const nextQuery = searchText.trim();
    if (nextQuery) {
      recordSearch(nextQuery);
    }
    const nextParams = new URLSearchParams();
    if (nextQuery) nextParams.set("query", nextQuery);
    if (selectedParent) nextParams.set("parent", selectedParent);
    if (selectedBrand) nextParams.set("brand", selectedBrand);
    if (selectedSort !== CATALOG_SORT.latest) nextParams.set("sort", selectedSort);
    const href = nextParams.toString() ? `/catalog?${nextParams.toString()}` : "/catalog";
    router.replace(href as Href);
  };

  const resetFilters = () => {
    setSearchText("");
    setSelectedParent("");
    setSelectedBrand("");
    setSelectedSort(CATALOG_SORT.latest);
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
                    Akilli katalog
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
                Urunleri hizli bul, filtreleri tek bakista yonet
              </ThemedText>
              <ThemedText type="small" style={styles.heroDescription}>
                Kategori, marka ve fiyat siralamasi tek akista. Mobil vitrinde once sonucu, sonra filtreyi gor.
              </ThemedText>
              <View style={styles.heroMetrics}>
                <View style={styles.heroMetricCard}>
                  <ThemedText type="smallBold" style={styles.heroMetricValue}>
                    {totalCount}
                  </ThemedText>
                  <ThemedText type="small" style={styles.heroMetricLabel}>
                    urun listede
                  </ThemedText>
                </View>
                <View style={styles.heroMetricCard}>
                  <ThemedText type="smallBold" style={styles.heroMetricValue}>
                    {brandOptions.length}
                  </ThemedText>
                  <ThemedText type="small" style={styles.heroMetricLabel}>
                    marka secenegi
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

            <View style={[styles.summaryCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryCopy}>
                  <ThemedText type="smallBold">{totalCount} urun bulundu</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {selectedParentLabel
                      ? `${selectedParentLabel} altinda listeleniyor.`
                      : "Tum kategoriler acik, filtreyi istedigin an daraltabilirsin."}
                  </ThemedText>
                </View>
                {hasActiveFilters ? (
                  <PrimaryButton label="Sifirla" onPress={resetFilters} variant="outline" style={styles.resetButton} />
                ) : null}
              </View>
              <View style={styles.contextRow}>
                <View style={[styles.contextPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
                  <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                    {selectedBrandLabel || "Tum markalar"}
                  </ThemedText>
                </View>
                <View style={[styles.contextPill, { backgroundColor: "#f5efe7" }]}>
                  <ThemedText type="smallBold" style={{ color: activeTenant.palette.accent }}>
                    {selectedSort === CATALOG_SORT.priceAsc
                      ? "Fiyat artan"
                      : selectedSort === CATALOG_SORT.priceDesc
                        ? "Fiyat azalan"
                        : "Onerilen siralama"}
                  </ThemedText>
                </View>
              </View>
            </View>

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

            <View style={[styles.filterCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <SectionHeader title="Kategori filtreleri" />
              <View style={styles.chipGrid}>
                <FilterChip label="Tum urunler" active={!selectedParent} onPress={() => setSelectedParent("")} />
                {parentOptions.map((category) => (
                  <FilterChip
                    key={category.id}
                    label={category.label}
                    active={toFilterSlug(selectedParent) === category.slug}
                    onPress={() => setSelectedParent(toFilterSlug(selectedParent) === category.slug ? "" : category.slug)}
                  />
                ))}
              </View>
            </View>

            {brandOptions.length ? (
              <View style={[styles.filterCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
                <SectionHeader title="Markalar" />
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
              </View>
            ) : null}

            <View style={[styles.filterCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <SectionHeader title="Siralama" />
              <View style={styles.chipGrid}>
                <FilterChip compact label="Onerilen" active={selectedSort === CATALOG_SORT.latest} onPress={() => setSelectedSort(CATALOG_SORT.latest)} />
                <FilterChip compact label="Fiyat artan" active={selectedSort === CATALOG_SORT.priceAsc} onPress={() => setSelectedSort(CATALOG_SORT.priceAsc)} />
                <FilterChip compact label="Fiyat azalan" active={selectedSort === CATALOG_SORT.priceDesc} onPress={() => setSelectedSort(CATALOG_SORT.priceDesc)} />
              </View>
            </View>

            {isLoading ? (
              <View style={styles.inlineNotice}>
                <Feather name="loader" size={14} color={activeTenant.palette.primary} />
                <ThemedText type="small">Urunler yenileniyor...</ThemedText>
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
              <ThemedText type="small" themeColor="textSecondary">
                Arama kelimesini sadelestirip filtreleri temizleyerek tekrar dene.
              </ThemedText>
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
  heroDescription: {
    color: "#e7f7eb",
    maxWidth: 320,
  },
  heroMetrics: {
    flexDirection: "row",
    gap: 12,
  },
  heroMetricCard: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
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
  summaryCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryCopy: {
    flex: 1,
    gap: 4,
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
  filterCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
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

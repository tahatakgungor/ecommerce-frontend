import { FlatList, StyleSheet, View } from "react-native";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";

import { CommerceSearchBar } from "@/components/commerce-search-bar";
import { FilterChip } from "@/components/filter-chip";
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
            <View style={styles.header}>
              <ThemedText type="subtitle" style={styles.title}>
                Katalog
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Arama, parent kategori, marka ve fiyat odakli siralama tek ekranda.
              </ThemedText>
            </View>

            <CommerceSearchBar
              value={searchText}
              onChangeText={setSearchText}
              onSubmit={commitSearch}
              testID="catalog-search-input"
            />

            {preferences.personalization.recentSearches && preferences.recentSearches.length ? (
              <View style={styles.group}>
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

            <View style={styles.group}>
              <SectionHeader title="Kategori filtreleri" />
              <View style={styles.chipGrid}>
                <FilterChip
                  label="Tum urunler"
                  active={!selectedParent}
                  onPress={() => setSelectedParent("")}
                />
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
              <View style={styles.group}>
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

            <View style={styles.group}>
              <SectionHeader title="Siralama" />
              <View style={styles.chipGrid}>
                <FilterChip
                  compact
                  label="Onerilen"
                  active={selectedSort === CATALOG_SORT.latest}
                  onPress={() => setSelectedSort(CATALOG_SORT.latest)}
                />
                <FilterChip
                  compact
                  label="Fiyat artan"
                  active={selectedSort === CATALOG_SORT.priceAsc}
                  onPress={() => setSelectedSort(CATALOG_SORT.priceAsc)}
                />
                <FilterChip
                  compact
                  label="Fiyat azalan"
                  active={selectedSort === CATALOG_SORT.priceDesc}
                  onPress={() => setSelectedSort(CATALOG_SORT.priceDesc)}
                />
              </View>
            </View>

            <View style={[styles.statusCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <ThemedText type="smallBold">
                {data?.total || products.length} urun bulundu
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {selectedParent ? "Secili parent kategori uygulandi." : "Tum kategoriler listeleniyor."}
              </ThemedText>
            </View>

            {isLoading ? <ThemedText type="small">Urunler yukleniyor...</ThemedText> : null}
            {error ? <ThemedText type="small">{error}</ThemedText> : null}
          </View>
        }
        renderItem={({ item }: { item: CatalogProduct }) => <ProductCard product={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={[styles.emptyState, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <ThemedText type="smallBold">Sonuc bulunamadi</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Arama kelimesini sadelestirip filtreleri temizleyerek tekrar dene.
              </ThemedText>
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
  header: {
    gap: 8,
  },
  headerWrap: {
    gap: 14,
    marginBottom: 14,
  },
  group: {
    gap: 10,
  },
  title: {
    lineHeight: 38,
  },
  listContent: {
    padding: 20,
    paddingBottom: 28,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  separator: {
    height: 14,
  },
  columnWrap: {
    gap: 14,
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
});

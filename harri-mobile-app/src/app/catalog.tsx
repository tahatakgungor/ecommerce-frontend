import { FlatList, StyleSheet, View } from "react-native";

import { ProductCard } from "@/components/product-card";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useCatalogSnapshot } from "@/modules/catalog/use-catalog-snapshot";
import type { CatalogProduct } from "@/modules/catalog/types";

export default function CatalogScreen() {
  const { data, isLoading, error } = useCatalogSnapshot(1, 12);
  const products = data?.products || [];

  return (
    <ScreenShell scroll={false}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.header}>
              <ThemedText type="subtitle" style={styles.title}>
                Mobil katalog
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Hedef: filtre ve listeleme akisini mobil-first performans modeline tasimak.
              </ThemedText>
            </View>

            {data?.categories?.length ? (
              <View style={styles.chipGrid}>
                {data.categories.slice(0, 6).map((category: { parent: string; count: number }) => (
                  <View
                    key={category.parent}
                    style={[styles.chip, { backgroundColor: activeTenant.palette.primarySoft }]}
                  >
                    <ThemedText type="smallBold">
                      {category.parent} ({category.count})
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}

            {isLoading ? <ThemedText type="small">Urunler yukleniyor...</ThemedText> : null}
            {error ? <ThemedText type="small">{error}</ThemedText> : null}
          </View>
        }
        renderItem={({ item }: { item: CatalogProduct }) => <ProductCard product={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  separator: {
    height: 14,
  },
});

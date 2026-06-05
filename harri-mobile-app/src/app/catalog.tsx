import { StyleSheet, View } from "react-native";

import { ProductCard } from "@/components/product-card";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useCatalogSnapshot } from "@/modules/catalog/use-catalog-snapshot";

export default function CatalogScreen() {
  const { data, isLoading, error } = useCatalogSnapshot(1, 12);

  return (
    <ScreenShell>
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
          {data.categories.slice(0, 6).map((category) => (
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

      {data?.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  title: {
    lineHeight: 38,
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
});

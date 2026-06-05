import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";

import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useProductDetail } from "@/modules/catalog/use-product-detail";

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading, error } = useProductDetail(productId || "");

  if (!productId) {
    return (
      <ScreenShell>
        <ThemedText type="small">Urun kimligi eksik.</ThemedText>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      {isLoading ? <ThemedText type="small">Urun yukleniyor...</ThemedText> : null}
      {error ? <ThemedText type="small">{error}</ThemedText> : null}

      {data ? (
        <>
          <View style={[styles.hero, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            {data.imageUrl ? (
              <Image source={{ uri: data.imageUrl }} style={styles.heroImage} contentFit="cover" transition={120} />
            ) : (
              <View style={[styles.heroImage, styles.heroFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <ThemedText type="smallBold">{data.brand}</ThemedText>
              </View>
            )}
            <View style={styles.heroContent}>
              <ThemedText type="small" themeColor="textSecondary">
                {data.brand} / {data.category}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.title}>
                {data.title}
              </ThemedText>
              <ThemedText type="default" style={styles.price}>
                {data.priceText}
              </ThemedText>
              {data.discount > 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {data.originalPriceText} yerine %{data.discount} indirim
                </ThemedText>
              ) : null}
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Aciklama</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {data.description || "Bu urun icin aciklama mobil detay ekranina henuz baglanmadi."}
            </ThemedText>
          </View>

          <View style={styles.metaGrid}>
            <View style={[styles.metaCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <ThemedText type="smallBold">Stok</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {data.stockQuantity > 0 ? `${data.stockQuantity} adet` : "Stok bilgisi bekleniyor"}
              </ThemedText>
            </View>
            <View style={[styles.metaCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <ThemedText type="smallBold">SKU</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {data.sku || "Yok"}
              </ThemedText>
            </View>
          </View>

          {data.tags.length ? (
            <View style={styles.tagWrap}>
              {data.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: activeTenant.palette.primarySoft }]}>
                  <ThemedText type="smallBold">{tag}</ThemedText>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: 280,
  },
  heroFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    padding: 18,
    gap: 8,
  },
  title: {
    lineHeight: 38,
  },
  price: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: 700,
  },
  section: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 10,
  },
  metaGrid: {
    flexDirection: "row",
    gap: 12,
  },
  metaCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});

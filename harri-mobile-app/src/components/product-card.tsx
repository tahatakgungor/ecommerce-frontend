import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { activeTenant } from "@/domain/active-tenant";
import type { CatalogProduct } from "@/modules/catalog/types";
import { ThemedText } from "@/components/themed-text";

type ProductCardProps = {
  product: CatalogProduct;
  variant?: "grid" | "rail";
};

export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const router = useRouter();
  const isRail = variant === "rail";
  const showDiscount = product.discount > 0 && product.originalPrice > product.price;

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      testID={`product-card-${product.id}`}
      style={({ pressed }) => [
        styles.card,
        isRail ? styles.railCard : styles.gridCard,
        {
          backgroundColor: activeTenant.palette.surface,
          borderColor: activeTenant.palette.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.imageWrap, isRail ? styles.railImageWrap : styles.gridImageWrap]}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="cover" transition={120} />
        ) : (
          <View style={[styles.imageFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold">{product.brand}</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <ThemedText type="small" style={styles.meta} themeColor="textSecondary" numberOfLines={1}>
            {product.brand}
          </ThemedText>
          {showDiscount ? (
            <View style={[styles.badge, { backgroundColor: activeTenant.palette.primarySoft }]}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                %{product.discount}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText type="small" style={styles.category} themeColor="textSecondary" numberOfLines={1}>
          {product.category}
        </ThemedText>
        <ThemedText type="default" numberOfLines={2} style={styles.title}>
          {product.title}
        </ThemedText>
        <View style={styles.priceRow}>
          <ThemedText type="smallBold" style={styles.price}>
            {product.priceText}
          </ThemedText>
          {showDiscount ? (
            <ThemedText type="small" style={styles.originalPrice} themeColor="textSecondary">
              {product.originalPriceText}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  gridCard: {
    flex: 1,
  },
  railCard: {
    width: 210,
  },
  imageWrap: {
    backgroundColor: "#f7faf7",
  },
  gridImageWrap: {
    height: 156,
  },
  railImageWrap: {
    height: 136,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  content: {
    padding: 16,
    gap: 6,
    minHeight: 144,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  meta: {
    textTransform: "uppercase",
    letterSpacing: 0.4,
    flex: 1,
  },
  category: {
    minHeight: 20,
  },
  title: {
    lineHeight: 21,
    minHeight: 42,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 17,
  },
  originalPrice: {
    textDecorationLine: "line-through",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

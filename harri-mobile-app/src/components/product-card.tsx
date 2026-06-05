import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import { activeTenant } from "@/domain/active-tenant";
import type { CatalogProduct } from "@/modules/catalog/types";
import { ThemedText } from "@/components/themed-text";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
      <View style={styles.imageWrap}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="cover" transition={120} />
        ) : (
          <View style={[styles.imageFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold">{product.brand}</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <ThemedText type="small" style={styles.meta} themeColor="textSecondary">
          {product.brand} / {product.category}
        </ThemedText>
        <ThemedText type="default" numberOfLines={2} style={styles.title}>
          {product.title}
        </ThemedText>
        <ThemedText type="smallBold" style={styles.price}>
          {product.priceText}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  imageWrap: {
    height: 170,
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
    gap: 8,
  },
  meta: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    lineHeight: 22,
  },
  price: {
    marginTop: 2,
  },
});

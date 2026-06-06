import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";
import { useCart } from "@/modules/cart/cart-provider";
import type { CatalogProduct } from "@/modules/catalog/types";
import { useWishlist } from "@/modules/wishlist/wishlist-provider";
import { PrimaryButton } from "@/components/primary-button";
import { ThemedText } from "@/components/themed-text";

type ProductCardProps = {
  product: CatalogProduct;
  variant?: "grid" | "rail";
};

export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { hasItem, toggleItem } = useWishlist();
  const [hasImageError, setHasImageError] = useState(false);
  const isRail = variant === "rail";
  const showDiscount = product.discount > 0 && product.originalPrice > product.price;
  const isWishlisted = hasItem(product.id);
  const canRenderImage = Boolean(product.imageUrl) && !hasImageError;
  const stockState = product.stockQuantity > 10 ? "Stokta" : product.stockQuantity > 0 ? "Son adetler" : "Teyit bekliyor";
  const stockTone = product.stockQuantity > 0 ? activeTenant.palette.primary : activeTenant.palette.accent;
  const stockBackground = product.stockQuantity > 0 ? "#eef7f0" : "#f8efe8";

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
        {showDiscount ? (
          <View style={[styles.discountRibbon, { backgroundColor: activeTenant.palette.accent }]}>
            <ThemedText type="smallBold" style={styles.discountRibbonText}>
              %{product.discount}
            </ThemedText>
          </View>
        ) : null}
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            toggleItem(product);
          }}
          testID={`wishlist-toggle-${product.id}`}
          style={[
            styles.wishlistButton,
            {
              backgroundColor: isWishlisted ? activeTenant.palette.primary : "rgba(255,255,255,0.96)",
              borderColor: isWishlisted ? activeTenant.palette.primary : activeTenant.palette.border,
            },
          ]}
        >
          <Feather name={isWishlisted ? "heart" : "bookmark"} size={14} color={isWishlisted ? "#ffffff" : activeTenant.palette.text} />
        </Pressable>
        {canRenderImage ? (
          <Image
            source={{ uri: product.imageUrl || undefined }}
            style={styles.image}
            contentFit="cover"
            transition={120}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <View style={[styles.imageFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold">{product.brand}</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <ThemedText type="smallBold" style={styles.brand} numberOfLines={1}>
          {product.brand}
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
        <View style={styles.assuranceRow}>
          <View style={[styles.stockPill, { backgroundColor: stockBackground }]}>
            <ThemedText type="smallBold" style={{ color: stockTone }}>
              {stockState}
            </ThemedText>
          </View>
        </View>
        <View style={styles.footerRow}>
          <PrimaryButton
            label="Sepete At"
            onPress={(event) => {
              event?.stopPropagation();
              addItem(product, 1);
            }}
            testID={`product-card-add-${product.id}`}
            style={styles.addButton}
          />
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
    ...commerceShadow("#1f221f", 10, 20, 0.06, 2),
  },
  gridCard: {
    flex: 1,
    minHeight: 334,
  },
  railCard: {
    width: 206,
    minHeight: 320,
  },
  imageWrap: {
    backgroundColor: "#f7f6f2",
    position: "relative",
  },
  gridImageWrap: {
    height: 164,
  },
  railImageWrap: {
    height: 148,
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
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 8,
    minHeight: 156,
  },
  brand: {
    color: activeTenant.palette.text,
  },
  title: {
    lineHeight: 21,
    minHeight: 46,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 19,
  },
  originalPrice: {
    textDecorationLine: "line-through",
  },
  assuranceRow: {
    minHeight: 32,
  },
  footerRow: {
    marginTop: "auto",
    gap: 10,
  },
  addButton: {
    width: "100%",
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  stockPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  wishlistButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    width: 34,
    height: 34,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    ...commerceShadow("#142117", 6, 14, 0.1, 2),
  },
  discountRibbon: {
    position: "absolute",
    left: 12,
    top: 12,
    zIndex: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  discountRibbonText: {
    color: "#ffffff",
  },
});

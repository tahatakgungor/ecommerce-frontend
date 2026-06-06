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
        <View style={styles.metaRow}>
          <View style={[styles.brandPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }} numberOfLines={1}>
              {product.brand}
            </ThemedText>
          </View>
          <View style={[styles.deliveryPill, { backgroundColor: "#fff4e8" }]}>
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.accent }}>
              {product.stockQuantity > 0 ? "Hizli teslim" : "Tedarik"}
            </ThemedText>
          </View>
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
        <View style={styles.footerRow}>
          <View style={[styles.stockPill, { backgroundColor: product.stockQuantity > 0 ? "#eef7f0" : "#f5efe7" }]}>
            <ThemedText
              type="smallBold"
              style={{ color: product.stockQuantity > 0 ? activeTenant.palette.primary : activeTenant.palette.accent }}
            >
              {stockState}
            </ThemedText>
          </View>
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
    borderRadius: 28,
    overflow: "hidden",
    ...commerceShadow("#2a1a10", 14, 28, 0.08, 3),
  },
  gridCard: {
    flex: 1,
  },
  railCard: {
    width: 224,
  },
  imageWrap: {
    backgroundColor: "#f7f6f2",
    position: "relative",
  },
  gridImageWrap: {
    height: 168,
  },
  railImageWrap: {
    height: 150,
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
    gap: 9,
    minHeight: 164,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  brandPill: {
    maxWidth: "72%",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deliveryPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  category: {
    minHeight: 20,
  },
  title: {
    lineHeight: 23,
    minHeight: 44,
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
    fontSize: 20,
  },
  originalPrice: {
    textDecorationLine: "line-through",
  },
  footerRow: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  stockPill: {
    flexShrink: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addButton: {
    minHeight: 42,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  wishlistButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    ...commerceShadow("#142117", 8, 18, 0.12, 3),
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

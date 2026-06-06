import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";
import { useCart } from "@/modules/cart/cart-provider";
import type { CatalogProduct } from "@/modules/catalog/types";
import type { ProductReviewSummary } from "@/modules/reviews/product-feedback";
import { useWishlist } from "@/modules/wishlist/wishlist-provider";
import { ProductRatingStrip } from "@/components/product-rating-strip";
import { ThemedText } from "@/components/themed-text";

type ProductCardProps = {
  product: CatalogProduct;
  variant?: "grid" | "rail";
  reviewSummary?: ProductReviewSummary;
};

const emptyReviewSummary: ProductReviewSummary = {
  averageRating: 0,
  totalReviews: 0,
};

export function ProductCard({ product, variant = "grid", reviewSummary = emptyReviewSummary }: ProductCardProps) {
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
  const categoryLine = product.parentCategory || product.category;

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
        <View style={styles.imageWash} />
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
        <View style={styles.topMetaRow}>
          <ThemedText type="smallBold" style={styles.brand} numberOfLines={1}>
            {product.brand}
          </ThemedText>
          {categoryLine ? (
            <View style={[styles.categoryPill, { backgroundColor: "#f6f9fc" }]}>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.category}>
                {categoryLine}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText type="default" numberOfLines={2} style={styles.title}>
          {product.title}
        </ThemedText>
        <ProductRatingStrip averageRating={reviewSummary.averageRating} totalReviews={reviewSummary.totalReviews} compact />
        <View style={styles.priceRow}>
          <View style={styles.priceStack}>
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
        <View style={styles.metaRow}>
          <View style={[styles.stockPill, { backgroundColor: stockBackground }]}>
            <ThemedText type="smallBold" style={{ color: stockTone }}>
              {stockState}
            </ThemedText>
          </View>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              addItem(product, 1);
            }}
            testID={`product-card-add-${product.id}`}
            style={({ pressed }) => [
              styles.miniCartButton,
              {
                backgroundColor: activeTenant.palette.primary,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <Feather name="shopping-cart" size={16} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 26,
    overflow: "hidden",
    ...commerceShadow("#17324a", 12, 24, 0.07, 2),
  },
  gridCard: {
    flex: 1,
    minHeight: 298,
  },
  railCard: {
    width: 214,
    minHeight: 308,
  },
  imageWrap: {
    backgroundColor: "#f3f8fb",
    position: "relative",
  },
  imageWash: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(255,255,255,0.18)",
    zIndex: 0,
  },
  gridImageWrap: {
    height: 138,
  },
  railImageWrap: {
    height: 144,
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
    paddingTop: 12,
    paddingBottom: 14,
    gap: 8,
    minHeight: 150,
  },
  topMetaRow: {
    gap: 6,
    alignItems: "flex-start",
  },
  brand: {
    color: activeTenant.palette.primary,
    letterSpacing: 0.3,
  },
  categoryPill: {
    maxWidth: "78%",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  category: {
    marginTop: -1,
  },
  title: {
    lineHeight: 20,
    minHeight: 42,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    flexWrap: "wrap",
  },
  priceStack: {
    gap: 2,
  },
  price: {
    fontSize: 18,
  },
  originalPrice: {
    textDecorationLine: "line-through",
  },
  metaRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  stockPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  miniCartButton: {
    marginLeft: "auto",
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...commerceShadow("#0f2f18", 10, 20, 0.16, 3),
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
    ...commerceShadow("#17324a", 8, 16, 0.08, 2),
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

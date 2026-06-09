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

export function ProductCard({ product, variant = "grid", reviewSummary }: ProductCardProps) {
  const router = useRouter();
  const { addItem, getItemQuantity } = useCart();
  const { hasItem, toggleItem } = useWishlist();
  const [hasImageError, setHasImageError] = useState(false);
  const isRail = variant === "rail";
  const showDiscount = product.discount > 0 && product.originalPrice > product.price;
  const isWishlisted = hasItem(product.id);
  const canRenderImage = Boolean(product.imageUrl) && !hasImageError;
  const stockState = product.stockQuantity > 10 ? "Stokta" : product.stockQuantity > 0 ? "Son adetler" : "Teyit bekliyor";
  const stockTone = product.stockQuantity > 0 ? activeTenant.palette.primary : activeTenant.palette.accent;
  const stockBackground = product.stockQuantity > 0 ? "#eef7f0" : "#f8efe8";
  const quantityInCart = getItemQuantity(product.id);
  const resolvedReviewSummary = reviewSummary || {
    averageRating: product.averageRating || 0,
    totalReviews: product.totalReviews || 0,
  };

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
          opacity: pressed ? 0.94 : 1,
          transform: [{ scale: pressed ? 0.988 : 1 }],
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
        <View style={styles.contentTop}>
          <View style={styles.topMetaRow}>
            <ThemedText type="smallBold" style={styles.brand} numberOfLines={1}>
              {product.brand}
            </ThemedText>
          </View>
          <ThemedText type="default" numberOfLines={2} style={styles.title}>
            {product.title}
          </ThemedText>
          <View style={styles.ratingWrap}>
            <ProductRatingStrip
              averageRating={resolvedReviewSummary.averageRating}
              totalReviews={resolvedReviewSummary.totalReviews}
              compact
              onPressCount={() =>
                router.push({
                  pathname: "/product/[id]",
                  params: { id: product.id, section: "reviews" },
                } as never)
              }
            />
          </View>
        </View>
        <View style={styles.contentBottom}>
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
            <View style={styles.actionGroup}>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  addItem(product, 1);
                }}
                testID={`product-card-add-${product.id}`}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.cartActionButton,
                  quantityInCart > 0 ? styles.cartActionButtonActive : null,
                  {
                    opacity: pressed ? 0.96 : 1,
                    transform: [{ scale: pressed ? 0.93 : 1 }],
                  },
                ]}
              >
                <Feather name="shopping-cart" size={16} color="#ffffff" />
                {quantityInCart > 0 ? (
                  <View style={styles.cartBadge}>
                    <ThemedText type="smallBold" style={styles.cartBadgeText}>
                      {quantityInCart > 9 ? "9+" : quantityInCart}
                    </ThemedText>
                  </View>
                ) : null}
              </Pressable>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  toggleItem(product);
                }}
                testID={`wishlist-toggle-${product.id}`}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.wishlistActionButton,
                  isWishlisted ? styles.wishlistActionButtonActive : null,
                  {
                    opacity: pressed ? 0.96 : 1,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                  },
                ]}
              >
                <Feather name="heart" size={15} color={isWishlisted ? "#ffffff" : activeTenant.palette.primary} />
              </Pressable>
            </View>
          </View>
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
    minHeight: 156,
    flex: 1,
  },
  contentTop: {
    gap: 8,
  },
  contentBottom: {
    marginTop: "auto",
    gap: 10,
  },
  topMetaRow: {
    alignItems: "flex-start",
  },
  brand: {
    color: activeTenant.palette.primary,
    letterSpacing: 0.3,
  },
  title: {
    lineHeight: 20,
    minHeight: 48,
    fontWeight: "700",
  },
  ratingWrap: {
    minHeight: 18,
    justifyContent: "center",
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
  actionGroup: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionButton: {
    height: 42,
    width: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cartActionButton: {
    backgroundColor: activeTenant.palette.primary,
    borderColor: activeTenant.palette.primary,
    ...commerceShadow("#0f2f18", 10, 20, 0.16, 3),
  },
  cartActionButtonActive: {
    backgroundColor: "#135f38",
    borderColor: "#135f38",
  },
  wishlistActionButton: {
    backgroundColor: activeTenant.palette.primarySoft,
    borderColor: "#cfe1d3",
    ...commerceShadow("#167c49", 10, 22, 0.08, 2),
  },
  wishlistActionButtonActive: {
    backgroundColor: activeTenant.palette.primary,
    borderColor: activeTenant.palette.primary,
    ...commerceShadow("#0f2f18", 10, 20, 0.16, 3),
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: activeTenant.palette.accent,
  },
  cartBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    lineHeight: 11,
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

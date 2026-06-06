import { Pressable, Share, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/primary-button";
import { ProductRatingStrip } from "@/components/product-rating-strip";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";
import { useCart } from "@/modules/cart/cart-provider";
import { useProductDetail } from "@/modules/catalog/use-product-detail";
import { usePreferences } from "@/modules/preferences/preferences-provider";
import { useProductReviewSummary, useProductReviews } from "@/modules/reviews/product-feedback";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";
import { useWishlist } from "@/modules/wishlist/wishlist-provider";

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading, error } = useProductDetail(productId || "");
  const { data: siteSettings } = useSiteSettings();
  const { addItem, getItemQuantity } = useCart();
  const { recordViewedProduct } = usePreferences();
  const { hasItem, toggleItem } = useWishlist();
  const { data: reviewSummary, isLoading: isSummaryLoading } = useProductReviewSummary(productId || "");
  const { data: reviews, isLoading: isReviewsLoading, error: reviewsError } = useProductReviews(productId || "", 4);
  const [quantity, setQuantity] = useState(1);
  const [hasImageError, setHasImageError] = useState(false);
  const quantityInCart = getItemQuantity(productId || "");
  const resolvedReviewSummary = useMemo(
    () => ({
      averageRating: reviewSummary.averageRating || data?.averageRating || 0,
      totalReviews: reviewSummary.totalReviews || data?.totalReviews || 0,
    }),
    [data?.averageRating, data?.totalReviews, reviewSummary.averageRating, reviewSummary.totalReviews]
  );

  const mediaGallery = useMemo(() => [...new Set([data?.imageUrl, ...(data?.gallery || [])].filter(Boolean))], [data?.gallery, data?.imageUrl]);
  const remainingForFreeShipping = Math.max(0, (siteSettings.freeShippingThreshold || 0) - ((data?.price || 0) * quantity));

  useEffect(() => {
    if (!data) return;
    recordViewedProduct(data);
  }, [data?.id, recordViewedProduct]);

  useEffect(() => {
    setHasImageError(false);
  }, [data?.id]);

  const handleShare = async () => {
    if (!data) return;
    const shareUrl = `https://serravit.com/product-details/${data.id}`;
    try {
      await Share.share({
        title: data.title,
        message: `${data.title} - ${shareUrl}`,
        url: shareUrl,
      });
    } catch {
      // Native share sheet iptal edilirse sessiz kal.
    }
  };

  if (!productId) {
    return (
      <ScreenShell>
        <ThemedText type="small">Ürün kimliği eksik.</ThemedText>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      {isLoading ? <ThemedText type="small">Ürün yükleniyor...</ThemedText> : null}
      {error ? <ThemedText type="small">{error}</ThemedText> : null}

      {data ? (
        <>
          <View style={[styles.mediaCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.mediaTopRow}>
              <View style={styles.metaCopy}>
                <ThemedText type="smallBold" style={styles.brand}>
                  {data.brand}
                </ThemedText>
                <ThemedText type="subtitle">{data.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {data.parentCategory || data.category}
                </ThemedText>
              </View>
              <View style={styles.topActionRow}>
                <Pressable
                  onPress={handleShare}
                  testID="product-share"
                  style={({ pressed }) => [
                    styles.saveButton,
                    {
                      backgroundColor: activeTenant.palette.surface,
                      borderColor: activeTenant.palette.border,
                      opacity: pressed ? 0.92 : 1,
                      transform: [{ scale: pressed ? 0.94 : 1 }],
                    },
                  ]}
                >
                  <Feather name="share-2" size={16} color={activeTenant.palette.primary} />
                </Pressable>
                <Pressable
                  onPress={() => toggleItem(data)}
                  testID="product-toggle-wishlist"
                  style={({ pressed }) => [
                    styles.saveButton,
                    {
                      backgroundColor: hasItem(data.id) ? activeTenant.palette.primarySoft : activeTenant.palette.surface,
                      borderColor: activeTenant.palette.primary,
                      opacity: pressed ? 0.92 : 1,
                      transform: [{ scale: pressed ? 0.94 : 1 }],
                    },
                  ]}
                >
                  <Feather name={hasItem(data.id) ? "heart" : "bookmark"} size={16} color={activeTenant.palette.primary} />
                </Pressable>
              </View>
            </View>

            {data.imageUrl && !hasImageError ? (
              <Image
                source={{ uri: data.imageUrl }}
                style={styles.heroImage}
                contentFit="cover"
                transition={120}
                onError={() => setHasImageError(true)}
              />
            ) : (
              <View style={[styles.heroImage, styles.heroFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <ThemedText type="smallBold">{data.brand}</ThemedText>
              </View>
            )}

            <View style={styles.inlineRow}>
              <View style={[styles.inlinePill, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  {data.priceText}
                </ThemedText>
              </View>
              {data.discount > 0 ? (
                <View style={[styles.inlinePill, { backgroundColor: "#f5efe7" }]}>
                  <ThemedText type="smallBold" style={{ color: activeTenant.palette.accent }}>
                    %{data.discount} indirim
                  </ThemedText>
                </View>
              ) : null}
              <View style={[styles.inlinePill, { backgroundColor: "#f7faf7" }]}>
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  {data.stockQuantity > 0 ? "Stokta" : "Stok sor"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.ratingBlock}>
              <ProductRatingStrip averageRating={resolvedReviewSummary.averageRating} totalReviews={resolvedReviewSummary.totalReviews} />
              {isSummaryLoading ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Değerlendirmeler yükleniyor...
                </ThemedText>
              ) : null}
            </View>

            {mediaGallery.length > 1 ? (
              <View style={styles.galleryRail}>
                {mediaGallery.slice(0, 4).map((imageUrl) => (
                  <View key={imageUrl} style={[styles.galleryThumbWrap, { borderColor: activeTenant.palette.border }]}>
                    <Image source={{ uri: imageUrl || undefined }} style={styles.galleryThumb} contentFit="cover" transition={120} />
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Kısa bilgi</ThemedText>
            <View style={styles.infoRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Fiyat
              </ThemedText>
              <ThemedText type="smallBold">
                {data.discount > 0 ? `${data.originalPriceText} yerine ${data.priceText}` : data.priceText}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Kargo
              </ThemedText>
              <ThemedText type="smallBold">
                {remainingForFreeShipping > 0 ? `${Math.ceil(remainingForFreeShipping)} TL sonra ücretsiz` : "Ücretsiz kargo aktif"}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Stok
              </ThemedText>
              <ThemedText type="smallBold">
                {data.stockQuantity > 0 ? `${data.stockQuantity} adet` : "Teyit gerekli"}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Satın alma</ThemedText>
            <View style={styles.purchaseRow}>
              <View style={styles.stepper}>
                <PrimaryButton
                  label="-"
                  onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                  testID="product-quantity-decrease"
                  variant="outline"
                  style={styles.qtyButton}
                />
                <View style={styles.qtyPill}>
                  <ThemedText type="smallBold">{quantity} adet</ThemedText>
                </View>
                <PrimaryButton
                  label="+"
                  onPress={() =>
                    setQuantity((current) => {
                      const max = data.stockQuantity > 0 ? data.stockQuantity : current + 1;
                      return Math.min(current + 1, max);
                    })
                  }
                  testID="product-quantity-increase"
                  variant="outline"
                  style={styles.qtyButton}
                />
              </View>
              <View style={styles.purchaseActionRow}>
                <PrimaryButton
                  label="Sepete ekle"
                  onPress={() => addItem(data, quantity)}
                  testID="product-add-to-cart"
                  style={styles.addToCartButton}
                />
                <Pressable
                  onPress={() => router.push("/cart")}
                  style={({ pressed }) => [
                    styles.cartStateButton,
                    {
                      backgroundColor: activeTenant.palette.surface,
                      borderColor: activeTenant.palette.border,
                      opacity: pressed ? 0.92 : 1,
                      transform: [{ scale: pressed ? 0.94 : 1 }],
                    },
                  ]}
                >
                  <Feather name="shopping-bag" size={18} color={activeTenant.palette.primary} />
                  {quantityInCart > 0 ? (
                    <View style={styles.cartStateBadge}>
                      <ThemedText type="smallBold" style={styles.cartStateBadgeText}>
                        {quantityInCart}
                      </ThemedText>
                    </View>
                  ) : null}
                </Pressable>
              </View>
            </View>
            <View style={styles.purchaseFooter}>
              <ThemedText type="small" themeColor="textSecondary">
                {quantityInCart > 0 ? `Sepetinde bu üründen ${quantityInCart} adet var.` : "Adedi seçip doğrudan sepete ekleyebilirsin."}
              </ThemedText>
              <Pressable
                onPress={() => router.push("/checkout")}
                style={({ pressed }) => [styles.checkoutLink, { opacity: pressed ? 0.82 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
              >
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  Ödemeye geç
                </ThemedText>
                <Feather name="arrow-right" size={15} color={activeTenant.palette.primary} />
              </Pressable>
            </View>
          </View>

          {data.tags.length ? (
            <View style={styles.tagWrap}>
              {data.tags.map((tag: string) => (
                <View key={tag} style={[styles.tag, { backgroundColor: activeTenant.palette.primarySoft }]}>
                  <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                    {tag}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.reviewHeader}>
              <ThemedText type="smallBold">Yorumlar</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {resolvedReviewSummary.totalReviews > 0 ? `${resolvedReviewSummary.totalReviews} değerlendirme` : "Henüz yorum yok"}
              </ThemedText>
            </View>

            {isReviewsLoading ? (
              <ThemedText type="small" themeColor="textSecondary">
                Yorumlar hazırlanıyor...
              </ThemedText>
            ) : null}

            {reviewsError ? (
              <ThemedText type="small" themeColor="textSecondary">
                {reviewsError}
              </ThemedText>
            ) : null}

            {!isReviewsLoading && !reviews.length ? (
              <ThemedText type="small" themeColor="textSecondary">
                {resolvedReviewSummary.totalReviews > 0
                  ? "Yorumlar şu anda yüklenemedi."
                  : "Bu ürün için ilk yorumu sen bırakabilirsin."}
              </ThemedText>
            ) : null}

            {reviews.map((review) => (
              <View key={review.reviewId} style={[styles.reviewCard, { borderColor: activeTenant.palette.border }]}>
                <View style={styles.reviewTopRow}>
                  <View style={styles.reviewMeta}>
                    <ThemedText type="smallBold">{review.userName}</ThemedText>
                    <ProductRatingStrip averageRating={review.rating} totalReviews={1} compact showCount={false} />
                  </View>
                  <View style={styles.reviewDateWrap}>
                    {review.verifiedPurchase ? (
                      <View style={[styles.verifiedPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
                        <Feather name="check-circle" size={12} color={activeTenant.palette.primary} />
                        <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                          Doğrulandı
                        </ThemedText>
                      </View>
                    ) : null}
                    {review.createdAtText ? (
                      <ThemedText type="small" themeColor="textSecondary">
                        {review.createdAtText}
                      </ThemedText>
                    ) : null}
                  </View>
                </View>
                {review.commentTitle ? (
                  <ThemedText type="smallBold" style={styles.reviewTitle}>
                    {review.commentTitle}
                  </ThemedText>
                ) : null}
                {review.commentBody ? (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.reviewBody}>
                    {review.commentBody}
                  </ThemedText>
                ) : null}
              </View>
            ))}
          </View>
        </>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  mediaCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    overflow: "hidden",
    ...commerceShadow("#102117", 12, 22, 0.06, 2),
  },
  mediaTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  topActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaCopy: {
    flex: 1,
    gap: 4,
  },
  brand: {
    color: activeTenant.palette.primary,
  },
  saveButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1.3,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    height: 300,
    borderRadius: 20,
  },
  heroFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  inlineRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  inlinePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ratingBlock: {
    gap: 6,
  },
  galleryRail: {
    flexDirection: "row",
    gap: 10,
  },
  galleryThumbWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
  },
  galleryThumb: {
    width: "100%",
    height: "100%",
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  purchaseRow: {
    gap: 12,
  },
  purchaseActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyButton: {
    width: 44,
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 0,
  },
  qtyPill: {
    minWidth: 84,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#f7faf7",
    alignItems: "center",
  },
  addToCartButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
  },
  cartStateButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cartStateBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: activeTenant.palette.accent,
  },
  cartStateBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    lineHeight: 11,
  },
  purchaseFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  checkoutLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 8,
    backgroundColor: "#fbfdfb",
  },
  reviewTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  reviewMeta: {
    flex: 1,
    gap: 4,
  },
  reviewDateWrap: {
    alignItems: "flex-end",
    gap: 6,
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  reviewTitle: {
    lineHeight: 20,
  },
  reviewBody: {
    lineHeight: 21,
  },
});

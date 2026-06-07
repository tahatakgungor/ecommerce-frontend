import { FlatList, Modal, Pressable, Share, StyleSheet, View, useWindowDimensions, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { useWishlist } from "@/modules/wishlist/wishlist-provider";

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; section?: string | string[] }>();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;
  const focusSection = Array.isArray(params.section) ? params.section[0] : params.section;
  const { data, isLoading, error } = useProductDetail(productId || "");
  const { addItem, getItemQuantity } = useCart();
  const { recordViewedProduct } = usePreferences();
  const { hasItem, toggleItem } = useWishlist();
  const { data: reviewSummary, isLoading: isSummaryLoading } = useProductReviewSummary(productId || "");
  const { data: reviews, isLoading: isReviewsLoading, error: reviewsError } = useProductReviews(productId || "", 4);
  const [quantity, setQuantity] = useState(1);
  const [hasImageError, setHasImageError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [reviewSectionY, setReviewSectionY] = useState<number | null>(null);
  const galleryPagerRef = useRef<FlatList<string> | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const hasHandledReviewFocusRef = useRef(false);
  const pendingReviewScrollRef = useRef(false);
  const { width } = useWindowDimensions();
  const quantityInCart = getItemQuantity(productId || "");
  const resolvedReviewSummary = useMemo(
    () => ({
      averageRating: reviewSummary.averageRating || data?.averageRating || 0,
      totalReviews: reviewSummary.totalReviews || data?.totalReviews || 0,
    }),
    [data?.averageRating, data?.totalReviews, reviewSummary.averageRating, reviewSummary.totalReviews]
  );

  const mediaGallery = useMemo(
    () => [...new Set([data?.imageUrl, ...(data?.gallery || [])].filter((item): item is string => typeof item === "string" && item.length > 0))],
    [data?.gallery, data?.imageUrl]
  );
  const activeImage = mediaGallery[selectedImageIndex] || data?.imageUrl || null;

  useEffect(() => {
    if (!data) return;
    recordViewedProduct(data);
  }, [data?.id, recordViewedProduct]);

  useEffect(() => {
    setHasImageError(false);
    setSelectedImageIndex(0);
    setGalleryIndex(0);
    setIsGalleryOpen(false);
    setReviewSectionY(null);
    hasHandledReviewFocusRef.current = false;
    pendingReviewScrollRef.current = false;
  }, [data?.id]);

  const scrollToReviews = () => {
    if (reviewSectionY == null) {
      pendingReviewScrollRef.current = true;
      return;
    }

    pendingReviewScrollRef.current = false;
    hasHandledReviewFocusRef.current = true;
    scrollRef.current?.scrollTo({
      x: 0,
      y: Math.max(reviewSectionY - 18, 0),
      animated: true,
    });
  };

  useEffect(() => {
    if (focusSection !== "reviews" || hasHandledReviewFocusRef.current) {
      return;
    }

    scrollToReviews();
  }, [focusSection, reviewSectionY]);

  const openGalleryAt = (index: number) => {
    const safeIndex = Math.max(0, Math.min(index, Math.max(mediaGallery.length - 1, 0)));
    setSelectedImageIndex(safeIndex);
    setGalleryIndex(safeIndex);
    setIsGalleryOpen(true);
    requestAnimationFrame(() => {
      galleryPagerRef.current?.scrollToIndex({ index: safeIndex, animated: false });
    });
  };

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
    <ScreenShell scrollRef={scrollRef}>
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

            <Pressable
              onPress={() => {
                if (mediaGallery.length) {
                  openGalleryAt(selectedImageIndex);
                }
              }}
              disabled={!mediaGallery.length}
              style={({ pressed }) => [{ opacity: pressed ? 0.96 : 1 }]}
            >
              {activeImage && !hasImageError ? (
                <Image
                  source={{ uri: activeImage }}
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
            </Pressable>

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
              <ProductRatingStrip
                averageRating={resolvedReviewSummary.averageRating}
                totalReviews={resolvedReviewSummary.totalReviews}
                onPressCount={scrollToReviews}
              />
              {isSummaryLoading ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Değerlendirmeler yükleniyor...
                </ThemedText>
              ) : null}
            </View>

            {mediaGallery.length > 1 ? (
              <View style={styles.galleryRail}>
                {mediaGallery.map((imageUrl, index) => (
                  <Pressable
                    key={`${imageUrl}-${index}`}
                    onPress={() => {
                      setSelectedImageIndex(index);
                      openGalleryAt(index);
                    }}
                    style={[
                      styles.galleryThumbWrap,
                      {
                        borderColor: selectedImageIndex === index ? activeTenant.palette.primary : activeTenant.palette.border,
                        backgroundColor: selectedImageIndex === index ? activeTenant.palette.primarySoft : activeTenant.palette.surface,
                      },
                    ]}
                  >
                    <Image source={{ uri: imageUrl || undefined }} style={styles.galleryThumb} contentFit="cover" transition={120} />
                  </Pressable>
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
              <ThemedText type="smallBold">Ücretsiz kargo</ThemedText>
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

          <View
            style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
            onLayout={(event) => {
              setReviewSectionY(event.nativeEvent.layout.y);
            }}
          >
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

      {data && mediaGallery.length ? (
        <Modal visible={isGalleryOpen} transparent animationType="fade" onRequestClose={() => setIsGalleryOpen(false)}>
          <View style={styles.lightboxOverlay}>
            <View style={styles.lightboxTopBar}>
              <Pressable onPress={() => setIsGalleryOpen(false)} style={styles.lightboxIconButton}>
                <Feather name="x" size={22} color="#ffffff" />
              </Pressable>
              <ThemedText type="smallBold" style={styles.lightboxCounter}>
                {galleryIndex + 1} / {mediaGallery.length}
              </ThemedText>
              <Pressable onPress={handleShare} style={styles.lightboxIconButton}>
                <Feather name="share-2" size={18} color="#ffffff" />
              </Pressable>
            </View>

            <FlatList
              ref={galleryPagerRef}
              data={mediaGallery}
              keyExtractor={(item, index) => `${item}-${index}`}
              horizontal
              pagingEnabled
              initialScrollIndex={galleryIndex}
              getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const nextIndex = Math.round(event.nativeEvent.contentOffset.x / Math.max(width, 1));
                setGalleryIndex(nextIndex);
                setSelectedImageIndex(nextIndex);
              }}
              renderItem={({ item }) => (
                <View style={[styles.lightboxSlide, { width }]}>
                  <ScrollView
                    style={styles.lightboxZoomShell}
                    contentContainerStyle={styles.lightboxZoomContent}
                    maximumZoomScale={3}
                    minimumZoomScale={1}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    bouncesZoom={false}
                    pinchGestureEnabled
                  >
                    <Image source={{ uri: item }} style={styles.lightboxImage} contentFit="contain" transition={120} />
                  </ScrollView>
                </View>
              )}
            />

            {mediaGallery.length > 1 ? (
              <View style={styles.lightboxThumbRail}>
                {mediaGallery.map((imageUrl, index) => (
                  <Pressable
                    key={`lightbox-thumb-${imageUrl}-${index}`}
                    onPress={() => {
                      setGalleryIndex(index);
                      setSelectedImageIndex(index);
                      galleryPagerRef.current?.scrollToIndex({ index, animated: true });
                    }}
                    style={[
                      styles.lightboxThumbWrap,
                      { borderColor: galleryIndex === index ? "#ffffff" : "rgba(255,255,255,0.24)" },
                    ]}
                  >
                    <Image source={{ uri: imageUrl }} style={styles.lightboxThumb} contentFit="cover" transition={120} />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </Modal>
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
  lightboxOverlay: {
    flex: 1,
    backgroundColor: "rgba(6,10,8,0.96)",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingBottom: 28,
  },
  lightboxTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    gap: 16,
  },
  lightboxIconButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  lightboxCounter: {
    color: "#ffffff",
  },
  lightboxSlide: {
    flex: 1,
  },
  lightboxZoomShell: {
    flex: 1,
  },
  lightboxZoomContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  lightboxImage: {
    width: "100%",
    height: "100%",
    minHeight: 380,
  },
  lightboxThumbRail: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 18,
  },
  lightboxThumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
  },
  lightboxThumb: {
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
    justifyContent: "flex-end",
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

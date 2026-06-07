import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { formatTryPrice } from "@harri/commerce-contracts";

import { CommercePageHeader } from "@/components/commerce-page-header";
import { PrimaryButton } from "@/components/primary-button";
import { ProductCard } from "@/components/product-card";
import { ScreenShell } from "@/components/screen-shell";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useCart } from "@/modules/cart/cart-provider";
import { useCatalogSnapshot } from "@/modules/catalog/use-catalog-snapshot";
import { calculateCheckoutTotals } from "@/modules/checkout/checkout-logic";
import { useProductReviewSummaries } from "@/modules/reviews/product-feedback";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";

export default function CartScreen() {
  const router = useRouter();
  const { items, subtotalText, clearCart, removeItem, updateQuantity, isHydrating, itemCount } = useCart();
  const { data: siteSettings } = useSiteSettings();
  const totals = calculateCheckoutTotals(items, siteSettings);
  const firstItem = items[0];
  const recommendationQuery = useMemo(
    () => ({
      page: 1,
      size: 12,
      includeFacets: false,
      parentCategory: firstItem?.parentCategory || undefined,
      brand: firstItem?.brand || undefined,
    }),
    [firstItem?.brand, firstItem?.parentCategory]
  );
  const { data: recommendationSnapshot } = useCatalogSnapshot(recommendationQuery);
  const recommendedProducts = useMemo(() => {
    const cartIds = new Set(items.map((item) => item.productId));
    const recommendations = (recommendationSnapshot?.products || []).filter((product) => !cartIds.has(product.id));
    return recommendations.slice(0, 6);
  }, [items, recommendationSnapshot?.products]);
  const { data: recommendationReviewSummaries } = useProductReviewSummaries(recommendedProducts.map((product) => product.id));

  const freeShippingProgress = useMemo(() => {
    if (!siteSettings.freeShippingThreshold) return 0;
    const progress = (totals.subtotal / siteSettings.freeShippingThreshold) * 100;
    return Math.max(0, Math.min(progress, 100));
  }, [siteSettings.freeShippingThreshold, totals.subtotal]);

  return (
    <ScreenShell>
      <CommercePageHeader
        title="Sepetim"
        meta={items.length ? `${itemCount} ürün` : "Sepet"}
      />

      {isHydrating ? <ThemedText type="small">Sepet yükleniyor...</ThemedText> : null}

      {!isHydrating && items.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <View style={styles.emptyLead}>
            <View style={styles.emptyIcon}>
              <Feather name="shopping-cart" size={20} color={activeTenant.palette.primary} />
            </View>
            <View style={styles.emptyCopy}>
              <ThemedText type="smallBold">Sepetin boş</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Ürün eklemek için kataloğa dön.
              </ThemedText>
            </View>
          </View>
          <PrimaryButton label="Kataloğa git" onPress={() => router.push("/catalog")} style={styles.emptyActionButton} />
        </View>
      ) : null}

      {items.map((item) => (
        <View
          key={item.productId}
          style={[styles.itemCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
        >
          <View style={styles.row}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" transition={120} />
            ) : (
              <View style={[styles.image, styles.imageFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <ThemedText type="smallBold">{item.brand}</ThemedText>
              </View>
            )}

            <View style={styles.info}>
              <View style={styles.itemHeaderRow}>
                <View style={styles.itemCopy}>
                  <ThemedText type="smallBold" numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.brand} • {item.category}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={() => removeItem(item.productId)}
                  testID={`cart-remove-${item.productId}`}
                  style={({ pressed }) => [
                    styles.removeIconButton,
                    {
                      backgroundColor: activeTenant.palette.surface,
                      borderColor: activeTenant.palette.border,
                      opacity: pressed ? 0.92 : 1,
                    },
                  ]}
                >
                  <Feather name="trash-2" size={16} color="#b42318" />
                </Pressable>
              </View>
              <View style={styles.priceRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  Birim fiyat
                </ThemedText>
                <ThemedText type="smallBold">{item.priceText}</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.itemFooter}>
            <View style={styles.stepperRow}>
              <View style={styles.stepper}>
                <PrimaryButton
                  label="-"
                  onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                  testID={`cart-quantity-decrease-${item.productId}`}
                  variant="outline"
                  style={styles.qtyButton}
                />
                <View style={styles.qtyPill}>
                  <ThemedText type="smallBold">{item.quantity} adet</ThemedText>
                </View>
                <PrimaryButton
                  label="+"
                  onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                  testID={`cart-quantity-increase-${item.productId}`}
                  variant="outline"
                  style={styles.qtyButton}
                />
              </View>
              <View style={styles.lineTotalWrap}>
                <ThemedText type="small" themeColor="textSecondary">
                  Toplam
                </ThemedText>
                <ThemedText type="smallBold">{formatTryPrice(item.price * item.quantity)}</ThemedText>
              </View>
            </View>
          </View>
        </View>
      ))}

      {recommendedProducts.length ? (
        <View style={styles.recommendationSection}>
          <SectionHeader title="İlginizi çekebilir" actionLabel="Katalog" onPressAction={() => router.push("/catalog")} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationRail}>
            {recommendedProducts.map((product) => (
              <ProductCard key={`cart-rec-${product.id}`} product={product} variant="rail" reviewSummary={recommendationReviewSummaries[product.id]} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {items.length > 0 ? (
        <View style={[styles.summaryCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryCopy}>
              <ThemedText type="smallBold">Sipariş özeti</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {itemCount} ürün • {subtotalText} ara toplam
              </ThemedText>
            </View>
            <View style={[styles.summaryTotalBadge, { backgroundColor: activeTenant.palette.primarySoft }]}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                {totals.totalText}
              </ThemedText>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${freeShippingProgress}%`, backgroundColor: activeTenant.palette.primary }]} />
          </View>

          <ThemedText type="small" themeColor="textSecondary">
            {totals.isFreeShipping
              ? "Ücretsiz kargo"
              : `${Math.ceil(totals.remainingForFreeShipping)} TL daha eklersen kargo ücretsiz olacak.`}
          </ThemedText>

          <View style={styles.summaryBreakdown}>
            <View style={styles.summaryMetricRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Ürünler
              </ThemedText>
              <ThemedText type="smallBold">{totals.subtotalText}</ThemedText>
            </View>
            <View style={styles.summaryMetricRow}>
              <ThemedText type="small" themeColor="textSecondary">
                İndirim
              </ThemedText>
              <ThemedText type="smallBold">{totals.discountText}</ThemedText>
            </View>
            <View style={styles.summaryMetricRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Kargo
              </ThemedText>
              <ThemedText type="smallBold">{totals.shippingText}</ThemedText>
            </View>
          </View>

          <View style={styles.summaryActions}>
            <PrimaryButton label="Ödemeye geç" onPress={() => router.push("/checkout")} testID="cart-go-to-checkout" style={styles.summaryActionButton} />
            <View style={styles.summarySecondaryRow}>
              <Pressable onPress={() => router.push("/catalog")} style={({ pressed }) => [styles.summaryTextAction, { opacity: pressed ? 0.72 : 1 }]}>
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  Alışverişe devam et
                </ThemedText>
              </Pressable>
              <Pressable onPress={clearCart} style={({ pressed }) => [styles.summaryTextAction, { opacity: pressed ? 0.72 : 1 }]}>
                <ThemedText type="smallBold" style={{ color: "#b42318" }}>
                  Sepeti temizle
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emptyLead: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef7f0",
  },
  emptyCopy: {
    flex: 1,
    gap: 2,
  },
  emptyActionButton: {
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryCopy: {
    flex: 1,
    gap: 4,
  },
  summaryTotalBadge: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e6ebe6",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 999,
  },
  summaryBreakdown: {
    borderRadius: 18,
    padding: 14,
    gap: 10,
    backgroundColor: "#fcfdfd",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d8e5d8",
  },
  summaryMetricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryActions: {
    gap: 12,
  },
  summaryActionButton: {
    width: "100%",
  },
  summarySecondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryTextAction: {
    minHeight: 24,
    justifyContent: "center",
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 14,
  },
  image: {
    width: 92,
    height: 92,
    borderRadius: 18,
  },
  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  itemHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  itemCopy: {
    flex: 1,
    gap: 4,
  },
  removeIconButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  itemFooter: {
    gap: 12,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
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
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#f7faf7",
    alignItems: "center",
  },
  lineTotalWrap: {
    alignItems: "flex-end",
    gap: 4,
  },
  recommendationSection: {
    gap: 12,
  },
  recommendationRail: {
    gap: 12,
    paddingRight: 8,
  },
});

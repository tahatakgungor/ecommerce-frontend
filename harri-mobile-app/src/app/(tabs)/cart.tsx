import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo } from "react";

import { PrimaryButton } from "@/components/primary-button";
import { ProductCard } from "@/components/product-card";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useCart } from "@/modules/cart/cart-provider";
import { useCatalogSnapshot } from "@/modules/catalog/use-catalog-snapshot";
import { calculateCheckoutTotals } from "@/modules/checkout/checkout-logic";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";

const tryCurrencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

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

  const freeShippingProgress = useMemo(() => {
    if (!siteSettings.freeShippingThreshold) return 0;
    const progress = (totals.subtotal / siteSettings.freeShippingThreshold) * 100;
    return Math.max(0, Math.min(progress, 100));
  }, [siteSettings.freeShippingThreshold, totals.subtotal]);

  return (
    <ScreenShell>
      {isHydrating ? <ThemedText type="small">Sepet yükleniyor...</ThemedText> : null}

      {!isHydrating && items.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <View style={styles.emptyIcon}>
            <Feather name="shopping-cart" size={22} color={activeTenant.palette.primary} />
          </View>
          <ThemedText type="smallBold">Sepetin boş</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Ürün eklemek için kataloğa dön.
          </ThemedText>
          <PrimaryButton label="Kataloğa git" onPress={() => router.push("/catalog")} />
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
              ? "Ücretsiz kargo aktif."
              : `${Math.ceil(totals.remainingForFreeShipping)} TL daha eklersen kargo ücretsiz olacak.`}
          </ThemedText>

          <View style={styles.summaryMetaRow}>
            <ThemedText type="small" themeColor="textSecondary">
              İndirim: {totals.discountText}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Kargo: {totals.shippingText}
            </ThemedText>
          </View>

          <View style={styles.summaryActions}>
            <PrimaryButton label="Ödemeye geç" onPress={() => router.push("/checkout")} testID="cart-go-to-checkout" style={styles.summaryActionButton} />
            <PrimaryButton label="Kataloğa dön" onPress={() => router.push("/catalog")} variant="outline" style={styles.summaryActionButton} />
          </View>

          <PrimaryButton label="Sepeti temizle" onPress={clearCart} testID="cart-clear" variant="outline" />
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
              <ThemedText type="smallBold">{item.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.brand} • {item.category}
              </ThemedText>
              <View style={styles.priceRow}>
                <ThemedText type="smallBold">{item.priceText}</ThemedText>
                <View style={styles.stockPill}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Stok {item.stockQuantity}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.itemFooter}>
            <View style={styles.lineFooter}>
              <ThemedText type="small" themeColor="textSecondary">
                Toplam
              </ThemedText>
              <ThemedText type="smallBold">{tryCurrencyFormatter.format(item.price * item.quantity)}</ThemedText>
            </View>

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
              <PrimaryButton
                label="Kaldır"
                onPress={() => removeItem(item.productId)}
                testID={`cart-remove-${item.productId}`}
                variant="outline"
                style={styles.removeButton}
              />
            </View>
          </View>
        </View>
      ))}

      {recommendedProducts.length ? (
        <View style={styles.recommendationSection}>
          <View style={styles.recommendationHeader}>
            <ThemedText type="smallBold">İlgilenebileceğin diğer ürünler</ThemedText>
            <Pressable onPress={() => router.push("/catalog")}>
              <ThemedText type="linkPrimary">Katalog</ThemedText>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationRail}>
            {recommendedProducts.map((product) => (
              <ProductCard key={`cart-rec-${product.id}`} product={product} variant="rail" />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    gap: 14,
    alignItems: "flex-start",
  },
  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef7f0",
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
  summaryMetaRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  summaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  summaryActionButton: {
    flex: 1,
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
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  stockPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f7faf7",
  },
  itemFooter: {
    gap: 12,
  },
  lineFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#f7faf7",
    alignItems: "center",
  },
  removeButton: {
    minWidth: 92,
  },
  recommendationSection: {
    gap: 12,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  recommendationRail: {
    gap: 12,
    paddingRight: 8,
  },
});

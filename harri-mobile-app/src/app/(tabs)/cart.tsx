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
import { commerceShadow } from "@/constants/theme";
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

  const freeShippingStatus = totals.isFreeShipping
    ? "Ücretsiz kargo hazır"
    : `${Math.ceil(totals.remainingForFreeShipping)} TL daha ekle, kargo ücretsiz olsun`;

  return (
    <ScreenShell scroll={false}>
      <View style={styles.screen}>
        <CommercePageHeader
          title={items.length ? `Sepetim (${itemCount} ürün)` : "Sepetim"}
          actionIcon={items.length ? "trash-2" : undefined}
          actionAccessibilityLabel="Sepeti temizle"
          onPressAction={items.length ? clearCart : undefined}
        />

        {isHydrating ? (
          <View style={[styles.stateCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="small">Sepet yükleniyor...</ThemedText>
          </View>
        ) : null}

        {!isHydrating && items.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.emptyLead}>
              <View style={styles.emptyIcon}>
                <Feather name="shopping-cart" size={20} color={activeTenant.palette.primary} />
              </View>
              <View style={styles.emptyCopy}>
                <ThemedText type="smallBold">Sepetin boş</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Favori ürünlerini ekleyip ödeme adımına geçebilirsin.
                </ThemedText>
              </View>
            </View>
            <PrimaryButton label="Kataloğa git" onPress={() => router.push("/catalog")} style={styles.emptyActionButton} />
          </View>
        ) : null}

        {!isHydrating && items.length > 0 ? (
          <>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {items.map((item) => (
                <View
                  key={item.productId}
                  style={[styles.itemRowCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
                >
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push(`/product/${item.productId}`)}
                    style={({ pressed }) => [styles.imageWrap, { opacity: pressed ? 0.92 : 1 }]}
                  >
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" transition={120} />
                    ) : (
                      <View style={[styles.image, styles.imageFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
                        <ThemedText type="smallBold">{item.brand}</ThemedText>
                      </View>
                    )}
                  </Pressable>

                  <View style={styles.itemBody}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push(`/product/${item.productId}`)}
                      style={({ pressed }) => [styles.itemCopy, { opacity: pressed ? 0.92 : 1 }]}
                    >
                      <ThemedText type="smallBold" numberOfLines={2}>
                        {item.title}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                        {item.brand} • {item.category}
                      </ThemedText>
                    </Pressable>

                    <View style={styles.inlineInfoRow}>
                      <Feather name="package" size={13} color={activeTenant.palette.primary} />
                      <ThemedText type="small" themeColor="textSecondary">
                        Sepete hazır
                      </ThemedText>
                    </View>

                    <ThemedText type="default" style={styles.itemPrice}>
                      {item.priceText}
                    </ThemedText>

                    <View style={styles.itemFooter}>
                      <View style={styles.controlsRow}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => removeItem(item.productId)}
                          testID={`cart-remove-${item.productId}`}
                          style={({ pressed }) => [
                            styles.removeIconButton,
                            {
                              borderColor: activeTenant.palette.border,
                              backgroundColor: activeTenant.palette.surface,
                              opacity: pressed ? 0.86 : 1,
                            },
                          ]}
                        >
                          <Feather name="trash-2" size={15} color="#b42318" />
                        </Pressable>

                        <View style={[styles.stepper, { borderColor: activeTenant.palette.border }]}>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                            testID={`cart-quantity-decrease-${item.productId}`}
                            style={({ pressed }) => [styles.stepperButton, { opacity: pressed ? 0.82 : 1 }]}
                          >
                            <Feather name="minus" size={15} color={activeTenant.palette.primary} />
                          </Pressable>
                          <View style={styles.qtyPill}>
                            <ThemedText type="smallBold">{item.quantity}</ThemedText>
                          </View>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                            testID={`cart-quantity-increase-${item.productId}`}
                            style={({ pressed }) => [styles.stepperButton, { opacity: pressed ? 0.82 : 1 }]}
                          >
                            <Feather name="plus" size={15} color={activeTenant.palette.primary} />
                          </Pressable>
                        </View>
                      </View>

                      <View style={[styles.lineTotalBadge, { backgroundColor: activeTenant.palette.primarySoft }]}>
                        <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                          {formatTryPrice(item.price * item.quantity)}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              {recommendedProducts.length ? (
                <View style={styles.recommendationSection}>
                  <SectionHeader title="Beğenebileceğin ürünler" actionLabel="Katalog" onPressAction={() => router.push("/catalog")} />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationRail}>
                    {recommendedProducts.map((product) => (
                      <ProductCard key={`cart-rec-${product.id}`} product={product} variant="rail" reviewSummary={recommendationReviewSummaries[product.id]} />
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </ScrollView>

            <View style={[styles.checkoutDock, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <View style={[styles.checkoutHint, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <Feather name={totals.isFreeShipping ? "check-circle" : "truck"} size={14} color={activeTenant.palette.primary} />
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  {freeShippingStatus}
                </ThemedText>
              </View>

              <View style={styles.checkoutMainRow}>
                <View style={styles.checkoutCopy}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Genel toplam
                  </ThemedText>
                  <ThemedText type="subtitle" style={styles.checkoutTotalText}>
                    {totals.totalText}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {itemCount} ürün • {totals.subtotalText} ara toplam
                  </ThemedText>
                </View>

                <PrimaryButton
                  label="Ödemeye geç"
                  onPress={() => router.push("/checkout")}
                  testID="cart-go-to-checkout"
                  style={styles.checkoutButton}
                />
              </View>

              <View style={styles.checkoutMetaRow}>
                <View style={styles.checkoutMetaItem}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Kargo
                  </ThemedText>
                  <ThemedText type="smallBold">{totals.isFreeShipping ? "Ücretsiz" : totals.shippingText}</ThemedText>
                </View>
                <View style={styles.checkoutMetaItem}>
                  <ThemedText type="small" themeColor="textSecondary">
                    İndirim
                  </ThemedText>
                  <ThemedText type="smallBold">{totals.discountText}</ThemedText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/catalog")}
                  style={({ pressed }) => [styles.continueLink, { opacity: pressed ? 0.72 : 1 }]}
                >
                  <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                    Alışverişe devam et
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 16,
  },
  stateCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 12,
  },
  itemRowCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    ...commerceShadow("#17324a", 8, 18, 0.05, 2),
  },
  imageWrap: {
    width: 104,
  },
  image: {
    width: 104,
    height: 104,
    borderRadius: 18,
  },
  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  itemBody: {
    flex: 1,
    gap: 8,
  },
  itemCopy: {
    gap: 4,
  },
  inlineInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemPrice: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: "#183224",
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  removeIconButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepper: {
    minHeight: 38,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  stepperButton: {
    width: 38,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyPill: {
    minWidth: 40,
    minHeight: 38,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7faf7",
  },
  lineTotalBadge: {
    minHeight: 38,
    borderRadius: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendationSection: {
    gap: 10,
    paddingTop: 2,
  },
  recommendationRail: {
    gap: 12,
    paddingRight: 8,
  },
  checkoutDock: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
    ...commerceShadow("#17324a", 16, 28, 0.1, 4),
  },
  checkoutHint: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkoutMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkoutCopy: {
    flex: 1,
    gap: 2,
  },
  checkoutTotalText: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: "#183224",
  },
  checkoutButton: {
    minWidth: 136,
    minHeight: 50,
    borderRadius: 16,
  },
  checkoutMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  checkoutMetaItem: {
    gap: 2,
  },
  continueLink: {
    minHeight: 24,
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
  },
});

import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo } from "react";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useCart } from "@/modules/cart/cart-provider";
import { calculateCheckoutTotals } from "@/modules/checkout/checkout-logic";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";

const tryCurrencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

export default function CartScreen() {
  const router = useRouter();
  const { items, subtotalText, clearCart, removeItem, updateQuantity, isHydrating, itemCount } = useCart();
  const { data: siteSettings } = useSiteSettings();
  const totals = calculateCheckoutTotals(items, siteSettings);
  const freeShippingProgress = useMemo(() => {
    if (!siteSettings.freeShippingThreshold) return 0;
    const progress = (totals.subtotal / siteSettings.freeShippingThreshold) * 100;
    return Math.max(0, Math.min(progress, 100));
  }, [siteSettings.freeShippingThreshold, totals.subtotal]);

  return (
    <ScreenShell>
      <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.primary }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Feather name="shopping-bag" size={14} color="#ffffff" />
            <ThemedText type="smallBold" style={styles.heroBadgeText}>
              Sepet
            </ThemedText>
          </View>
          <ThemedText type="smallBold" style={styles.heroMetaText}>
            {itemCount} ürün
          </ThemedText>
        </View>
        <ThemedText type="subtitle" style={styles.heroTitle}>
          Ürünlerini kontrol et
        </ThemedText>
        <View style={styles.heroMetrics}>
          <View style={styles.heroMetricCard}>
            <ThemedText type="smallBold" style={styles.heroMetricValue}>
              {subtotalText}
            </ThemedText>
            <ThemedText type="small" style={styles.heroMetricLabel}>
              ara toplam
            </ThemedText>
          </View>
          <View style={styles.heroMetricCard}>
            <ThemedText type="smallBold" style={styles.heroMetricValue}>
              {totals.totalText}
            </ThemedText>
            <ThemedText type="small" style={styles.heroMetricLabel}>
              ödeme toplamı
            </ThemedText>
          </View>
        </View>
      </View>

      {isHydrating ? <ThemedText type="small">Sepet yükleniyor...</ThemedText> : null}

      {!isHydrating && items.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <View style={styles.emptyIcon}>
            <Feather name="shopping-cart" size={22} color={activeTenant.palette.primary} />
          </View>
          <ThemedText type="smallBold">Sepetin henüz boş</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Ürün eklemek için katalogdan devam et.
          </ThemedText>
          <PrimaryButton label="Kataloğa Git" onPress={() => router.push("/catalog")} />
        </View>
      ) : null}

      {items.length > 0 ? (
        <View style={[styles.summaryCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryCopy}>
              <ThemedText type="smallBold">Sipariş özeti</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {itemCount} ürün, {totals.discountText} indirim, {totals.shippingText} kargo
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
              : `${Math.ceil(totals.remainingForFreeShipping)} TL daha eklersen kargo bedava olacak.`}
          </ThemedText>
          <View style={styles.helperActions}>
            <PrimaryButton label="Favorilere Bak" onPress={() => router.push("/wishlist")} variant="outline" style={styles.helperActionButton} />
            <PrimaryButton label="Kataloğa Dön" onPress={() => router.push("/catalog")} variant="outline" style={styles.helperActionButton} />
          </View>
          <View style={styles.summaryActions}>
            <PrimaryButton label="Ödemeye geç" onPress={() => router.push("/checkout")} testID="cart-go-to-checkout" style={styles.summaryActionButton} />
            <PrimaryButton label="Sepeti Temizle" onPress={clearCart} testID="cart-clear" variant="outline" style={styles.summaryActionButton} />
          </View>
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

          <View style={styles.actions}>
            <View style={styles.lineFooter}>
              <ThemedText type="small" themeColor="textSecondary">
                Toplam
              </ThemedText>
              <ThemedText type="smallBold">{tryCurrencyFormatter.format(item.price * item.quantity)}</ThemedText>
            </View>
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
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 30,
    padding: 20,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroBadgeText: {
    color: "#ffffff",
  },
  heroMetaText: {
    color: "#d8f5df",
  },
  heroTitle: {
    color: "#ffffff",
  },
  heroMetrics: {
    flexDirection: "row",
    gap: 10,
  },
  heroMetricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    gap: 4,
  },
  heroMetricValue: {
    color: "#ffffff",
    fontSize: 20,
    lineHeight: 28,
  },
  heroMetricLabel: {
    color: "#e6f7ea",
  },
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
    borderRadius: 22,
    padding: 16,
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
  summaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  summaryActionButton: {
    flex: 1,
  },
  helperActions: {
    flexDirection: "row",
    gap: 12,
  },
  helperActionButton: {
    flex: 1,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 14,
  },
  image: {
    width: 88,
    height: 88,
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
  actions: {
    gap: 10,
  },
  lineFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
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
    marginLeft: "auto",
  },
});

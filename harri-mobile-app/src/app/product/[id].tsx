import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";

import { FilterChip } from "@/components/filter-chip";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";
import { useCart } from "@/modules/cart/cart-provider";
import { useProductDetail } from "@/modules/catalog/use-product-detail";
import { usePreferences } from "@/modules/preferences/preferences-provider";
import { useSiteSettings } from "@/modules/site-settings/use-site-settings";
import { useWishlist } from "@/modules/wishlist/wishlist-provider";

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading, error } = useProductDetail(productId || "");
  const { data: siteSettings } = useSiteSettings();
  const { addItem } = useCart();
  const { recordViewedProduct } = usePreferences();
  const { hasItem, toggleItem } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [hasImageError, setHasImageError] = useState(false);

  const mediaGallery = useMemo(() => [...new Set([data?.imageUrl, ...(data?.gallery || [])].filter(Boolean))], [data?.gallery, data?.imageUrl]);
  const remainingForFreeShipping = Math.max(0, (siteSettings.freeShippingThreshold || 0) - ((data?.price || 0) * quantity));

  useEffect(() => {
    if (!data) return;
    recordViewedProduct(data);
  }, [data?.id, recordViewedProduct]);

  useEffect(() => {
    setHasImageError(false);
  }, [data?.id]);

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
              <PrimaryButton
                label={hasItem(data.id) ? "Favoride" : "Kaydet"}
                onPress={() => toggleItem(data)}
                testID="product-toggle-wishlist"
                variant="outline"
                style={styles.saveButton}
              />
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
            <ThemedText type="smallBold">Sepete ekle</ThemedText>
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
              <PrimaryButton
                label="Sepete ekle"
                onPress={() => addItem(data, quantity)}
                testID="product-add-to-cart"
                style={styles.addToCartButton}
              />
            </View>
            <View style={styles.secondaryActions}>
              <PrimaryButton label="Ödemeye git" onPress={() => router.push("/checkout")} variant="outline" />
              <PrimaryButton label="Sepet" onPress={() => router.push("/cart")} variant="outline" />
            </View>
            <View style={styles.inlineRow}>
              <FilterChip compact label="Katalog" onPress={() => router.push("/catalog")} />
              <FilterChip compact label="Favoriler" onPress={() => router.push("/wishlist")} />
              <FilterChip compact label="Fırsatlar" onPress={() => router.push("/roadmap")} />
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
  metaCopy: {
    flex: 1,
    gap: 4,
  },
  brand: {
    color: activeTenant.palette.primary,
  },
  saveButton: {
    minWidth: 96,
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
    width: "100%",
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
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
});

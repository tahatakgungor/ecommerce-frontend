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
  const relatedActions = [
    { label: "Firsatlar", route: "/roadmap" },
    { label: "Blog", route: "/blog" },
    { label: "Destek", route: "/support" },
  ];

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
        <ThemedText type="small">Urun kimligi eksik.</ThemedText>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      {isLoading ? <ThemedText type="small">Urun yukleniyor...</ThemedText> : null}
      {error ? <ThemedText type="small">{error}</ThemedText> : null}

      {data ? (
        <>
          <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.primary }]}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroBadge}>
                <Feather name="star" size={14} color="#ffffff" />
                <ThemedText type="smallBold" style={styles.heroBadgeText}>
                  One cikan urun
                </ThemedText>
              </View>
              <PrimaryButton
                label={hasItem(data.id) ? "Favoride" : "Kaydet"}
                onPress={() => toggleItem(data)}
                testID="product-toggle-wishlist"
                variant="outline"
                style={styles.heroActionButton}
              />
            </View>
            <ThemedText type="subtitle" style={styles.heroTitle}>
              {data.title}
            </ThemedText>
            <ThemedText type="small" style={styles.heroDescription}>
              {data.brand} • {data.parentCategory || data.category}
            </ThemedText>
            <View style={styles.heroMetricRow}>
              <View style={styles.heroMetricCard}>
                <ThemedText type="smallBold" style={styles.heroMetricValue}>
                  {data.priceText}
                </ThemedText>
                <ThemedText type="small" style={styles.heroMetricLabel}>
                  guncel fiyat
                </ThemedText>
              </View>
              <View style={styles.heroMetricCard}>
                <ThemedText type="smallBold" style={styles.heroMetricValue}>
                  {data.stockQuantity > 0 ? `${data.stockQuantity}` : "-"}
                </ThemedText>
                <ThemedText type="small" style={styles.heroMetricLabel}>
                  stok
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.mediaCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
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
            <View style={styles.imageFooter}>
              <View style={[styles.inlinePill, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  {data.category}
                </ThemedText>
              </View>
              {data.discount > 0 ? (
                <View style={[styles.inlinePill, { backgroundColor: "#f5efe7" }]}>
                  <ThemedText type="smallBold" style={{ color: activeTenant.palette.accent }}>
                    %{data.discount} indirim
                  </ThemedText>
                </View>
              ) : null}
              <View style={[styles.inlinePill, { backgroundColor: "#fff4e8" }]}>
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.accent }}>
                  {data.stockQuantity > 0 ? "Ayni gun kesif" : "Tedarik sureci"}
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

          <View style={[styles.sectionCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Hizli karar ozeti</ThemedText>
            <View style={styles.advantageGrid}>
              <View style={[styles.advantageCard, { backgroundColor: "#fff8f1" }]}>
                <ThemedText type="smallBold">Teslimat ve stok</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {data.stockQuantity > 0
                    ? `${data.stockQuantity} stok gorunuyor. ${siteSettings.freeShippingThreshold} TL uzeri ucretsiz kargo.`
                    : "Stok bilgisi teyit asamasinda. Detay teyidi icin destek aksiyonu kullanilabilir."}
                </ThemedText>
              </View>
              <View style={[styles.advantageCard, { backgroundColor: "#f7faf7" }]}>
                <ThemedText type="smallBold">
                  {data.discount > 0 ? `${data.originalPriceText} yerine ${data.priceText}` : "Guncel fiyat aktif"}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {data.discount > 0 ? "Kampanya fiyati sepete de ayni sekilde yansir." : "Sepete eklediginde odeme ozetine dogrudan duser."}
                </ThemedText>
              </View>
              <View style={[styles.advantageCard, { backgroundColor: "#fff8f1" }]}>
                <ThemedText type="smallBold">
                  {remainingForFreeShipping > 0
                    ? `${Math.ceil(remainingForFreeShipping)} TL sonra kargo bedava`
                    : "Kargo avantajina dogrudan katkida bulunuyor"}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {remainingForFreeShipping > 0
                    ? "Bu urun sepette kargo limitine daha hizli yaklastirir."
                    : "Sepet limiti asildiginda checkout toplaminda teslimat avantaji acik gorunur."}
                </ThemedText>
              </View>
              <View style={[styles.advantageCard, { backgroundColor: "#f7faf7" }]}>
                <ThemedText type="smallBold">{hasItem(data.id) ? "Favori ve tekrar satin alma icin hazir" : "Kararini saklayip sonra donebilirsin"}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {hasItem(data.id)
                    ? "Bildirimler, favoriler ve siparis sonrasi akislarla ayni urun yolculuguna baglanir."
                    : "Favoriye ekleyip kampanya veya checkout kararini sonra verebilirsin."}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {data.description || "Bu urun icin aciklama mobil detay ekranina henuz baglanmadi."}
            </ThemedText>
            {data.discount > 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                {data.originalPriceText} yerine {data.priceText}. Kampanya aktif oldugu surece bu fiyat kullanilir.
              </ThemedText>
            ) : null}
          </View>

          <View style={[styles.sectionCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Sepete ekle</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Detayini actigin urunler cihazdaki kesif hafizasina eklenir ve ana sayfada sana ozel rail olusur.
            </ThemedText>
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
                label="Sepete Ekle"
                onPress={() => addItem(data, quantity)}
                testID="product-add-to-cart"
                style={styles.addToCartButton}
              />
            </View>
            <View style={[styles.checkoutBridge, { backgroundColor: "#f7faf7" }]}>
              <View style={styles.checkoutBridgeCopy}>
                <ThemedText type="smallBold">Hemen checkout'a gecebilirsin</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Urunu sepete ekledikten sonra kupon, kargo ve odeme kontrolunu tek ekranda tamamlayabilirsin.
                </ThemedText>
              </View>
              <PrimaryButton label="Checkout'a Git" onPress={() => router.push("/checkout")} variant="outline" />
            </View>
            <View style={styles.actionRow}>
              <FilterChip compact label="Kataloga don" onPress={() => router.push("/catalog")} />
              <FilterChip compact label="Favoriler" onPress={() => router.push("/wishlist")} />
              <FilterChip compact label="Sepet" onPress={() => router.push("/cart")} />
              {relatedActions.map((item) => (
                <FilterChip key={item.label} compact label={item.label} onPress={() => router.push(item.route as never)} />
              ))}
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
  heroCard: {
    borderRadius: 30,
    padding: 20,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
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
  heroActionButton: {
    minWidth: 96,
  },
  heroTitle: {
    color: "#ffffff",
  },
  heroDescription: {
    color: "#e6f7ea",
  },
  heroMetricRow: {
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
    fontSize: 22,
    lineHeight: 30,
  },
  heroMetricLabel: {
    color: "#e6f7ea",
  },
  mediaCard: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
    ...commerceShadow("#102117", 12, 22, 0.06, 2),
  },
  heroImage: {
    width: "100%",
    height: 300,
  },
  heroFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageFooter: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    flexWrap: "wrap",
  },
  galleryRail: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  inlinePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  advantageGrid: {
    gap: 12,
  },
  advantageCard: {
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  purchaseRow: {
    gap: 12,
  },
  checkoutBridge: {
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  checkoutBridgeCopy: {
    gap: 4,
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
  actionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
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

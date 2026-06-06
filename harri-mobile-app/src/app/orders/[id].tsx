import { useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";

import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { PrimaryButton } from "@/components/primary-button";
import { FilterChip } from "@/components/filter-chip";
import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";
import { useSession } from "@/modules/auth/session-provider";
import { toFilterSlug } from "@/modules/catalog/query";
import { useCart } from "@/modules/cart/cart-provider";
import { getReturnStatusMeta } from "@/modules/orders/status";
import { buildCarrierTrackingMeta } from "@/modules/orders/tracking";
import { useOrderDetail } from "@/modules/orders/use-order-detail";
import { useReviewOverview } from "@/modules/reviews/use-review-overview";
import { useReturnRequests } from "@/modules/returns/use-return-requests";

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; invoice?: string | string[]; email?: string | string[]; viewToken?: string | string[] }>();
  const { isAuthenticated } = useSession();
  const { addSeedItem } = useCart();
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);

  const orderId = Array.isArray(params.id) ? params.id[0] || "" : params.id || "";
  const invoice = Array.isArray(params.invoice) ? params.invoice[0] || "" : params.invoice || "";
  const email = Array.isArray(params.email) ? params.email[0] || "" : params.email || "";
  const viewToken = Array.isArray(params.viewToken) ? params.viewToken[0] || "" : params.viewToken || "";

  const guestLookup = useMemo(
    () => (invoice.trim() && email.trim() ? { invoice: invoice.trim(), email: email.trim() } : null),
    [email, invoice]
  );

  const { data, isLoading, error } = useOrderDetail(orderId, guestLookup, viewToken);
  const { data: reviewOverview } = useReviewOverview(isAuthenticated);
  const { data: returnRequests } = useReturnRequests(isAuthenticated);

  const reviewableItems = useMemo(
    () =>
      data?.items.filter((item) => !reviewOverview.reviewed.some((review) => review.productId === item.id)) || [],
    [data?.items, reviewOverview.reviewed]
  );
  const existingReturn = useMemo(
    () => returnRequests.find((item) => item.orderId === data?.id) || null,
    [data?.id, returnRequests]
  );
  const trackingMeta = useMemo(
    () => buildCarrierTrackingMeta(data?.shippingCarrier || "", data?.trackingNumber || ""),
    [data?.shippingCarrier, data?.trackingNumber]
  );

  const handleReorder = () => {
    if (!data) return;
    data.items.forEach((item) => {
      addSeedItem({
        productId: item.id,
        title: item.title,
        brand: "",
        parentCategory: item.parentCategory,
        category: item.category,
        imageUrl: item.imageUrl,
        price: item.price,
        priceText: item.priceText,
        quantity: item.quantity,
        stockQuantity: Math.max(item.quantity, 1),
      });
    });
    setReorderMessage(`${data.items.length} urun sepete eklendi.`);
  };

  if (isLoading) {
    return (
      <ScreenShell>
        <ThemedText type="small">Siparis detayi yukleniyor...</ThemedText>
      </ScreenShell>
    );
  }

  if (error || !data) {
    return (
      <ScreenShell>
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Siparis detayi acilamadi</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {error || "Siparis verisi bulunamadi."}
          </ThemedText>
          <PrimaryButton label="Hesaba Don" onPress={() => router.replace("/account")} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.primary }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Feather name="package" size={14} color="#ffffff" />
            <ThemedText type="smallBold" style={styles.heroBadgeText}>
              Siparis detayi
            </ThemedText>
          </View>
          <View style={styles.heroStatusPill}>
            <ThemedText type="smallBold" style={styles.heroStatusText}>
              {data.statusText}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="subtitle" style={styles.heroTitle}>
          Siparis {data.invoice}
        </ThemedText>
        <ThemedText type="small" style={styles.heroDescription}>
          {data.createdAtText}
        </ThemedText>
        <View style={styles.heroMetrics}>
          <View style={styles.heroMetricCard}>
            <ThemedText type="smallBold" style={styles.heroMetricValue}>
              {data.totalAmountText}
            </ThemedText>
            <ThemedText type="small" style={styles.heroMetricLabel}>
              genel toplam
            </ThemedText>
          </View>
          <View style={styles.heroMetricCard}>
            <ThemedText type="smallBold" style={styles.heroMetricValue}>
              {data.itemCount}
            </ThemedText>
            <ThemedText type="small" style={styles.heroMetricLabel}>
              urun adedi
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">{data.statusDescription}</ThemedText>
        <View style={styles.summaryRow}>
          <ThemedText type="small">Odeme</ThemedText>
          <ThemedText type="smallBold">{data.paymentMethod}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText type="small">Kargo</ThemedText>
          <ThemedText type="smallBold">{data.shippingCarrier || "Hazirlaniyor"}</ThemedText>
        </View>
        <View style={styles.timelineRow}>
          <View style={[styles.timelinePill, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
              Olusturuldu
            </ThemedText>
          </View>
          {data.shippedAt ? (
            <View style={[styles.timelinePill, { backgroundColor: "#eef4fb" }]}>
              <ThemedText type="smallBold" style={{ color: "#265ea8" }}>
                Kargoya verildi
              </ThemedText>
            </View>
          ) : null}
          {data.deliveredAt ? (
            <View style={[styles.timelinePill, { backgroundColor: "#ecfdf3" }]}>
              <ThemedText type="smallBold" style={{ color: "#166534" }}>
                Teslim edildi
              </ThemedText>
            </View>
          ) : null}
        </View>
        {trackingMeta && (data.status === "shipped" || data.status === "delivered") ? (
          <View style={[styles.trackingCard, { backgroundColor: "#eef4fb", borderColor: "#bfd4f6" }]}>
            <View style={styles.trackingHeader}>
              <Feather name="truck" size={16} color="#265ea8" />
              <ThemedText type="smallBold" style={{ color: "#265ea8" }}>
                {trackingMeta.carrierLabel} • {trackingMeta.trackingNumber}
              </ThemedText>
            </View>
            <PrimaryButton
              label="Kargomu Takip Et"
              onPress={() => {
                void Linking.openURL(trackingMeta.url);
              }}
              variant="outline"
              testID="order-track-shipment"
            />
          </View>
        ) : null}
        {existingReturn ? (
          <View
            style={[
              styles.returnStatusCard,
              {
                backgroundColor: getReturnStatusMeta(existingReturn.status).backgroundColor,
                borderColor: getReturnStatusMeta(existingReturn.status).borderColor,
              },
            ]}
          >
            <ThemedText type="smallBold" style={{ color: getReturnStatusMeta(existingReturn.status).textColor }}>
              {existingReturn.statusLabel}
            </ThemedText>
            <ThemedText type="small" style={{ color: getReturnStatusMeta(existingReturn.status).textColor }}>
              {existingReturn.statusDescription}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">Teslimat bilgileri</ThemedText>
        <ThemedText type="small">{data.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {data.contact || data.email || data.guestEmail}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {data.address}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {data.city} / {data.country} {data.zipCode}
        </ThemedText>
        {data.orderNote ? (
          <View style={[styles.noteCard, { backgroundColor: "#f7faf7" }]}>
            <ThemedText type="smallBold">Siparis notu</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {data.orderNote}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.sectionHeader}>
          <ThemedText type="smallBold">Urunler</ThemedText>
          <FilterChip compact label="Tekrar siparis" onPress={handleReorder} />
        </View>
        {data.items.map((item) => (
          <View key={item.id} style={styles.orderItemCard}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.orderItemImage} contentFit="cover" transition={120} />
            ) : (
              <View style={[styles.orderItemImage, styles.orderItemFallback, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <Feather name="box" size={18} color={activeTenant.palette.primary} />
              </View>
            )}
            <View style={styles.orderItemCopy}>
              <ThemedText type="smallBold">{item.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.parentCategory || item.category || "Kategori yok"}
              </ThemedText>
              <View style={styles.orderItemMetaRow}>
                <View style={[styles.inlineMetaPill, { backgroundColor: "#f7faf7" }]}>
                  <ThemedText type="smallBold">{item.quantity} adet</ThemedText>
                </View>
                <ThemedText type="smallBold">{item.priceText}</ThemedText>
              </View>
            </View>
          </View>
        ))}
        {reorderMessage ? (
          <ThemedText type="small" themeColor="textSecondary">
            {reorderMessage}
          </ThemedText>
        ) : null}
      </View>

      {data.status === "delivered" ? (
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Yorum ve iade</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isAuthenticated
              ? "Bu siparis icin yorum ekleyebilir veya iade baslatabilirsin."
              : "Yorum veya iade icin giris yapman gerekir."}
          </ThemedText>
          {isAuthenticated ? (
            <View style={styles.actionStack}>
              <PrimaryButton
                label={reviewableItems.length > 0 ? "Urunleri Degerlendir" : "Yorumlarimi Yonet"}
                onPress={() =>
                  router.push({
                    pathname: "../reviews",
                    params: {
                      orderId: data.id,
                    },
                  })
                }
                testID="order-open-reviews"
              />
              <PrimaryButton
                label={existingReturn ? "Iade Durumunu Gor" : "Iade Talebi Ac"}
                onPress={() =>
                  router.push({
                    pathname: "../returns",
                    params: {
                      orderId: data.id,
                    },
                  })
                }
                variant="outline"
                testID="order-open-returns"
              />
            </View>
          ) : (
            <PrimaryButton label="Hesaba Giris Yap" onPress={() => router.replace("/account")} testID="order-open-account" />
          )}
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">Fatura ozeti</ThemedText>
        <View style={styles.summaryRow}>
          <ThemedText type="small">Ara toplam</ThemedText>
          <ThemedText type="smallBold">{data.subtotalText}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText type="small">Kargo</ThemedText>
          <ThemedText type="smallBold">{data.shippingCostText}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText type="small">Indirim</ThemedText>
          <ThemedText type="smallBold">{data.discountText}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText type="smallBold">Genel toplam</ThemedText>
          <ThemedText type="smallBold">{data.totalAmountText}</ThemedText>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.followUpHeader}>
          <View style={[styles.followUpIcon, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <Feather name="bell" size={16} color={activeTenant.palette.primary} />
          </View>
          <View style={styles.followUpCopy}>
            <ThemedText type="smallBold">Sonraki adimlar</ThemedText>
          </View>
        </View>
        <View style={styles.nextStepActions}>
          <FilterChip compact label="Sepete git" onPress={() => router.push("/cart")} />
          <FilterChip compact label="Tum siparisler" onPress={() => router.push("/account")} />
          <FilterChip compact label="Bildirimler" onPress={() => router.push("/notifications" as never)} />
          {data.status === "delivered" && isAuthenticated ? (
            <FilterChip compact label="Yorumlar" onPress={() => router.push("/reviews")} />
          ) : null}
          {trackingMeta ? <FilterChip compact label="Kargo takibi" onPress={() => void Linking.openURL(trackingMeta.url)} /> : null}
          {data.items[0]?.parentCategory || data.items[0]?.category ? (
            <FilterChip
              compact
              label="Benzer urunler"
              onPress={() =>
                router.push(
                  `/catalog?parent=${encodeURIComponent(
                    toFilterSlug(data.items[0]?.parentCategory || data.items[0]?.category || "")
                  )}`
                )
              }
            />
          ) : null}
          <FilterChip compact label="Destek" onPress={() => router.push("/support")} />
        </View>
      </View>

      <Pressable onPress={() => router.back()}>
        <ThemedText type="linkPrimary">Siparis listesine don</ThemedText>
      </Pressable>
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
  heroStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroStatusText: {
    color: "#ffffff",
  },
  heroTitle: {
    color: "#ffffff",
  },
  heroDescription: {
    color: "#e6f7ea",
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
    fontSize: 22,
    lineHeight: 30,
  },
  heroMetricLabel: {
    color: "#e6f7ea",
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
    ...commerceShadow("#102117", 10, 20, 0.05, 2),
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  timelinePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  returnStatusCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    gap: 6,
  },
  trackingCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    gap: 10,
  },
  trackingHeader: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  noteCard: {
    borderRadius: 18,
    padding: 12,
    gap: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  orderItemCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 20,
    padding: 12,
    backgroundColor: "#f8faf8",
  },
  orderItemImage: {
    width: 70,
    height: 70,
    borderRadius: 16,
  },
  orderItemFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  orderItemCopy: {
    flex: 1,
    gap: 6,
  },
  orderItemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  inlineMetaPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionStack: {
    gap: 10,
  },
  followUpHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  followUpIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  followUpCopy: {
    flex: 1,
    gap: 4,
  },
  nextStepActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
});

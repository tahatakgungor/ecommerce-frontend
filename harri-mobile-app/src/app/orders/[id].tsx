import { useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";

import { CommercePageHeader } from "@/components/commerce-page-header";
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
    setReorderMessage(`${data.items.length} ürün sepete eklendi.`);
  };

  if (isLoading) {
    return (
      <ScreenShell>
        <ThemedText type="small">Sipariş detayı yükleniyor...</ThemedText>
      </ScreenShell>
    );
  }

  if (error || !data) {
    return (
      <ScreenShell>
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Sipariş detayı açılamadı</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {error || "Sipariş verisi bulunamadı."}
          </ThemedText>
          <PrimaryButton label="Hesaba dön" onPress={() => router.replace("/account")} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <CommercePageHeader
        title={`Sipariş ${data.invoice}`}
        meta={data.statusText}
        actionLabel="Siparişler"
        onPressAction={() => router.push("/orders")}
      />

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.detailTopRow}>
          <View style={styles.detailCopy}>
            <ThemedText type="smallBold">{data.statusDescription}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {data.createdAtText}
            </ThemedText>
          </View>
          <View style={[styles.statusPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
              {data.statusText}
            </ThemedText>
          </View>
        </View>
        <View style={styles.orderStatsRow}>
          <View style={[styles.orderStatCard, { backgroundColor: "#f7faf7" }]}>
            <ThemedText type="small">Genel toplam</ThemedText>
            <ThemedText type="subtitle" style={styles.orderStatValue}>
              {data.totalAmountText}
            </ThemedText>
          </View>
          <View style={[styles.orderStatCard, { backgroundColor: "#f7faf7" }]}>
            <ThemedText type="small">Ürün adedi</ThemedText>
            <ThemedText type="subtitle" style={styles.orderStatValue}>
              {data.itemCount}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.summaryRow}>
          <ThemedText type="small">Ödeme</ThemedText>
          <ThemedText type="smallBold">{data.paymentMethod}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText type="small">Kargo</ThemedText>
          <ThemedText type="smallBold">{data.shippingCarrier || "Hazırlanıyor"}</ThemedText>
        </View>
        <View style={styles.timelineRow}>
          <View style={[styles.timelinePill, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
              Oluşturuldu
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
            <ThemedText type="smallBold">Sipariş notu</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {data.orderNote}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.sectionHeader}>
          <ThemedText type="smallBold">Ürünler</ThemedText>
          <FilterChip compact label="Tekrar sipariş ver" onPress={handleReorder} />
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
              ? "Bu sipariş için yorum ekleyebilir veya iade başlatabilirsin."
              : "Yorum veya iade için giriş yapman gerekir."}
          </ThemedText>
          {isAuthenticated ? (
            <View style={styles.actionStack}>
              <PrimaryButton
                label={reviewableItems.length > 0 ? "Ürünleri değerlendir" : "Yorumlarımı yönet"}
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
                label={existingReturn ? "İade durumunu gör" : "İade talebi aç"}
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
            <PrimaryButton label="Hesaba giriş yap" onPress={() => router.replace("/account")} testID="order-open-account" />
          )}
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">Fatura özeti</ThemedText>
        <View style={styles.summaryRow}>
          <ThemedText type="small">Ara toplam</ThemedText>
          <ThemedText type="smallBold">{data.subtotalText}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText type="small">Kargo</ThemedText>
          <ThemedText type="smallBold">{data.shippingCostText}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText type="small">İndirim</ThemedText>
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
            <ThemedText type="smallBold">Sonraki adımlar</ThemedText>
          </View>
        </View>
        <View style={styles.nextStepActions}>
          <FilterChip compact label="Sepete git" onPress={() => router.push("/cart")} />
          <FilterChip compact label="Tüm siparişler" onPress={() => router.push("/orders")} />
          <FilterChip compact label="Bildirimler" onPress={() => router.push("/notifications" as never)} />
          {data.status === "delivered" && isAuthenticated ? (
            <FilterChip compact label="Yorumlar" onPress={() => router.push("/reviews")} />
          ) : null}
          {trackingMeta ? <FilterChip compact label="Kargo takibi" onPress={() => void Linking.openURL(trackingMeta.url)} /> : null}
          {data.items[0]?.parentCategory || data.items[0]?.category ? (
            <FilterChip
              compact
              label="Benzer ürünler"
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
        <ThemedText type="linkPrimary">Sipariş listesine dön</ThemedText>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  detailTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  detailCopy: {
    flex: 1,
    gap: 4,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  orderStatsRow: {
    flexDirection: "row",
    gap: 10,
  },
  orderStatCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  orderStatValue: {
    color: activeTenant.palette.text,
    fontSize: 22,
    lineHeight: 30,
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

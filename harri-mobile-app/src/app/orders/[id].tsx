import { useMemo } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { PrimaryButton } from "@/components/primary-button";
import { activeTenant } from "@/domain/active-tenant";
import { useSession } from "@/modules/auth/session-provider";
import { getReturnStatusMeta } from "@/modules/orders/status";
import { buildCarrierTrackingMeta } from "@/modules/orders/tracking";
import { useOrderDetail } from "@/modules/orders/use-order-detail";
import { useReviewOverview } from "@/modules/reviews/use-review-overview";
import { useReturnRequests } from "@/modules/returns/use-return-requests";

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; invoice?: string | string[]; email?: string | string[]; viewToken?: string | string[] }>();
  const { isAuthenticated } = useSession();

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
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Siparis {data.invoice}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {data.createdAtText}
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">{data.statusText}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {data.statusDescription}
        </ThemedText>
        <View style={styles.summaryRow}>
          <ThemedText type="small">Toplam</ThemedText>
          <ThemedText type="smallBold">{data.totalAmountText}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText type="small">Odeme</ThemedText>
          <ThemedText type="smallBold">{data.paymentMethod}</ThemedText>
        </View>
        {data.shippingCarrier || data.trackingNumber ? (
          <View style={styles.metaGroup}>
            {data.shippingCarrier ? (
              <ThemedText type="small" themeColor="textSecondary">
                Kargo: {data.shippingCarrier}
              </ThemedText>
            ) : null}
            {data.trackingNumber ? (
              <ThemedText type="small" themeColor="textSecondary">
                Takip No: {data.trackingNumber}
              </ThemedText>
            ) : null}
          </View>
        ) : null}
        {trackingMeta && (data.status === "shipped" || data.status === "delivered") ? (
          <View style={[styles.trackingCard, { backgroundColor: "#f1ebff", borderColor: "#c7b2ef" }]}>
            <ThemedText type="smallBold" style={{ color: "#6a3fb0" }}>
              Kargo Takibi
            </ThemedText>
            <ThemedText type="small" style={{ color: "#6a3fb0" }}>
              {trackingMeta.carrierLabel} • {trackingMeta.trackingNumber}
            </ThemedText>
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
        <ThemedText type="smallBold">Teslimat</ThemedText>
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
          <ThemedText type="small" themeColor="textSecondary">
            Not: {data.orderNote}
          </ThemedText>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">Urunler</ThemedText>
        {data.items.map((item) => (
          <View key={item.id} style={styles.orderLine}>
            <View style={styles.orderLineInfo}>
              <ThemedText type="smallBold">{item.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.parentCategory || item.category || "Kategori yok"}
              </ThemedText>
            </View>
            <View style={styles.orderLineMeta}>
              <ThemedText type="small">{item.quantity} adet</ThemedText>
              <ThemedText type="smallBold">{item.priceText}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {data.status === "delivered" ? (
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Siparis sonrasi islemler</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isAuthenticated
              ? "Yorum ekleme ve iade kaydi bu siparis icin mobilde acik."
              : "Yorum ve iade gibi hesap bagli islemler icin giris gerekli. Yine de paylasim linkiyle siparis ve kargo durumunu gorebilirsiniz."}
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

      <Pressable onPress={() => router.back()}>
        <ThemedText type="linkPrimary">Siparis listesine don</ThemedText>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
  },
  title: {
    lineHeight: 38,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  metaGroup: {
    gap: 4,
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
    gap: 8,
  },
  orderLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#d8e5d8",
  },
  orderLineInfo: {
    flex: 1,
    gap: 4,
  },
  orderLineMeta: {
    alignItems: "flex-end",
    gap: 4,
  },
  actionStack: {
    gap: 10,
  },
});

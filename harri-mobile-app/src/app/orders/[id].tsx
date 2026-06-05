import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { PrimaryButton } from "@/components/primary-button";
import { activeTenant } from "@/domain/active-tenant";
import { useOrderDetail } from "@/modules/orders/use-order-detail";

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; invoice?: string | string[]; email?: string | string[] }>();

  const orderId = Array.isArray(params.id) ? params.id[0] || "" : params.id || "";
  const invoice = Array.isArray(params.invoice) ? params.invoice[0] || "" : params.invoice || "";
  const email = Array.isArray(params.email) ? params.email[0] || "" : params.email || "";

  const guestLookup = useMemo(
    () => (invoice.trim() && email.trim() ? { invoice: invoice.trim(), email: email.trim() } : null),
    [email, invoice]
  );

  const { data, isLoading, error } = useOrderDetail(orderId, guestLookup);

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
});

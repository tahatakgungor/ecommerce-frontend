import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { CommercePageHeader } from "@/components/commerce-page-header";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useSession } from "@/modules/auth/session-provider";
import { buildOrderOverview, filterOrdersByStatus } from "@/modules/orders/helpers";
import { useOrderHistory } from "@/modules/orders/use-order-history";
import type { OrderFilter, OrderSummary } from "@/modules/orders/types";

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated, isBootstrapping } = useSession();
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const { data: orders, isLoading, isRefreshing, error, refresh } = useOrderHistory(isAuthenticated);

  const overview = useMemo(() => buildOrderOverview(orders), [orders]);
  const filteredOrders = useMemo(() => filterOrdersByStatus(orders, activeFilter), [activeFilter, orders]);

  const filterCards: Array<{ key: OrderFilter; label: string; count: number }> = [
    { key: "all", label: "Tümü", count: overview.total },
    { key: "pending", label: "Alındı", count: overview.pending },
    { key: "processing", label: "Hazırlanıyor", count: overview.processing },
    { key: "shipped", label: "Kargoda", count: overview.shipped },
    { key: "delivered", label: "Teslim", count: overview.delivered },
  ];

  const renderOrderCard = ({ item }: { item: OrderSummary }) => (
    <Pressable
      onPress={() => router.push(`/orders/${item.id}`)}
      testID={`order-card-${item.id}`}
      style={({ pressed }) => [
        styles.orderCard,
        {
          backgroundColor: activeTenant.palette.surface,
          borderColor: activeTenant.palette.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.orderTopRow}>
        <View style={styles.orderIdentity}>
          <ThemedText type="smallBold">{item.invoice}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {item.createdAtText}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: resolveStatusBackground(item.statusTone), borderColor: resolveStatusBorder(item.statusTone) },
          ]}
        >
          <ThemedText type="smallBold" style={{ color: resolveStatusText(item.statusTone) }}>
            {item.statusText}
          </ThemedText>
        </View>
      </View>

      <View style={styles.orderMetrics}>
        <View style={styles.metricBlock}>
          <ThemedText type="small" themeColor="textSecondary">
            Toplam
          </ThemedText>
          <ThemedText type="smallBold">{item.totalAmountText}</ThemedText>
        </View>
        <View style={styles.metricBlock}>
          <ThemedText type="small" themeColor="textSecondary">
            Ürün
          </ThemedText>
          <ThemedText type="smallBold">{item.itemCount} adet</ThemedText>
        </View>
        <View style={styles.metricBlock}>
          <ThemedText type="small" themeColor="textSecondary">
            Ödeme
          </ThemedText>
          <ThemedText type="smallBold">{item.paymentMethod}</ThemedText>
        </View>
      </View>
    </Pressable>
  );

  if (isBootstrapping) {
    return (
      <ScreenShell>
        <ThemedText type="small">Siparişler hazırlanıyor...</ThemedText>
      </ScreenShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenShell>
        <CommercePageHeader title="Siparişler" meta="Misafir siparişi" actionLabel="Hesap" onPressAction={() => router.push("/account")} />
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Siparişlerini görmek için giriş yap</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Hesabına girdikten sonra tüm siparişlerini buradan takip edebilirsin.
          </ThemedText>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scroll={false}>
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <CommercePageHeader title="Siparişler" meta={`${overview.total} sipariş`} actionLabel="Hesap" onPressAction={() => router.push("/account")} />
            <View style={styles.summaryStrip}>
              {filterCards.map((card) => (
                <Pressable
                  key={card.key}
                  onPress={() => setActiveFilter(card.key)}
                  style={[
                    styles.summaryChip,
                    {
                      backgroundColor: activeFilter === card.key ? activeTenant.palette.primarySoft : activeTenant.palette.surface,
                      borderColor: activeFilter === card.key ? activeTenant.palette.primary : activeTenant.palette.border,
                    },
                  ]}
                >
                  <ThemedText type="smallBold">{card.label}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{`${card.count} sipariş`}</ThemedText>
                </Pressable>
              ))}
            </View>
            <View style={styles.listHeaderRow}>
              <ThemedText type="smallBold">Sipariş listesi</ThemedText>
              <Pressable onPress={() => void refresh()}>
                <ThemedText type="linkPrimary">Yenile</ThemedText>
              </Pressable>
            </View>
            {error ? (
              <ThemedText type="small" style={{ color: "#b42318" }}>
                {error}
              </ThemedText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ThemedText type="small">Siparişler yükleniyor...</ThemedText>
          ) : (
            <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
              <ThemedText type="smallBold">Sipariş yok</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Seçili filtrede kayıt yok.
              </ThemedText>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={activeTenant.palette.primary} />}
      />
    </ScreenShell>
  );
}

function resolveStatusBackground(tone: OrderSummary["statusTone"]) {
  if (tone === "warning") return "#fff7e6";
  if (tone === "info") return "#eef6ff";
  if (tone === "primary") return "#eef8f0";
  if (tone === "success") return "#ecfdf3";
  if (tone === "danger") return "#fef3f2";
  return "#f4f4f5";
}

function resolveStatusBorder(tone: OrderSummary["statusTone"]) {
  if (tone === "warning") return "#f5c46b";
  if (tone === "info") return "#91caff";
  if (tone === "primary") return "#82c995";
  if (tone === "success") return "#86efac";
  if (tone === "danger") return "#fda29b";
  return "#d4d4d8";
}

function resolveStatusText(tone: OrderSummary["statusTone"]) {
  if (tone === "warning") return "#8a5b09";
  if (tone === "info") return "#174ea6";
  if (tone === "primary") return "#185c33";
  if (tone === "success") return "#166534";
  if (tone === "danger") return "#b42318";
  return "#52525b";
}

const styles = StyleSheet.create({
  headerStack: {
    gap: 16,
    marginBottom: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  summaryStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryChip: {
    flexBasis: "48%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 2,
    minHeight: 68,
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listContent: {
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 14,
  },
  orderCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  orderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  orderIdentity: {
    flex: 1,
    gap: 4,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  orderMetrics: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  metricBlock: {
    flex: 1,
    minWidth: 84,
    gap: 4,
  },
});

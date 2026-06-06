import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useSession } from "@/modules/auth/session-provider";
import { buildOrderOverview, filterOrdersByStatus } from "@/modules/orders/helpers";
import { lookupGuestOrder } from "@/modules/orders/api";
import { useOrderHistory } from "@/modules/orders/use-order-history";
import type { OrderFilter, OrderSummary } from "@/modules/orders/types";

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isBootstrapping, isSubmitting, error, signIn, signOut } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lookupInvoice, setLookupInvoice] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [isLookupSubmitting, setIsLookupSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const { data: orders, isLoading: isOrdersLoading, isRefreshing, error: ordersError, refresh } = useOrderHistory(isAuthenticated);
  const deferredOrders = useDeferredValue(orders);
  const overview = useMemo(() => buildOrderOverview(deferredOrders), [deferredOrders]);
  const filteredOrders = useMemo(() => filterOrdersByStatus(deferredOrders, activeFilter), [activeFilter, deferredOrders]);

  useEffect(() => {
    if (user?.email) {
      setLookupEmail((current) => current || user.email);
    }
  }, [user?.email]);

  const handleLogin = async () => {
    setLoginError(null);
    if (!email.trim() || !password.trim()) {
      setLoginError("E-posta ve sifre gerekli.");
      return;
    }

    try {
      await signIn({
        email: email.trim(),
        password,
      });
      setPassword("");
      setLookupEmail((current) => current || email.trim());
    } catch (nextError) {
      setLoginError(nextError instanceof Error ? nextError.message : "Login failed");
    }
  };

  const handleLookupOrder = async () => {
    setLookupError(null);

    if (!lookupInvoice.trim() || !lookupEmail.trim()) {
      setLookupError("Fatura numarasi ve e-posta gerekli.");
      return;
    }

    setIsLookupSubmitting(true);
    try {
      const order = await lookupGuestOrder({
        invoice: lookupInvoice.trim(),
        email: lookupEmail.trim(),
      });
      router.push(`/orders/${order.id}?invoice=${encodeURIComponent(lookupInvoice.trim())}&email=${encodeURIComponent(lookupEmail.trim())}`);
    } catch (nextError) {
      setLookupError(nextError instanceof Error ? nextError.message : "Siparis bulunamadi.");
    } finally {
      setIsLookupSubmitting(false);
    }
  };

  const filterCards: Array<{ key: OrderFilter; label: string; count: number }> = [
    { key: "all", label: "Tum Siparisler", count: overview.total },
    { key: "pending", label: "Alindi", count: overview.pending },
    { key: "processing", label: "Hazirlaniyor", count: overview.processing },
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
            Urun
          </ThemedText>
          <ThemedText type="smallBold">{item.itemCount} adet</ThemedText>
        </View>
        <View style={styles.metricBlock}>
          <ThemedText type="small" themeColor="textSecondary">
            Odeme
          </ThemedText>
          <ThemedText type="smallBold">{item.paymentMethod}</ThemedText>
        </View>
      </View>

      {(item.shippingCarrier || item.trackingNumber) && item.status !== "pending" ? (
        <ThemedText type="small" themeColor="textSecondary">
          {item.shippingCarrier ? `${item.shippingCarrier}` : "Kargo"} {item.trackingNumber ? `• ${item.trackingNumber}` : ""}
        </ThemedText>
      ) : null}
    </Pressable>
  );

  const header = (
    <View style={styles.headerStack}>
      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="subtitle" style={styles.title}>
          Hesap
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Session token guvenli saklamada tutulur. Siparis goruntuleme auth veya invoice + e-posta dogrulamasiyla acilir.
        </ThemedText>
      </View>

      {isAuthenticated && user ? (
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">{user.name || `${user.firstName} ${user.lastName}`.trim() || user.email}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {user.email}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {user.city || "Sehir yok"} / {user.country || "Ulke yok"}
          </ThemedText>
          <PrimaryButton
            label={isSubmitting ? "Cikis yapiliyor..." : "Cikis Yap"}
            onPress={() => {
              void signOut();
            }}
            disabled={isSubmitting}
            testID="account-sign-out"
            variant="outline"
          />
          <View style={styles.inlineActions}>
            <PrimaryButton label="Profil" onPress={() => router.push("../profile")} testID="account-open-profile" variant="outline" style={styles.inlineActionButton} />
            <PrimaryButton label="Favorilerim" onPress={() => router.push("../wishlist")} testID="account-open-wishlist" variant="outline" style={styles.inlineActionButton} />
            <PrimaryButton label="Sifre" onPress={() => router.push("../change-password")} testID="account-open-change-password" variant="outline" style={styles.inlineActionButton} />
            <PrimaryButton label="Destek" onPress={() => router.push("../support")} testID="account-open-support" variant="outline" style={styles.inlineActionButton} />
          </View>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <TextField
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@serravit.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextField
            label="Sifre"
            value={password}
            onChangeText={setPassword}
            placeholder="Sifreniz"
            secureTextEntry
            autoCapitalize="none"
          />
          {loginError || error ? (
            <ThemedText type="small" style={{ color: "#b42318" }}>
              {loginError || error}
            </ThemedText>
          ) : null}
          <PrimaryButton
            label={isSubmitting ? "Giris yapiliyor..." : "Giris Yap"}
            onPress={() => {
              void handleLogin();
            }}
            disabled={isSubmitting}
            testID="account-sign-in"
          />
          <View style={styles.inlineActions}>
            <PrimaryButton
              label="Hesap Olustur"
              onPress={() => router.push("../register")}
              testID="account-open-register"
              variant="outline"
              style={styles.inlineActionButton}
            />
            <PrimaryButton
              label="Sifremi Unuttum"
              onPress={() => router.push("../forgot-password")}
              testID="account-open-forgot-password"
              variant="outline"
              style={styles.inlineActionButton}
            />
            <PrimaryButton
              label="Destek"
              onPress={() => router.push("../support")}
              testID="account-open-support"
              variant="outline"
              style={styles.inlineActionButton}
            />
          </View>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">Misafir Siparis Sorgula</ThemedText>
        <TextField
          label="Fatura No"
          value={lookupInvoice}
          onChangeText={setLookupInvoice}
          placeholder="SRV-1001"
          autoCapitalize="characters"
        />
        <TextField
          label="E-posta"
          value={lookupEmail}
          onChangeText={setLookupEmail}
          placeholder="ornek@mail.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <ThemedText type="small" themeColor="textSecondary">
          Login olmasa bile invoice + email ile siparis detayi acilabilir. Bu akista rate limit backend tarafinda zorlanir.
        </ThemedText>
        {lookupError ? (
          <ThemedText type="small" style={{ color: "#b42318" }}>
            {lookupError}
          </ThemedText>
        ) : null}
        <PrimaryButton
          label={isLookupSubmitting ? "Sorgulaniyor..." : "Siparisi Ac"}
          onPress={() => {
            void handleLookupOrder();
          }}
          disabled={isLookupSubmitting}
          testID="account-guest-order-lookup"
          variant="outline"
        />
      </View>

      {isAuthenticated ? (
        <>
          <View style={[styles.summaryStrip, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.border }]}>
            {filterCards.map((card) => (
              <Pressable
                key={card.key}
                onPress={() => {
                  startTransition(() => {
                    setActiveFilter(card.key);
                  });
                }}
                style={[
                  styles.summaryChip,
                  {
                    backgroundColor: activeFilter === card.key ? activeTenant.palette.surface : "transparent",
                    borderColor: activeFilter === card.key ? activeTenant.palette.primary : activeTenant.palette.border,
                  },
                ]}
              >
                <ThemedText type="smallBold">{card.count}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {card.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={styles.listHeaderRow}>
            <ThemedText type="smallBold">Siparisler</ThemedText>
            <Pressable onPress={() => void refresh()}>
              <ThemedText type="linkPrimary">Yenile</ThemedText>
            </Pressable>
          </View>
          {ordersError ? (
            <ThemedText type="small" style={{ color: "#b42318" }}>
              {ordersError}
            </ThemedText>
          ) : null}
        </>
      ) : null}
    </View>
  );

  if (isBootstrapping) {
    return (
      <ScreenShell>
        <ThemedText type="small">Session kontrol ediliyor...</ThemedText>
      </ScreenShell>
    );
  }

  if (isAuthenticated) {
    return (
      <ScreenShell scroll={false}>
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderCard}
          ListHeaderComponent={header}
          ListEmptyComponent={
            isOrdersLoading ? (
              <ThemedText type="small">Siparisler yukleniyor...</ThemedText>
            ) : (
              <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
                <ThemedText type="smallBold">Siparis yok</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Secili filtrede henuz kayitli siparis bulunmuyor.
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

  return (
    <ScreenShell>
      {header}
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
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  title: {
    lineHeight: 38,
  },
  headerStack: {
    gap: 18,
  },
  inlineActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  inlineActionButton: {
    minWidth: 156,
  },
  summaryStrip: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryChip: {
    minWidth: 110,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listContent: {
    paddingBottom: 28,
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
  },
  metricBlock: {
    flex: 1,
    gap: 4,
  },
});

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { buildNotificationFeed } from "@/modules/notifications/logic";
import { useSession } from "@/modules/auth/session-provider";
import { buildOrderOverview, filterOrdersByStatus } from "@/modules/orders/helpers";
import { lookupGuestOrder } from "@/modules/orders/api";
import { useOrderHistory } from "@/modules/orders/use-order-history";
import type { OrderFilter, OrderSummary } from "@/modules/orders/types";
import { usePreferences } from "@/modules/preferences/preferences-provider";
import { useReviewOverview } from "@/modules/reviews/use-review-overview";
import { useReturnRequests } from "@/modules/returns/use-return-requests";

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
  const { data: reviewOverview } = useReviewOverview(isAuthenticated);
  const { data: returnRequests } = useReturnRequests(isAuthenticated);
  const { preferences } = usePreferences();
  const deferredOrders = useDeferredValue(orders);
  const overview = useMemo(() => buildOrderOverview(deferredOrders), [deferredOrders]);
  const filteredOrders = useMemo(() => filterOrdersByStatus(deferredOrders, activeFilter), [activeFilter, deferredOrders]);
  const notificationFeed = useMemo(
    () =>
      buildNotificationFeed({
        isAuthenticated,
        orderOverview: overview,
        recentOrders: deferredOrders,
        reviewOverview,
        returnRequests,
        offers: [],
        preferences,
      }),
    [deferredOrders, isAuthenticated, overview, preferences, returnRequests, reviewOverview]
  );

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
  const shortcutActions = isAuthenticated
    ? [
        { label: "Profil", icon: "user", route: "../profile", testID: "account-open-profile" },
        { label: "Favoriler", icon: "heart", route: "../wishlist", testID: "account-open-wishlist" },
        { label: "Bildirimler", icon: "bell", route: "../notifications", testID: "account-open-notifications" },
        { label: "Yorumlar", icon: "message-square", route: "../reviews", testID: "account-open-reviews" },
        { label: "Iadeler", icon: "rotate-ccw", route: "../returns", testID: "account-open-returns" },
        { label: "Sifre", icon: "lock", route: "../change-password", testID: "account-open-change-password" },
        { label: "Destek", icon: "life-buoy", route: "../support", testID: "account-open-support" },
        { label: "Tercihler", icon: "sliders", route: "../preferences", testID: "account-open-preferences" },
      ]
    : [
        { label: "Hesap Olustur", icon: "user-plus", route: "../register", testID: "account-open-register" },
        { label: "Sifremi Unuttum", icon: "help-circle", route: "../forgot-password", testID: "account-open-forgot-password" },
        { label: "Bildirimler", icon: "bell", route: "../notifications", testID: "account-open-notifications" },
        { label: "Destek", icon: "life-buoy", route: "../support", testID: "account-open-support" },
      ];
  const contentHubActions = [
    { label: "Blog", icon: "book-open", route: "../blog" },
    { label: "Kampanyalar", icon: "tag", route: "../roadmap" },
    { label: "Iletisim", icon: "phone", route: "../contact" },
    { label: "Kosullar", icon: "file-text", route: "../terms" },
  ];
  const latestOrder = deferredOrders[0] || null;

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
      <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.primary }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Feather name="user" size={14} color="#ffffff" />
            <ThemedText type="smallBold" style={styles.heroBadgeText}>
              Hesabim
            </ThemedText>
          </View>
          <View style={styles.heroTrustRow}>
            <Feather name="shield" size={14} color="#d8f5df" />
            <ThemedText type="smallBold" style={styles.heroTrustText}>
              Guvenli giris
            </ThemedText>
          </View>
        </View>
        <ThemedText type="subtitle" style={styles.heroTitle}>
          Siparislerini, iade ve yorumlarini tek yerden yonet
        </ThemedText>
        <ThemedText type="small" style={styles.heroDescription}>
          Hesap alani sadece giris degil; siparis sonrasi tum aksiyonlarin toplandigi mobil kontrol merkezi.
        </ThemedText>
      </View>

      <View style={[styles.serviceCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <View style={styles.serviceHeader}>
          <Feather name="shield" size={16} color={activeTenant.palette.primary} />
          <ThemedText type="smallBold">Siparis guvencesi</ThemedText>
        </View>
        <View style={styles.serviceGrid}>
          <View style={[styles.servicePill, { backgroundColor: "#f7faf7" }]}>
            <ThemedText type="smallBold">Misafir takip</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Hesap acmadan fatura no ile siparise ulas.
            </ThemedText>
          </View>
          <View style={[styles.servicePill, { backgroundColor: "#f7faf7" }]}>
            <ThemedText type="smallBold">Kolay iade</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Teslim sonrasi yorum ve iade ayni panelde.
            </ThemedText>
          </View>
        </View>
      </View>

      {isAuthenticated && user ? (
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <View style={styles.profileHeroRow}>
            <View style={[styles.avatarBubble, { backgroundColor: activeTenant.palette.primarySoft }]}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                {(user.name || user.firstName || user.email || "S").slice(0, 1).toUpperCase()}
              </ThemedText>
            </View>
            <View style={styles.profileCopy}>
              <ThemedText type="smallBold">{user.name || `${user.firstName} ${user.lastName}`.trim() || user.email}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {user.email}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {user.city || "Sehir yok"} / {user.country || "Ulke yok"}
              </ThemedText>
            </View>
          </View>
          <View style={styles.accountMetrics}>
            <View style={[styles.accountMetricCard, { backgroundColor: "#f7faf7" }]}>
              <ThemedText type="small">Toplam siparis</ThemedText>
              <ThemedText type="subtitle" style={styles.accountMetricValue}>
                {overview.total}
              </ThemedText>
            </View>
            <View style={[styles.accountMetricCard, { backgroundColor: "#f7faf7" }]}>
              <ThemedText type="small">Teslim edilen</ThemedText>
              <ThemedText type="subtitle" style={styles.accountMetricValue}>
                {overview.delivered}
              </ThemedText>
            </View>
          </View>
          <View style={styles.assuranceRow}>
            <View style={[styles.assurancePill, { backgroundColor: activeTenant.palette.primarySoft }]}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                {reviewOverview.pending.length ? `${reviewOverview.pending.length} yorum bekliyor` : "Yorum merkezi hazir"}
              </ThemedText>
            </View>
            <View style={[styles.assurancePill, { backgroundColor: "#f5efe7" }]}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.accent }}>
                {returnRequests.length ? `${returnRequests.length} acik iade kaydi` : "Iade takibi acik"}
              </ThemedText>
            </View>
          </View>
          <PrimaryButton
            label={isSubmitting ? "Cikis yapiliyor..." : "Cikis Yap"}
            onPress={() => {
              void signOut();
            }}
            disabled={isSubmitting}
            testID="account-sign-out"
            variant="outline"
          />
          <View style={styles.shortcutGrid}>
            {shortcutActions.map((action) => (
              <Pressable
                key={action.testID}
                onPress={() => router.push(action.route as never)}
                testID={action.testID}
                style={({ pressed }) => [
                  styles.shortcutCard,
                  { backgroundColor: "#f7faf7", borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
                ]}
              >
                <Feather name={action.icon as never} size={16} color={activeTenant.palette.primary} />
                <ThemedText type="smallBold">{action.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Giris yap veya hizli kayit ol</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Siparis takibi, favoriler, yorumlar ve iade yonetimi icin hesabinla devam et.
          </ThemedText>
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
          <View style={styles.shortcutGrid}>
            {shortcutActions.map((action) => (
              <Pressable
                key={action.testID}
                onPress={() => router.push(action.route as never)}
                testID={action.testID}
                style={({ pressed }) => [
                  styles.shortcutCard,
                  { backgroundColor: "#f7faf7", borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
                ]}
              >
                <Feather name={action.icon as never} size={16} color={activeTenant.palette.primary} />
                <ThemedText type="smallBold">{action.label}</ThemedText>
              </Pressable>
            ))}
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
          Hesabin olmasa bile fatura numarasi ve e-posta ile siparis detayina ulasabilirsin.
        </ThemedText>
        <View style={styles.lookupTrustRow}>
          <View style={[styles.lookupTrustPill, { backgroundColor: "#f7faf7" }]}>
            <ThemedText type="smallBold">Hizli takip</ThemedText>
          </View>
          <View style={[styles.lookupTrustPill, { backgroundColor: "#f7faf7" }]}>
            <ThemedText type="smallBold">Destek baglantili</ThemedText>
          </View>
        </View>
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
          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Siparis sonrasi araclar</ThemedText>
            <View style={styles.utilityMetricGrid}>
              <View style={[styles.utilityMetricCard, { backgroundColor: "#f8faf8" }]}>
                <ThemedText type="small">Bekleyen yorum</ThemedText>
                <ThemedText type="subtitle" style={styles.utilityMetricValue}>
                  {reviewOverview.pending.length}
                </ThemedText>
              </View>
              <View style={[styles.utilityMetricCard, { backgroundColor: "#f8faf8" }]}>
                <ThemedText type="small">Aktif iade</ThemedText>
                <ThemedText type="subtitle" style={styles.utilityMetricValue}>
                  {returnRequests.length}
                </ThemedText>
              </View>
              <View style={[styles.utilityMetricCard, { backgroundColor: "#f8faf8" }]}>
                <ThemedText type="small">Acik bildirim</ThemedText>
                <ThemedText type="subtitle" style={styles.utilityMetricValue}>
                  {Object.values(preferences.notifications).filter(Boolean).length}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              Teslim edilen siparisler icin yorum ekleyebilir, acik iade kayitlarini ve bildirim tercihlerini ayni yerden yonetebilirsin.
            </ThemedText>
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.opsHeader}>
              <View style={[styles.opsIcon, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <Feather name="activity" size={16} color={activeTenant.palette.primary} />
              </View>
              <View style={styles.opsCopy}>
                <ThemedText type="smallBold">Operasyon merkezi</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Siparis, bildirim ve kesif hafizasini tek karar kartinda topladim.
                </ThemedText>
              </View>
            </View>
            <View style={styles.utilityMetricGrid}>
              <View style={[styles.utilityMetricCard, { backgroundColor: "#f8faf8" }]}>
                <ThemedText type="small">Son siparis</ThemedText>
                <ThemedText type="smallBold">{latestOrder ? latestOrder.invoice : "Henuz yok"}</ThemedText>
              </View>
              <View style={[styles.utilityMetricCard, { backgroundColor: "#fff8f1" }]}>
                <ThemedText type="small">Son arama</ThemedText>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {preferences.recentSearches[0] || "Kayit yok"}
                </ThemedText>
              </View>
            </View>
            <View style={styles.shortcutGrid}>
              {latestOrder ? (
                <Pressable
                  onPress={() => router.push(`/orders/${latestOrder.id}`)}
                  style={({ pressed }) => [
                    styles.shortcutCard,
                    { backgroundColor: "#f7faf7", borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
                  ]}
                >
                  <Feather name="package" size={16} color={activeTenant.palette.primary} />
                  <ThemedText type="smallBold">Son siparisi ac</ThemedText>
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => router.push("../notifications")}
                style={({ pressed }) => [
                  styles.shortcutCard,
                  { backgroundColor: "#f7faf7", borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
                ]}
              >
                <Feather name="bell" size={16} color={activeTenant.palette.primary} />
                <ThemedText type="smallBold">Bildirimleri ac</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => router.push("../catalog")}
                style={({ pressed }) => [
                  styles.shortcutCard,
                  { backgroundColor: "#fff8f1", borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
                ]}
              >
                <Feather name="shopping-bag" size={16} color={activeTenant.palette.accent} />
                <ThemedText type="smallBold">Kataloga don</ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Kisisel kesif ayarlari</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {preferences.recentSearches.length} kayitli arama, {preferences.recentlyViewed.length} son bakilan urun ve cihaz bazli bildirim tercihlerin burada toplanir.
            </ThemedText>
            <PrimaryButton label="Tercih Merkezini Ac" onPress={() => router.push("../preferences")} variant="outline" testID="account-open-preferences-panel" />
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Kesif hafizasi</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Son aradiklarin ve son baktigin urunler burada. Web tarafindaki yeniden kesif mantigini mobile dashboard icine de tasidim.
            </ThemedText>
            <View style={styles.discoveryMemoryRow}>
              {preferences.recentSearches.slice(0, 3).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => router.push(`/catalog?query=${encodeURIComponent(item)}` as never)}
                  style={({ pressed }) => [
                    styles.discoveryMemoryCard,
                    { backgroundColor: "#f9fbf8", borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
                  ]}
                >
                  <Feather name="search" size={15} color={activeTenant.palette.primary} />
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {item}
                  </ThemedText>
                </Pressable>
              ))}
              {preferences.recentlyViewed.slice(0, 2).map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(`/product/${item.id}` as never)}
                  style={({ pressed }) => [
                    styles.discoveryMemoryCard,
                    { backgroundColor: "#fffaf4", borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
                  ]}
                >
                  <Feather name="clock" size={15} color={activeTenant.palette.accent} />
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.notificationHeader}>
              <View style={[styles.notificationIcon, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <Feather name="bell" size={16} color={activeTenant.palette.primary} />
              </View>
              <View style={styles.notificationCopy}>
                <ThemedText type="smallBold">Bildirim ozeti</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Siparis, yorum, iade ve kesif sinyallerini tek merkezde toplayan mobil inbox.
                </ThemedText>
              </View>
            </View>
            {notificationFeed.length ? (
              <View style={styles.discoveryMemoryRow}>
                {notificationFeed.slice(0, 3).map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => router.push(item.route as never)}
                    style={({ pressed }) => [
                      styles.discoveryMemoryCard,
                      { backgroundColor: "#f9fbf8", borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
                    ]}
                  >
                    <Feather name={item.icon as never} size={15} color={activeTenant.palette.primary} />
                    <ThemedText type="smallBold" numberOfLines={1}>
                      {item.title}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                Su an acik aksiyon sinyali yok. Yeni siparis, kampanya veya yorum adimi olustugunda burada da gorunur.
              </ThemedText>
            )}
            <PrimaryButton label="Bildirim Merkezini Ac" onPress={() => router.push("../notifications")} variant="outline" testID="account-open-notification-center" />
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Icerik ve destek merkezi</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Web tarafindaki blog, kampanya ve destek yardimcilari mobile dashboard icinden de hizli ulasilabilir olsun diye burada toplandi.
            </ThemedText>
            <View style={styles.contentHubGrid}>
              {contentHubActions.map((action) => (
                <Pressable
                  key={action.label}
                  onPress={() => router.push(action.route as never)}
                  style={({ pressed }) => [
                    styles.contentHubCard,
                    { backgroundColor: "#f9fbf8", borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
                  ]}
                >
                  <Feather name={action.icon as never} size={16} color={action.label === "Kampanyalar" ? activeTenant.palette.accent : activeTenant.palette.primary} />
                  <ThemedText type="smallBold">{action.label}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

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
  heroCard: {
    borderRadius: 30,
    padding: 22,
    gap: 16,
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
  heroTrustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroTrustText: {
    color: "#d8f5df",
  },
  heroTitle: {
    color: "#ffffff",
  },
  heroDescription: {
    color: "#e6f7ea",
  },
  serviceCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  serviceGrid: {
    flexDirection: "row",
    gap: 12,
  },
  servicePill: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  headerStack: {
    gap: 18,
  },
  profileHeroRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  avatarBubble: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  accountMetrics: {
    flexDirection: "row",
    gap: 12,
  },
  accountMetricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  accountMetricValue: {
    lineHeight: 34,
  },
  assuranceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  assurancePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  shortcutGrid: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  shortcutCard: {
    minWidth: 104,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
  },
  utilityMetricGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  utilityMetricCard: {
    flex: 1,
    minWidth: 102,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  utilityMetricValue: {
    lineHeight: 36,
  },
  opsHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  opsIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  opsCopy: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationCopy: {
    flex: 1,
    gap: 4,
  },
  discoveryMemoryRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  discoveryMemoryCard: {
    minWidth: 136,
    maxWidth: "48%",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
  },
  contentHubGrid: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  contentHubCard: {
    minWidth: 130,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
  },
  lookupTrustRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  lookupTrustPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    flexWrap: "wrap",
  },
  metricBlock: {
    flex: 1,
    minWidth: 84,
    gap: 4,
  },
});

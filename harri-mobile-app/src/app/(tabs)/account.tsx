import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { CommercePageHeader } from "@/components/commerce-page-header";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useSession } from "@/modules/auth/session-provider";
import { buildOrderOverview } from "@/modules/orders/helpers";
import { useOrderHistory } from "@/modules/orders/use-order-history";
import { usePreferences } from "@/modules/preferences/preferences-provider";
import { useReviewOverview } from "@/modules/reviews/use-review-overview";
import { useReturnRequests } from "@/modules/returns/use-return-requests";

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isBootstrapping, isSubmitting, error, signIn, signOut } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const { data: orders } = useOrderHistory(isAuthenticated);
  const { data: reviewOverview } = useReviewOverview(isAuthenticated);
  const { data: returnRequests } = useReturnRequests(isAuthenticated);
  const { preferences } = usePreferences();
  const overview = useMemo(() => buildOrderOverview(orders), [orders]);

  const handleLogin = async () => {
    setLoginError(null);
    if (!email.trim() || !password.trim()) {
      setLoginError("E-posta ve şifre gerekli.");
      return;
    }

    try {
      await signIn({
        email: email.trim(),
        password,
      });
      setPassword("");
    } catch (nextError) {
      setLoginError(nextError instanceof Error ? nextError.message : "Giriş başarısız.");
    }
  };

  const shortcutActions = isAuthenticated
    ? [
        { label: "Siparişler", icon: "package", route: "/orders", testID: "account-open-orders" },
        { label: "Profil", icon: "user", route: "../profile", testID: "account-open-profile" },
        { label: "Favoriler", icon: "heart", route: "../wishlist", testID: "account-open-wishlist" },
        { label: "Bildirimler", icon: "bell", route: "../notifications", testID: "account-open-notifications" },
        { label: "Yorumlar", icon: "message-square", route: "../reviews", testID: "account-open-reviews" },
        { label: "İadeler", icon: "rotate-ccw", route: "../returns", testID: "account-open-returns" },
        { label: "Şifre", icon: "lock", route: "../change-password", testID: "account-open-change-password" },
        { label: "Destek", icon: "life-buoy", route: "../support", testID: "account-open-support" },
        { label: "Tercihler", icon: "sliders", route: "../preferences", testID: "account-open-preferences" },
      ]
    : [
        { label: "Siparişler", icon: "package", route: "/orders", testID: "account-open-orders" },
        { label: "Hesap Oluştur", icon: "user-plus", route: "../register", testID: "account-open-register" },
        { label: "Şifremi Unuttum", icon: "help-circle", route: "../forgot-password", testID: "account-open-forgot-password" },
        { label: "Bildirimler", icon: "bell", route: "../notifications", testID: "account-open-notifications" },
        { label: "Destek", icon: "life-buoy", route: "../support", testID: "account-open-support" },
      ];
  const contentHubActions = [
    { label: "Blog", icon: "book-open", route: "../blog" },
    { label: "Kampanyalar", icon: "tag", route: "../roadmap" },
    { label: "İletişim", icon: "phone", route: "../contact" },
    { label: "Koşullar", icon: "file-text", route: "../terms" },
  ];
  const latestOrder = orders[0] || null;

  const renderShortcutRow = (
    action: { label: string; icon: string; route: string; testID?: string },
    options?: {
      iconTone?: "primary" | "accent";
      backgroundColor?: string;
    }
  ) => {
    const iconTone = options?.iconTone || "primary";
    const iconColor = iconTone === "accent" ? activeTenant.palette.accent : activeTenant.palette.primary;
    const iconBackground = iconTone === "accent" ? "#fff6ed" : activeTenant.palette.primarySoft;

    return (
      <Pressable
        key={action.testID || action.label}
        onPress={() => router.push(action.route as never)}
        testID={action.testID}
        style={({ pressed }) => [
          styles.shortcutCard,
          {
            backgroundColor: options?.backgroundColor || "#fcfdfc",
            borderColor: activeTenant.palette.border,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View style={styles.shortcutCardContent}>
          <View style={[styles.shortcutIconWrap, { backgroundColor: iconBackground }]}>
            <Feather name={action.icon as never} size={16} color={iconColor} />
          </View>
          <ThemedText type="smallBold">{action.label}</ThemedText>
        </View>
        <Feather name="chevron-right" size={18} color={activeTenant.palette.mutedText} />
      </Pressable>
    );
  };

  const renderSupportRow = (entry: {
    key: string;
    label: string;
    subtitle?: string;
    icon: keyof typeof Feather.glyphMap;
    route: string;
    accent?: boolean;
    testID?: string;
  }) => (
    <Pressable
      key={entry.key}
      onPress={() => router.push(entry.route as never)}
      testID={entry.testID}
      style={({ pressed }) => [
        styles.signalRow,
        {
          backgroundColor: entry.accent ? "#fffaf4" : "#fcfdfc",
          borderColor: activeTenant.palette.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.signalRowContent}>
        <View
          style={[
            styles.signalIconWrap,
            { backgroundColor: entry.accent ? "#fff2e6" : activeTenant.palette.primarySoft },
          ]}
        >
          <Feather
            name={entry.icon}
            size={15}
            color={entry.accent ? activeTenant.palette.accent : activeTenant.palette.primary}
          />
        </View>
        <View style={styles.signalCopy}>
          <ThemedText type="smallBold">{entry.label}</ThemedText>
          {entry.subtitle ? (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {entry.subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={activeTenant.palette.mutedText} />
    </Pressable>
  );

  const header = (
    <View style={styles.headerStack}>
      <CommercePageHeader
        title="Siparişlerin ve hesabın"
        meta={isAuthenticated ? `${overview.total} sipariş` : "Hesap"}
      />

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
                {user.city || "Şehir yok"} / {user.country || "Ülke yok"}
              </ThemedText>
            </View>
          </View>
          <View style={styles.accountMetrics}>
            <View style={[styles.accountMetricCard, { backgroundColor: "#f7faf7" }]}>
              <ThemedText type="small">Toplam sipariş</ThemedText>
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
                {reviewOverview.pending.length ? `${reviewOverview.pending.length} yorum bekliyor` : "Yorum bekleyen yok"}
              </ThemedText>
            </View>
            <View style={[styles.assurancePill, { backgroundColor: "#f5efe7" }]}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.accent }}>
                {returnRequests.length ? `${returnRequests.length} açık iade kaydı` : "Açık iade yok"}
              </ThemedText>
            </View>
          </View>
          <PrimaryButton
            label={isSubmitting ? "Çıkış yapılıyor..." : "Çıkış Yap"}
            onPress={() => {
              void signOut();
            }}
            disabled={isSubmitting}
            testID="account-sign-out"
            variant="outline"
          />
          <View style={styles.shortcutGrid}>
            {shortcutActions.map((action) => renderShortcutRow(action))}
          </View>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">Giriş yap</ThemedText>
          <TextField
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@serravit.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextField
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            placeholder="Şifreniz"
            secureTextEntry
            autoCapitalize="none"
          />
          {loginError || error ? (
            <ThemedText type="small" style={{ color: "#b42318" }}>
              {loginError || error}
            </ThemedText>
          ) : null}
          <PrimaryButton
            label={isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
            onPress={() => {
              void handleLogin();
            }}
            disabled={isSubmitting}
            testID="account-sign-in"
          />
          <View style={styles.shortcutGrid}>
            {shortcutActions.map((action) => renderShortcutRow(action))}
          </View>
        </View>
      )}

      {isAuthenticated ? (
        <>
          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.opsHeader}>
              <View style={[styles.opsIcon, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <Feather name="activity" size={16} color={activeTenant.palette.primary} />
              </View>
              <View style={styles.opsCopy}>
                <ThemedText type="smallBold">Hızlı durum</ThemedText>
              </View>
            </View>
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
                <ThemedText type="small">Açık bildirim</ThemedText>
                <ThemedText type="subtitle" style={styles.utilityMetricValue}>
                  {Object.values(preferences.notifications).filter(Boolean).length}
                </ThemedText>
              </View>
            </View>
            <View style={styles.inlineSummaryRow}>
              <View style={[styles.utilityMetricCard, styles.compactMetricCard, { backgroundColor: "#f8faf8" }]}>
                <ThemedText type="small">Son sipariş</ThemedText>
                <ThemedText type="smallBold" numberOfLines={1}>{latestOrder ? latestOrder.invoice : "Henüz yok"}</ThemedText>
              </View>
              <View style={[styles.utilityMetricCard, styles.compactMetricCard, { backgroundColor: "#fff8f1" }]}>
                <ThemedText type="small">Son arama</ThemedText>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {preferences.recentSearches[0] || "Kayıt yok"}
                </ThemedText>
              </View>
            </View>
            <View style={styles.shortcutGrid}>
              {latestOrder ? (
                renderShortcutRow({ label: "Son siparişi aç", icon: "package", route: `/orders/${latestOrder.id}` })
              ) : null}
              {renderShortcutRow({ label: "Siparişleri aç", icon: "archive", route: "/orders" })}
              {renderShortcutRow(
                { label: "Kataloğa dön", icon: "shopping-bag", route: "../catalog" },
                { iconTone: "accent", backgroundColor: "#fffaf4" }
              )}
              {renderShortcutRow({ label: "Tercihler", icon: "sliders", route: "../preferences" })}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <View style={styles.notificationHeader}>
              <View style={[styles.notificationIcon, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <Feather name="compass" size={16} color={activeTenant.palette.primary} />
              </View>
              <View style={styles.notificationCopy}>
                <ThemedText type="smallBold">İçerik ve yardım</ThemedText>
              </View>
            </View>
            <View style={styles.signalList}>
              {preferences.recentSearches[0]
                ? renderSupportRow({
                    key: "recent-search",
                    label: preferences.recentSearches[0],
                    subtitle: "Son arama",
                    icon: "search",
                    route: `/catalog?query=${encodeURIComponent(preferences.recentSearches[0])}`,
                  })
                : null}
              {preferences.recentlyViewed[0]
                ? renderSupportRow({
                    key: `recent-viewed-${preferences.recentlyViewed[0].id}`,
                    label: preferences.recentlyViewed[0].title,
                    subtitle: "Son baktığın ürün",
                    icon: "clock",
                    route: `/product/${preferences.recentlyViewed[0].id}`,
                    accent: true,
                  })
                : null}
              {contentHubActions.map((action) =>
                renderSupportRow({
                  key: action.label,
                  label: action.label,
                  subtitle: action.label === "Kampanyalar" ? "Kupon ve avantajlar" : "İçerik ve bilgi",
                  icon: action.icon as keyof typeof Feather.glyphMap,
                  route: action.route,
                  accent: action.label === "Kampanyalar",
                })
              )}
            </View>
            <View style={styles.shortcutGrid}>
              {renderShortcutRow({ label: "Bildirimler", icon: "bell", route: "../notifications", testID: "account-open-notification-center" })}
            </View>
          </View>
        </>
      ) : null}
    </View>
  );

  if (isBootstrapping) {
    return (
      <ScreenShell>
        <ThemedText type="small">Oturum kontrol ediliyor...</ThemedText>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      {header}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  serviceCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trustStrip: {
    flexDirection: "row",
    gap: 10,
  },
  trustMiniCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  servicePill: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
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
    flexDirection: "column",
    gap: 10,
  },
  shortcutCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  shortcutCardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  shortcutIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  utilityMetricGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  inlineSummaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  utilityMetricCard: {
    flex: 1,
    minWidth: 102,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  compactMetricCard: {
    minWidth: 0,
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
  signalList: {
    flexDirection: "column",
    gap: 10,
  },
  signalRow: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  signalRowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  signalIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  signalCopy: {
    flex: 1,
    gap: 2,
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
    borderRadius: 22,
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

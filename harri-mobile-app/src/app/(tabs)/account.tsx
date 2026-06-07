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
        { label: "Değerlendirmelerim", icon: "message-square", route: "../reviews", testID: "account-open-reviews" },
        { label: "İadeler", icon: "rotate-ccw", route: "../returns", testID: "account-open-returns" },
        { label: "Şifre", icon: "lock", route: "../change-password", testID: "account-open-change-password" },
        { label: "Destek", icon: "life-buoy", route: "../support", testID: "account-open-support" },
        { label: "Tercihler", icon: "sliders", route: "../preferences", testID: "account-open-preferences" },
      ]
    : [
        { label: "Siparişler", icon: "package", route: "/orders", testID: "account-open-orders" },
        { label: "Bildirimler", icon: "bell", route: "../notifications", testID: "account-open-notifications" },
        { label: "Destek", icon: "life-buoy", route: "../support", testID: "account-open-support" },
      ];
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

  const header = (
    <View style={styles.headerStack}>
      <CommercePageHeader
        title="Hesabım"
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
                {reviewOverview.pending.length
                  ? `${reviewOverview.pending.length} ürün henüz değerlendirilmedi`
                  : "Değerlendirme bekleyen ürün yok"}
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
          <View style={styles.authSwitchRow}>
            <View style={[styles.authSwitchPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                Giriş Yap
              </ThemedText>
            </View>
            <Pressable
              onPress={() => router.push("/register")}
              testID="account-primary-register"
              style={({ pressed }) => [
                styles.authSwitchGhost,
                { borderColor: activeTenant.palette.border, opacity: pressed ? 0.92 : 1 },
              ]}
            >
              <Feather name="user-plus" size={15} color={activeTenant.palette.primary} />
              <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                Hesap Oluştur
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.authIntroBlock}>
            <ThemedText type="smallBold">Serravit hesabınla devam et</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Siparişlerini takip et, favorilerini kaydet ve değerlendirmelerini tek bir yerden yönet.
            </ThemedText>
            <View style={styles.authBenefitRow}>
              <View style={[styles.authBenefitPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  Sipariş takibi
                </ThemedText>
              </View>
              <View style={[styles.authBenefitPill, { backgroundColor: "#fff6ed" }]}>
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.accent }}>
                  Favoriler
                </ThemedText>
              </View>
              <View style={[styles.authBenefitPill, { backgroundColor: "#f7faf7" }]}>
                <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                  Değerlendirmeler
                </ThemedText>
              </View>
            </View>
          </View>

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
          <View style={styles.authFooterRow}>
            <Pressable onPress={() => router.push("/forgot-password")} testID="account-guest-forgot-password" style={styles.inlineAuthLink}>
              <ThemedText type="linkPrimary">Şifremi Unuttum</ThemedText>
            </Pressable>
            <Pressable onPress={() => router.push("/register")} testID="account-inline-register" style={styles.inlineAuthLink}>
              <ThemedText type="linkPrimary">Yeni hesap oluştur</ThemedText>
            </Pressable>
          </View>
          <View style={styles.shortcutGrid}>
            {shortcutActions.map((action) => renderShortcutRow(action))}
          </View>
        </View>
      )}

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
  authSwitchRow: {
    flexDirection: "row",
    gap: 10,
  },
  authSwitchPill: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  authSwitchGhost: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
  },
  authIntroBlock: {
    gap: 10,
  },
  authBenefitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  authBenefitPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  authFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
  inlineAuthLink: {
    alignSelf: "flex-start",
  },
});

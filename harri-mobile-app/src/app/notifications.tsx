import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { CommercePageHeader } from "@/components/commerce-page-header";
import { NotificationCountBadge } from "@/components/notification-count-badge";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";
import { useNotificationCenter } from "@/modules/notifications/use-notification-center";

const toneMap = {
  primary: {
    backgroundColor: "#eef7f0",
    borderColor: "#cde8d4",
    textColor: activeTenant.palette.primary,
  },
  accent: {
    backgroundColor: "#fff5ea",
    borderColor: "#f3dcc3",
    textColor: activeTenant.palette.accent,
  },
  info: {
    backgroundColor: "#eef4fb",
    borderColor: "#c7dbf6",
    textColor: "#265ea8",
  },
  neutral: {
    backgroundColor: "#f6f7f8",
    borderColor: "#dde2e7",
    textColor: "#445164",
  },
} as const;

export default function NotificationsScreen() {
  const router = useRouter();
  const { feed, inTransitCount, isAuthenticated, pendingActionCount, unreadCount } = useNotificationCenter();

  return (
    <ScreenShell>
      <CommercePageHeader
        title="Bildirimler"
        meta={unreadCount > 0 ? `${unreadCount} yeni bildirim` : `${feed.length} kart hazır`}
        description="Sipariş, kampanya ve bekleyen aksiyonlarını tek ekranda takip et."
        backLabel="Hesaba dön"
        onPressBack={() => router.push("/account")}
      >
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <ThemedText type="smallBold" style={styles.metricValue}>
              {unreadCount}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              yeni bildirim
            </ThemedText>
          </View>
          <View style={styles.metricCard}>
            <ThemedText type="smallBold" style={styles.metricValue}>
              {inTransitCount}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              takipte sipariş
            </ThemedText>
          </View>
          <View style={styles.metricCard}>
            <ThemedText type="smallBold" style={styles.metricValue}>
              {pendingActionCount}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              aksiyon bekliyor
            </ThemedText>
          </View>
        </View>
      </CommercePageHeader>

      {feed.length ? (
        feed.map((item) => {
          const tone = toneMap[item.tone];
          return (
            <Pressable
              key={item.id}
              onPress={() => router.push(item.route as never)}
              style={({ pressed }) => [
                styles.feedCard,
                {
                  backgroundColor: activeTenant.palette.surface,
                  borderColor: activeTenant.palette.border,
                  opacity: pressed ? 0.94 : 1,
                },
              ]}
              testID={`notification-card-${item.id}`}
            >
              <View style={styles.feedTopRow}>
                <View style={[styles.feedIconWrap, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }]}>
                  <Feather name={item.icon as never} size={16} color={tone.textColor} />
                </View>
                <View style={styles.feedCopy}>
                  <View style={styles.feedTitleRow}>
                    <ThemedText type="smallBold" style={styles.feedTitle}>
                      {item.title}
                    </ThemedText>
                    <NotificationCountBadge count={item.unreadCount || 0} compact />
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.description}
                  </ThemedText>
                  {item.badge ? (
                    <View style={[styles.badgePill, { backgroundColor: tone.backgroundColor }]}>
                      <ThemedText type="smallBold" style={{ color: tone.textColor }}>
                        {item.badge}
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
              </View>
              <PrimaryButton label={item.ctaLabel} onPress={() => router.push(item.route as never)} variant="outline" />
            </Pressable>
          );
        })
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: "#f6f7f8" }]}>
            <Feather name="bell-off" size={18} color={activeTenant.palette.primary} />
          </View>
          <ThemedText type="smallBold">Şimdilik yeni bildirim yok</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isAuthenticated
              ? "Yeni sipariş veya kampanya olduğunda burada görünür."
              : "Giriş yaptığında bildirimlerin burada görünür."}
          </ThemedText>
          <View style={styles.utilityActions}>
            {!isAuthenticated ? <PrimaryButton label="Hesaba git" onPress={() => router.push("/account")} /> : null}
            <PrimaryButton label="Ayarları aç" onPress={() => router.push("/preferences")} variant="outline" />
          </View>
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  metricCard: {
    flex: 1,
    minWidth: 96,
    borderRadius: 20,
    padding: 14,
    backgroundColor: activeTenant.palette.primarySoft,
    gap: 4,
  },
  metricValue: {
    color: activeTenant.palette.primary,
  },
  utilityCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
    ...commerceShadow("#102117", 8, 20, 0.05, 2),
  },
  utilityHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  utilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  utilityCopy: {
    flex: 1,
    gap: 4,
  },
  utilityActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  feedCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
    ...commerceShadow("#102117", 8, 20, 0.04, 2),
  },
  feedTopRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  feedIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  feedCopy: {
    flex: 1,
    gap: 4,
  },
  feedTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  feedTitle: {
    flex: 1,
  },
  badgePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});

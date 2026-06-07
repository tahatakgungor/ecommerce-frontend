import { Pressable, StyleSheet, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { usePreferences } from "@/modules/preferences/preferences-provider";
import type { NotificationPreferenceKey, PersonalizationPreferenceKey } from "@/modules/preferences/types";

const notificationItems: Array<{ key: NotificationPreferenceKey; title: string; description: string }> = [
  { key: "orderUpdates", title: "Sipariş güncellemeleri", description: "Hazırlanıyor, kargoda ve teslim durumları." },
  { key: "campaignAlerts", title: "Kampanya bildirimleri", description: "İndirim ve kupon duyuruları." },
  { key: "priceDropAlerts", title: "Fiyat düşüşü", description: "Baktığın ürünlerde fiyat değişirse haber ver." },
  { key: "backInStockAlerts", title: "Stok geri geldi", description: "Tükenen ürünler geri geldiğinde uyarı al." },
  { key: "emailDigest", title: "E-posta özeti", description: "Haftalık kampanya ve sipariş özeti." },
  { key: "smsUpdates", title: "SMS teslimat", description: "Kritik teslimat adımlarını SMS ile al." },
];

const personalizationItems: Array<{ key: PersonalizationPreferenceKey; title: string; description: string }> = [
  { key: "personalizedHome", title: "Ana sayfayı kişiselleştir", description: "Son baktıklarına göre ürün rail'lerini sırala." },
  { key: "recentSearches", title: "Son aramaları sakla", description: "Katalog ve ana sayfada hızlı tekrar arama sun." },
  { key: "recentlyViewed", title: "Baktığım ürünler", description: "Detayını açtığın ürünleri cihazda tut." },
  { key: "categoryRecommendations", title: "Kategori önerileri", description: "İlgili kategori ve marka önerilerini öne çıkar." },
];

export default function PreferencesScreen() {
  const { preferences, setNotificationPreference, setPersonalizationPreference, clearRecentSearches, clearRecentlyViewed } =
    usePreferences();

  const enabledNotificationCount = Object.values(preferences.notifications).filter(Boolean).length;

  return (
    <ScreenShell>
      <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="subtitle" style={styles.title}>
          Ayarlar
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Bildirim, arama ve kişiselleştirme tercihlerini buradan yönetebilirsin.
        </ThemedText>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold">{enabledNotificationCount}/6</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              açık bildirim kanalı
            </ThemedText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold">{preferences.recentSearches.length}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              kayıtlı arama
            </ThemedText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold">{preferences.recentlyViewed.length}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              son bakılan ürün
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">Bildirimler</ThemedText>
        {notificationItems.map((item) => (
          <PreferenceRow
            key={item.key}
            title={item.title}
            description={item.description}
            enabled={preferences.notifications[item.key]}
            onPress={() => setNotificationPreference(item.key, !preferences.notifications[item.key])}
            testID={`preferences-toggle-${item.key}`}
          />
        ))}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">Kişiselleştirme</ThemedText>
        {personalizationItems.map((item) => (
          <PreferenceRow
            key={item.key}
            title={item.title}
            description={item.description}
            enabled={preferences.personalization[item.key]}
            onPress={() => setPersonalizationPreference(item.key, !preferences.personalization[item.key])}
            testID={`preferences-toggle-${item.key}`}
          />
        ))}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">Cihaz verileri</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Son aramalar ve baktığın ürünler bu cihazda saklanır.
        </ThemedText>
        <View style={styles.buttonStack}>
          <PrimaryButton label="Son Aramaları Temizle" onPress={clearRecentSearches} variant="outline" testID="preferences-clear-searches" />
          <PrimaryButton label="Baktığım Ürünleri Temizle" onPress={clearRecentlyViewed} variant="outline" testID="preferences-clear-viewed" />
        </View>
      </View>
    </ScreenShell>
  );
}

type PreferenceRowProps = {
  title: string;
  description: string;
  enabled: boolean;
  onPress: () => void;
  testID: string;
};

function PreferenceRow({ title, description, enabled, onPress, testID }: PreferenceRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.preferenceRow} testID={testID}>
      <View style={styles.preferenceCopy}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {description}
        </ThemedText>
      </View>
      <View
        style={[
          styles.switchTrack,
          {
            backgroundColor: enabled ? activeTenant.palette.primary : "#d4dbd5",
            alignItems: enabled ? "flex-end" : "flex-start",
          },
        ]}
      >
        <View style={styles.switchThumb} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 20,
    gap: 14,
  },
  title: {
    lineHeight: 38,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  summaryCard: {
    minWidth: 96,
    flex: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    justifyContent: "space-between",
  },
  preferenceCopy: {
    flex: 1,
    gap: 4,
  },
  switchTrack: {
    width: 54,
    borderRadius: 999,
    padding: 4,
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  buttonStack: {
    gap: 10,
  },
});

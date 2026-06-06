import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { contactChannels, supportHubCards } from "@/modules/content/data";

export default function SupportHubScreen() {
  const router = useRouter();

  return (
    <ScreenShell>
      <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.primary, borderColor: activeTenant.palette.primary }]}>
        <ThemedText type="smallBold" style={styles.heroEyebrow}>
          DESTEK MERKEZI
        </ThemedText>
        <ThemedText type="subtitle" style={styles.heroTitle}>
          SSS, iletisim ve yasal icerikler tek noktada
        </ThemedText>
        <ThemedText type="small" style={styles.heroBody}>
          Kullanicinin web’e donmeden soru sorabildigi, kurallari okuyabildigi ve destek talebi birakabildigi mobil katman.
        </ThemedText>
      </View>

      <View style={styles.cardGrid}>
        {supportHubCards.map((card) => (
          <Pressable
            key={card.id}
            onPress={() => router.push(card.route as never)}
            style={({ pressed }) => [
              styles.infoCard,
              {
                backgroundColor: activeTenant.palette.surface,
                borderColor: activeTenant.palette.border,
                opacity: pressed ? 0.94 : 1,
              },
            ]}
            testID={`support-card-${card.id}`}
          >
            <ThemedText type="smallBold">{card.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {card.description}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={[styles.contactSummary, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">Hizli Iletisim</ThemedText>
        {contactChannels.map((channel) => (
          <View key={channel.title} style={styles.channelRow}>
            <View style={styles.channelTitleWrap}>
              <ThemedText type="smallBold">{channel.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {channel.hint}
              </ThemedText>
            </View>
            <ThemedText type="smallBold" style={styles.channelValue}>
              {channel.value}
            </ThemedText>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 24,
    gap: 12,
  },
  heroEyebrow: {
    color: "#d5f2df",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#ffffff",
    lineHeight: 40,
  },
  heroBody: {
    color: "#e8f7ee",
    lineHeight: 22,
  },
  cardGrid: {
    gap: 12,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 8,
  },
  contactSummary: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  channelRow: {
    gap: 6,
  },
  channelTitleWrap: {
    gap: 2,
  },
  channelValue: {
    color: activeTenant.palette.primary,
  },
});

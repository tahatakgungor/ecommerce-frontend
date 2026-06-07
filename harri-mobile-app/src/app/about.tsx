import { StyleSheet, View } from "react-native";

import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { aboutContent } from "@/modules/content/data";

export default function AboutScreen() {
  return (
    <ScreenShell>
      <View style={[styles.heroCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold" style={styles.eyebrow}>
          {aboutContent.eyebrow}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.title}>
          {aboutContent.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {aboutContent.intro}
        </ThemedText>
      </View>

      <View style={styles.grid}>
        {aboutContent.pillars.map((pillar) => (
          <View key={pillar.title} style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">{pillar.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {pillar.body}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">Kısa Sorular</ThemedText>
        {aboutContent.faqs.map((item) => (
          <View key={item.title} style={styles.faqBlock}>
            <ThemedText type="smallBold">{item.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {item.body}
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
    borderRadius: 26,
    padding: 22,
    gap: 10,
  },
  eyebrow: {
    color: activeTenant.palette.primary,
    letterSpacing: 1,
  },
  title: {
    lineHeight: 40,
  },
  grid: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 10,
  },
  faqBlock: {
    gap: 4,
  },
});

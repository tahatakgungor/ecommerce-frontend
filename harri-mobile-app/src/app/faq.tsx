import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { faqSections } from "@/modules/content/data";

export default function FaqScreen() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    "Sipariş ve Teslimat-0": true,
  });

  return (
    <ScreenShell>
      <View style={styles.headerStack}>
        <ThemedText type="subtitle" style={styles.title}>
          Sıkça Sorulan Sorular
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Sipariş, ödeme, kupon ve iade süreçleriyle ilgili en sık sorulan konuları burada bulabilirsin.
        </ThemedText>
      </View>

      {faqSections.map((section) => (
        <View key={section.title} style={[styles.sectionCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">{section.title}</ThemedText>
          {section.items.map((item, index) => {
            const key = `${section.title}-${index}`;
            const isOpen = Boolean(openIds[key]);
            return (
              <Pressable
                key={key}
                onPress={() => setOpenIds((current) => ({ ...current, [key]: !current[key] }))}
                style={[styles.accordionCard, { borderColor: activeTenant.palette.border, backgroundColor: activeTenant.palette.background }]}
                testID={`faq-item-${index}`}
              >
                <View style={styles.accordionHeader}>
                  <ThemedText type="smallBold" style={styles.accordionTitle}>
                    {item.title}
                  </ThemedText>
                  <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
                    {isOpen ? "Kapat" : "Aç"}
                  </ThemedText>
                </View>
                {isOpen ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.body}
                  </ThemedText>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerStack: {
    gap: 8,
  },
  title: {
    lineHeight: 40,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  accordionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  accordionTitle: {
    flex: 1,
  },
});

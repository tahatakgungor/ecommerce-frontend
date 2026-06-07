import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { CommercePageHeader } from "@/components/commerce-page-header";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { termsContent } from "@/modules/content/data";

export default function TermsScreen() {
  const router = useRouter();
  return (
    <ScreenShell>
      <CommercePageHeader
        title={termsContent.title}
        meta={termsContent.effectiveDate}
        description={termsContent.subtitle}
        backLabel="Desteğe dön"
        onPressBack={() => router.push("/support")}
      />

      {termsContent.sections.map((section) => (
        <View key={section.title} style={[styles.sectionCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
          <ThemedText type="smallBold">{section.title}</ThemedText>
          {section.paragraphs?.map((paragraph) => (
            <ThemedText key={paragraph} type="small" themeColor="textSecondary">
              {paragraph}
            </ThemedText>
          ))}
          {section.bullets?.map((bullet) => (
            <ThemedText key={bullet} type="small" themeColor="textSecondary">
              • {bullet}
            </ThemedText>
          ))}
        </View>
      ))}

      <View style={[styles.footerCard, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.border }]}>
        <ThemedText type="smallBold">Koşullar hakkında sorular</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {termsContent.contactEmail}
        </ThemedText>
      </View>
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
    borderRadius: 22,
    padding: 18,
    gap: 8,
  },
  footerCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
});

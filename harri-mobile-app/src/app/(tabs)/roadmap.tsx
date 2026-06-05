import { View, StyleSheet } from "react-native";
import * as ExpoLinking from "expo-linking";

import { PrimaryButton } from "@/components/primary-button";
import { RoadmapCard } from "@/components/roadmap-card";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";
import { isPreviewLikeVariant } from "@/config/app-variant";

const roadmap = [
  {
    phase: "Phase 1",
    title: "Shared commerce contracts",
    description:
      "Web ve mobil ayni katalog, auth ve siparis sozlesmelerini tuksin. Tenant ayarlari config tabanli ayristirilsin.",
  },
  {
    phase: "Phase 2",
    title: "Mobile BFF and cache",
    description:
      "Mobil istemci icin optimize edilmis BFF/read model katmani, facet cache ve image delivery duzene sokulsun.",
  },
  {
    phase: "Phase 3",
    title: "Checkout and identity hardening",
    description:
      "Iyzico, Stripe, cookie, CSRF, callback ve deep link davranislari native ortam icin sertlestirilsin.",
  },
  {
    phase: "Phase 4",
    title: "Scale and observability",
    description:
      "Queue, metrics, tracing, rate limit ve canli performans dashboard'lari ile buyuk trafik hazirligi tamamlanir.",
  },
];

export default function RoadmapScreen() {
  const canShowQaActions = isPreviewLikeVariant();

  return (
    <ScreenShell>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Yol haritasi
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Bu mobil uygulama bugunku tasarimi klonlamak icin degil; commerce cekirdegini sektor degisimine dayanacak sekilde ayirmak icin baslatildi.
        </ThemedText>
      </View>

      {roadmap.map((item) => (
        <RoadmapCard
          key={item.phase}
          phase={item.phase}
          title={item.title}
          description={item.description}
        />
      ))}

      {canShowQaActions ? (
        <View style={styles.qaCard}>
          <ThemedText type="smallBold">Preview QA</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Deep link callback smoke ve pending session senaryolari icin gizli QA ekranini acar.
          </ThemedText>
          <PrimaryButton
            label="QA Checkout Smoke"
            onPress={() => {
              void ExpoLinking.openURL(ExpoLinking.createURL("/qa/checkout-smoke"));
            }}
            variant="outline"
          />
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  title: {
    lineHeight: 38,
  },
  qaCard: {
    gap: 12,
  },
});

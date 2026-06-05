import { View, StyleSheet } from "react-native";

import { RoadmapCard } from "@/components/roadmap-card";
import { ScreenShell } from "@/components/screen-shell";
import { ThemedText } from "@/components/themed-text";

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
});

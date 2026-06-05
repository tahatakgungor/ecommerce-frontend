import { StyleSheet, View } from "react-native";

import { activeTenant } from "@/domain/active-tenant";
import { ThemedText } from "@/components/themed-text";

type RoadmapCardProps = {
  phase: string;
  title: string;
  description: string;
};

export function RoadmapCard({ phase, title, description }: RoadmapCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
      <ThemedText type="smallBold" style={[styles.phase, { color: activeTenant.palette.accent }]}>
        {phase}
      </ThemedText>
      <ThemedText type="default" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {description}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 10,
  },
  phase: {
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    lineHeight: 24,
  },
});

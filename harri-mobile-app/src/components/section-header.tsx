import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { activeTenant } from "@/domain/active-tenant";
import { ThemedText } from "@/components/themed-text";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onPressAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titleWrap}>
        <View style={[styles.accentPlate, { backgroundColor: activeTenant.palette.accent }]} />
        <View style={styles.titleCopy}>
          <ThemedText type="smallBold" style={[styles.kicker, { color: activeTenant.palette.accent }]}>
            MOBIL VITRIN
          </ThemedText>
          <ThemedText type="default" style={styles.title}>
            {title}
          </ThemedText>
        </View>
      </View>
      {actionLabel && onPressAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPressAction}
          style={[styles.actionPill, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}
        >
          <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
            {actionLabel}
          </ThemedText>
          <Feather name="arrow-right" size={14} color={activeTenant.palette.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  accentPlate: {
    width: 8,
    height: 44,
    borderRadius: 999,
  },
  titleCopy: {
    flex: 1,
    gap: 1,
  },
  kicker: {
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 23,
    lineHeight: 28,
    fontWeight: 800,
  },
  actionPill: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexDirection: "row",
  },
});

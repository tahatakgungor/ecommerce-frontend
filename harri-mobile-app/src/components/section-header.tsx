import { Pressable, StyleSheet, View } from "react-native";

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
      <ThemedText type="default" style={styles.title}>
        {title}
      </ThemedText>
      {actionLabel && onPressAction ? (
        <Pressable accessibilityRole="button" onPress={onPressAction}>
          <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
            {actionLabel}
          </ThemedText>
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
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 800,
  },
});

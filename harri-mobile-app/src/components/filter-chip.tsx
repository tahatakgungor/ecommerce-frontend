import { Pressable, StyleSheet } from "react-native";

import { activeTenant } from "@/domain/active-tenant";
import { ThemedText } from "@/components/themed-text";

type FilterChipProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
  compact?: boolean;
};

export function FilterChip({ label, active = false, onPress, compact = false }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        compact ? styles.compact : null,
        {
          backgroundColor: active ? activeTenant.palette.primary : activeTenant.palette.surface,
          borderColor: active ? activeTenant.palette.primary : activeTenant.palette.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <ThemedText
        type="smallBold"
        style={{ color: active ? "#ffffff" : activeTenant.palette.text }}
        numberOfLines={1}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  compact: {
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
});

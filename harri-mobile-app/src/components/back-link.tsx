import { Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";

type BackLinkProps = {
  label?: string;
  onPress: () => void;
};

export function BackLink({ label = "Geri", onPress }: BackLinkProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.82 : 1 }]}
    >
      <Feather name="arrow-left" size={16} color={activeTenant.palette.primary} />
      <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignSelf: "flex-start",
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 2,
  },
});

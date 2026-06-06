import { Pressable, StyleSheet, View } from "react-native";
import type { ComponentProps } from "react";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";

type FeatherName = ComponentProps<typeof Feather>["name"];

type CompactActionProps = {
  label: string;
  icon: FeatherName;
  onPress: () => void;
  destructive?: boolean;
};

export function CompactAction({ label, icon, onPress, destructive = false }: CompactActionProps) {
  const iconColor = destructive ? "#b42318" : activeTenant.palette.primary;
  const iconBackground = destructive ? "#fff2f0" : activeTenant.palette.primarySoft;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: activeTenant.palette.surface,
          borderColor: destructive ? "#f5c2b8" : activeTenant.palette.border,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
        <Feather name={icon} size={15} color={iconColor} />
      </View>
      <ThemedText type="smallBold" numberOfLines={1} style={destructive ? { color: "#b42318" } : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    minWidth: 80,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

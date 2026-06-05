import { Pressable, StyleSheet, ViewStyle } from "react-native";

import { activeTenant } from "@/domain/active-tenant";
import { ThemedText } from "@/components/themed-text";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "solid" | "outline";
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = "solid",
  style,
}: PrimaryButtonProps) {
  const isOutline = variant === "outline";

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isOutline ? "transparent" : activeTenant.palette.primary,
          borderColor: activeTenant.palette.primary,
          opacity: disabled ? 0.45 : pressed ? 0.92 : 1,
        },
        style,
      ]}
    >
      <ThemedText
        type="smallBold"
        style={{
          color: isOutline ? activeTenant.palette.primary : "#ffffff",
        }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
});

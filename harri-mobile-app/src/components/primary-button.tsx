import { Pressable, StyleSheet, ViewStyle } from "react-native";

import { activeTenant } from "@/domain/active-tenant";
import { ThemedText } from "@/components/themed-text";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "solid" | "outline";
  style?: ViewStyle;
  testID?: string;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = "solid",
  style,
  testID,
}: PrimaryButtonProps) {
  const isOutline = variant === "outline";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isOutline ? activeTenant.palette.surface : activeTenant.palette.primary,
          borderColor: activeTenant.palette.primary,
          borderWidth: isOutline ? 1.4 : 1.2,
          opacity: disabled ? 0.45 : pressed ? 0.92 : 1,
          shadowOpacity: isOutline ? 0 : 0.16,
          elevation: isOutline ? 0 : 3,
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
    minHeight: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    shadowColor: "#0f2f18",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
  },
});

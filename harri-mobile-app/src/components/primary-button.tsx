import { GestureResponderEvent, Pressable, StyleSheet, ViewStyle } from "react-native";

import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";
import { ThemedText } from "@/components/themed-text";

type PrimaryButtonProps = {
  label: string;
  onPress: (event?: GestureResponderEvent) => void;
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
          ...(isOutline ? null : commerceShadow("#0f2f18", 10, 20, 0.16, 3)),
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
  },
});

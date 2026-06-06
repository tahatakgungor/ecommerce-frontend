import { StyleSheet, TextInput, View } from "react-native";

import { activeTenant } from "@/domain/active-tenant";
import { Fonts } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  testID?: string;
  multiline?: boolean;
  numberOfLines?: number;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = "sentences",
  keyboardType = "default",
  testID,
  multiline = false,
  numberOfLines = 4,
}: TextFieldProps) {
  return (
    <View style={styles.wrap}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={activeTenant.palette.mutedText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        testID={testID}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        style={[
          styles.input,
          multiline ? styles.multilineInput : null,
          {
            backgroundColor: activeTenant.palette.surface,
            borderColor: activeTenant.palette.border,
            color: activeTenant.palette.text,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  input: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Fonts.sans,
  },
  multilineInput: {
    minHeight: 136,
    paddingVertical: 16,
    textAlignVertical: "top",
  },
});

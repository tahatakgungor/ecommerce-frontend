import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { activeTenant } from "@/domain/active-tenant";
import { ThemedText } from "@/components/themed-text";

type CommerceSearchBarProps = {
  value: string;
  placeholder?: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  testID?: string;
};

export function CommerceSearchBar({
  value,
  placeholder = "Urun, kategori veya marka ara",
  onChangeText,
  onSubmit,
  testID,
}: CommerceSearchBarProps) {
  return (
    <View style={[styles.wrap, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
      <View style={styles.inputWrap}>
        <ThemedText type="smallBold" style={styles.searchGlyph}>
          Ara
        </ThemedText>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={"#7a857d"}
          returnKeyType="search"
          style={[styles.input, { color: activeTenant.palette.text }]}
          testID={testID}
          value={value}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.action,
          {
            backgroundColor: activeTenant.palette.primary,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <ThemedText type="smallBold" style={{ color: "#ffffff" }}>
          Git
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 60,
    borderWidth: 1,
    borderRadius: 20,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
  },
  searchGlyph: {
    letterSpacing: 0.2,
  },
  input: {
    flex: 1,
    minHeight: 42,
    fontSize: 15,
    fontWeight: "500",
  },
  action: {
    borderRadius: 16,
    minHeight: 44,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});

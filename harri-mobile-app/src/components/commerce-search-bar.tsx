import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

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
        <View style={[styles.searchIconWrap, { backgroundColor: activeTenant.palette.primarySoft }]}>
          <Feather name="search" size={16} color={activeTenant.palette.primary} />
        </View>
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
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Feather name="arrow-right" size={18} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 24,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#1a2a1e",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    shadowOpacity: 0.06,
    elevation: 2,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
  },
  searchIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 42,
    fontSize: 15,
    fontWeight: "500",
  },
  action: {
    width: 48,
    minHeight: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});

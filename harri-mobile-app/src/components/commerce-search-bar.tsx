import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";

type CommerceSearchBarProps = {
  value: string;
  placeholder?: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  testID?: string;
};

export function CommerceSearchBar({
  value,
  placeholder = "Ürün, kategori veya marka ara",
  onChangeText,
  onSubmit,
  testID,
}: CommerceSearchBarProps) {
  return (
    <View style={[styles.wrap, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
      <View style={styles.inputWrap}>
        <View style={[styles.searchIconWrap, { backgroundColor: "#fff4e8" }]}>
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
            backgroundColor: activeTenant.palette.accent,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Feather name="arrow-up-right" size={18} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 24,
    padding: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...commerceShadow("#17324a", 14, 30, 0.07, 3),
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
  },
  searchIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(240, 123, 36, 0.10)",
  },
  input: {
    flex: 1,
    minHeight: 42,
    fontSize: 15,
    fontWeight: "500",
  },
  action: {
    width: 50,
    minHeight: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});

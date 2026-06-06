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
  placeholder = "Urun, kategori veya marka ara",
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
        <Feather name="arrow-right" size={18} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 66,
    borderWidth: 1,
    borderRadius: 26,
    padding: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...commerceShadow("#2c1c10", 12, 26, 0.08, 3),
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
  },
  searchIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 42,
    fontSize: 15,
    fontWeight: "600",
  },
  action: {
    width: 52,
    minHeight: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

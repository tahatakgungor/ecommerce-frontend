import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { BrandLockup } from "@/components/brand-lockup";
import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";

type CommerceSearchBarProps = {
  value: string;
  placeholder?: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  testID?: string;
  clearTestID?: string;
  leading?: "search" | "brand";
};

export function CommerceSearchBar({
  value,
  placeholder = "Ürün, kategori veya marka ara",
  onChangeText,
  onSubmit,
  testID,
  clearTestID,
  leading = "search",
}: CommerceSearchBarProps) {
  return (
    <View style={[styles.wrap, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
      <View style={styles.inputWrap}>
        {leading === "brand" ? (
          <View style={styles.brandMarkWrap}>
            <BrandLockup markOnly />
          </View>
        ) : (
          <View style={[styles.searchIconWrap, { backgroundColor: "#fff4e8" }]}>
            <Feather name="search" size={16} color={activeTenant.palette.primary} />
          </View>
        )}
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
        {value.trim().length ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => onChangeText("")}
            style={({ pressed }) => [
              styles.clearButton,
              {
                backgroundColor: "#f2f6f3",
                opacity: pressed ? 0.86 : 1,
              },
            ]}
            testID={clearTestID}
          >
            <Feather name="x" size={14} color={activeTenant.palette.mutedText} />
          </Pressable>
        ) : null}
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
    minHeight: 60,
    borderWidth: 1,
    borderRadius: 22,
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    ...commerceShadow("#17324a", 14, 30, 0.07, 3),
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 7,
  },
  searchIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(240, 123, 36, 0.10)",
  },
  brandMarkWrap: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  input: {
    flex: 1,
    minHeight: 40,
    fontSize: 14,
    fontWeight: "500",
  },
  action: {
    width: 46,
    minHeight: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});

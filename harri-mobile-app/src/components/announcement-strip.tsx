import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";

type AnnouncementStripProps = {
  text: string;
  href?: string;
};

export function AnnouncementStrip({ text, href }: AnnouncementStripProps) {
  const trimmedText = String(text || "").trim();
  if (!trimmedText) {
    return null;
  }

  const handlePress = async () => {
    if (!href) return;
    await Linking.openURL(href);
  };

  return (
    <Pressable
      accessibilityRole={href ? "button" : undefined}
      disabled={!href}
      onPress={handlePress}
      style={[styles.wrap, { backgroundColor: activeTenant.palette.primary, borderColor: activeTenant.palette.primary }]}
    >
      <Feather name="bell" size={14} color="#ffffff" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.track}>
        <ThemedText type="smallBold" style={styles.text}>
          {trimmedText}
        </ThemedText>
      </ScrollView>
      {href ? <Feather name="arrow-up-right" size={14} color="#ffffff" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  track: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  text: {
    color: "#ffffff",
  },
});

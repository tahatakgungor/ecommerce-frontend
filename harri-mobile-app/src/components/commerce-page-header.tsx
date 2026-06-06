import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { BrandLockup } from "@/components/brand-lockup";
import { ThemedText } from "@/components/themed-text";
import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";

type CommercePageHeaderProps = {
  title: string;
  meta?: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export function CommercePageHeader({ title, meta, actionLabel, onPressAction }: CommercePageHeaderProps) {
  return (
    <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
      <View style={styles.topRow}>
        <BrandLockup compact />
      </View>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {actionLabel && onPressAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPressAction}
          style={[styles.actionPill, { borderColor: activeTenant.palette.border }]}
        >
          <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
            {actionLabel}
          </ThemedText>
          <Feather name="arrow-right" size={14} color={activeTenant.palette.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    ...commerceShadow("#17324a", 10, 22, 0.04, 2),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    lineHeight: 34,
    color: "#21402a",
  },
  actionPill: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
  },
});

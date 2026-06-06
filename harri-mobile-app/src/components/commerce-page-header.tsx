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
        {meta ? (
          <View style={[styles.metaPill, { backgroundColor: activeTenant.palette.primarySoft }]}>
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
              {meta}
            </ThemedText>
          </View>
        ) : null}
      </View>
      <View style={styles.bottomRow}>
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
    justifyContent: "space-between",
    gap: 12,
  },
  metaPill: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    lineHeight: 34,
  },
  actionPill: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

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
      <View style={styles.titleWrap}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        {meta ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
            {meta}
          </ThemedText>
        ) : null}
      </View>
      {actionLabel && onPressAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPressAction}
          style={[styles.actionPill, { borderColor: activeTenant.palette.border, backgroundColor: activeTenant.palette.primarySoft }]}
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
    paddingVertical: 16,
    gap: 12,
    ...commerceShadow("#17324a", 10, 22, 0.04, 2),
  },
  titleWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  title: {
    lineHeight: 30,
    fontSize: 18,
    fontWeight: "800",
    color: "#183224",
    textAlign: "center",
  },
  meta: {
    textAlign: "center",
  },
  actionPill: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
  },
});

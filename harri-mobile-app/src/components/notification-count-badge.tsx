import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";

type NotificationCountBadgeProps = {
  count: number;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

function formatNotificationCount(count: number) {
  if (count > 9) {
    return "9+";
  }

  return String(count);
}

export function NotificationCountBadge({ count, compact = false, style }: NotificationCountBadgeProps) {
  if (count < 1) {
    return null;
  }

  return (
    <View
      style={[
        styles.badge,
        compact ? styles.badgeCompact : null,
        { backgroundColor: activeTenant.palette.accent },
        style,
      ]}
    >
      <ThemedText type="smallBold" style={compact ? styles.textCompact : styles.textDefault}>
        {formatNotificationCount(count)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeCompact: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
  },
  textDefault: {
    color: "#ffffff",
    fontSize: 11,
    lineHeight: 12,
  },
  textCompact: {
    color: "#ffffff",
    fontSize: 10,
    lineHeight: 11,
  },
});

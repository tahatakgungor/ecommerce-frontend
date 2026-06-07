import { type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { BackLink } from "@/components/back-link";
import { ThemedText } from "@/components/themed-text";
import { commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";

type CommercePageHeaderProps = {
  title: string;
  meta?: string;
  description?: string;
  backLabel?: string;
  onPressBack?: () => void;
  actionLabel?: string;
  actionIcon?: keyof typeof Feather.glyphMap;
  actionAccessibilityLabel?: string;
  onPressAction?: () => void;
  children?: ReactNode;
};

export function CommercePageHeader({
  title,
  meta,
  description,
  backLabel,
  onPressBack,
  actionLabel,
  actionIcon,
  actionAccessibilityLabel,
  onPressAction,
  children,
}: CommercePageHeaderProps) {
  const hasInlineAction = Boolean(actionIcon && onPressAction);

  return (
    <View style={[styles.card, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
      {onPressBack ? (
        <View style={styles.backRow}>
          <BackLink label={backLabel || "Geri"} onPress={onPressBack} />
        </View>
      ) : null}
      <View style={styles.titleWrap}>
        {hasInlineAction ? (
          <View style={styles.titleRow}>
            <ThemedText type="subtitle" style={styles.title}>
              {title}
            </ThemedText>
            <Pressable
              accessibilityLabel={actionAccessibilityLabel || actionLabel || "Aksiyon"}
              accessibilityRole="button"
              onPress={onPressAction}
              style={({ pressed }) => [
                styles.inlineActionButton,
                {
                  borderColor: activeTenant.palette.border,
                  backgroundColor: activeTenant.palette.primarySoft,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <Feather name={actionIcon!} size={17} color={activeTenant.palette.primary} />
            </Pressable>
          </View>
        ) : (
          <ThemedText type="subtitle" style={styles.title}>
            {title}
          </ThemedText>
        )}
        {meta ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
            {meta}
          </ThemedText>
        ) : null}
        {description ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      {children ? <View style={styles.body}>{children}</View> : null}
      {!hasInlineAction && actionLabel && onPressAction ? (
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
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
    ...commerceShadow("#17324a", 10, 22, 0.04, 2),
  },
  backRow: {
    alignItems: "flex-start",
  },
  titleWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  title: {
    lineHeight: 30,
    fontSize: 19,
    fontWeight: "800",
    color: "#183224",
    textAlign: "center",
  },
  meta: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
  },
  body: {
    gap: 12,
  },
  inlineActionButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
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

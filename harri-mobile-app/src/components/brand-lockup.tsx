import { StyleSheet, View } from "react-native";

import { activeTenant } from "@/domain/active-tenant";
import { ThemedText } from "@/components/themed-text";

type BrandLockupProps = {
  subtitle?: string;
  compact?: boolean;
};

export function BrandLockup({ subtitle, compact = false }: BrandLockupProps) {
  return (
    <View style={[styles.row, compact ? styles.rowCompact : null]}>
      <View style={styles.markWrap}>
        <View style={[styles.diamond, styles.diamondPrimary, { backgroundColor: activeTenant.palette.primary }]} />
        <View style={[styles.diamond, styles.diamondAccent, { backgroundColor: activeTenant.palette.accent }]} />
        <View style={[styles.dot, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.primary }]} />
      </View>
      <View style={styles.copy}>
        <ThemedText type="smallBold" style={styles.brandName}>
          {activeTenant.brandName.toUpperCase()}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={compact ? 1 : 2}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowCompact: {
    gap: 10,
  },
  markWrap: {
    width: 38,
    height: 38,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  diamond: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 5,
    transform: [{ rotate: "45deg" }],
  },
  diamondPrimary: {
    left: 4,
    top: 8,
  },
  diamondAccent: {
    right: 4,
    top: 3,
  },
  dot: {
    position: "absolute",
    bottom: 6,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  copy: {
    flex: 1,
    gap: 1,
  },
  brandName: {
    letterSpacing: 1.1,
  },
});

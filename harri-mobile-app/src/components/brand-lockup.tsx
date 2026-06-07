import { StyleSheet, View } from "react-native";

import { activeTenant } from "@/domain/active-tenant";
import { ThemedText } from "@/components/themed-text";

type BrandLockupProps = {
  subtitle?: string;
  compact?: boolean;
  markOnly?: boolean;
};

export function BrandLockup({ subtitle, compact = false, markOnly = false }: BrandLockupProps) {
  if (markOnly) {
    return <View style={styles.markWrap}>{renderMark()}</View>;
  }

  return (
    <View style={[styles.row, compact ? styles.rowCompact : null]}>
      <View style={styles.markWrap}>{renderMark()}</View>
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

function renderMark() {
  return (
    <>
      <View style={[styles.diamond, styles.diamondPrimary, { backgroundColor: activeTenant.palette.primary }]} />
      <View style={[styles.diamond, styles.diamondAccent, { backgroundColor: activeTenant.palette.accent }]} />
      <View style={[styles.dot, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.primary }]} />
    </>
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
    width: 34,
    height: 34,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  diamond: {
    position: "absolute",
    width: 15,
    height: 15,
    borderRadius: 4.5,
    transform: [{ rotate: "45deg" }],
  },
  diamondPrimary: {
    left: 3,
    top: 7,
  },
  diamondAccent: {
    right: 3,
    top: 2,
  },
  dot: {
    position: "absolute",
    bottom: 5,
    right: 7,
    width: 9,
    height: 9,
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

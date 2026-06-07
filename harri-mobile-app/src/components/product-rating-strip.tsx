import { Pressable, StyleSheet, View, type GestureResponderEvent } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { activeTenant } from "@/domain/active-tenant";
import { ThemedText } from "@/components/themed-text";

type ProductRatingStripProps = {
  averageRating: number;
  totalReviews: number;
  compact?: boolean;
  showCount?: boolean;
  onPressCount?: () => void;
};

function clampRating(rawRating: number) {
  if (!Number.isFinite(rawRating)) {
    return 0;
  }

  return Math.max(0, Math.min(5, rawRating));
}

function getStarName(starIndex: number, averageRating: number) {
  if (averageRating >= starIndex) {
    return "star";
  }

  if (averageRating >= starIndex - 0.5) {
    return "star-half-full";
  }

  return "star-outline";
}

export function ProductRatingStrip({ averageRating, totalReviews, compact = false, showCount = true, onPressCount }: ProductRatingStripProps) {
  const safeAverage = clampRating(averageRating);
  const showReviews = totalReviews > 0;
  const iconSize = compact ? 13 : 15;
  const isCountPressable = Boolean(onPressCount && showReviews);

  const handleCountPress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPressCount?.();
  };

  return (
    <View style={[styles.row, compact ? styles.compactRow : null]}>
      <View style={styles.stars} accessibilityLabel={`${safeAverage.toFixed(1)} / 5`}>
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <MaterialCommunityIcons
            key={starIndex}
            name={getStarName(starIndex, safeAverage)}
            size={iconSize}
            color={activeTenant.palette.accent}
          />
        ))}
      </View>
      {showCount && showReviews && isCountPressable ? (
        <Pressable onPress={handleCountPress} style={({ pressed }) => [styles.metaAction, { opacity: pressed ? 0.72 : 1 }]}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
            {safeAverage.toFixed(1)} · {totalReviews} yorum
          </ThemedText>
        </Pressable>
      ) : null}
      {showCount && showReviews && !isCountPressable ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
          {safeAverage.toFixed(1)} · {totalReviews} yorum
        </ThemedText>
      ) : null}
      {showCount && !showReviews ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
          Henüz yorum yok
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  compactRow: {
    minHeight: 18,
  },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  meta: {
    lineHeight: 18,
  },
  metaAction: {
    minHeight: 20,
    justifyContent: "center",
  },
});

import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { useRouter } from "expo-router";
import { resolveAppLink } from "@/lib/app-link";

type AnnouncementStripProps = {
  text: string;
  href?: string;
  speed?: number;
  variant?: "pill" | "topbar";
  restartKey?: number | string;
};

const MARQUEE_GAP = 40;
const MARQUEE_START_DELAY_MS = 3000;
export function AnnouncementStrip({ text, href, speed = 30, variant = "pill", restartKey }: AnnouncementStripProps) {
  const router = useRouter();
  const isTopbar = variant === "topbar";
  const trimmedText = String(text || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const marqueeText = trimmedText;
  const translateX = useSharedValue(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  if (!trimmedText) {
    return null;
  }

  const estimatedTextWidth = useMemo(() => {
    const perCharacterWidth = isTopbar ? 9 : 10;
    return Math.max(120, Math.round(trimmedText.length * perCharacterWidth));
  }, [isTopbar, trimmedText]);

  const resolvedTextWidth = textWidth > 0 ? textWidth : estimatedTextWidth;
  const shouldMarquee = containerWidth > 0 && resolvedTextWidth > containerWidth + 16;

  const animationDurationMs = useMemo(() => {
    return Math.max(8000, Math.round(Math.max(10, speed) * 1000));
  }, [speed]);

  const updateTextWidth = (nextWidth: number) => {
    const normalizedWidth = Math.max(0, Math.round(nextWidth));
    setTextWidth((currentWidth) => (currentWidth === normalizedWidth ? currentWidth : normalizedWidth));
  };

  const marqueeTrackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    if (!shouldMarquee) {
      cancelAnimation(translateX);
      translateX.value = 0;
      return undefined;
    }

    cancelAnimation(translateX);
    translateX.value = 0;

    const distance = resolvedTextWidth + MARQUEE_GAP;
    translateX.value = withRepeat(
      withSequence(
        withDelay(
          isTopbar ? MARQUEE_START_DELAY_MS : 600,
          withTiming(-distance, {
            duration: animationDurationMs,
            easing: Easing.linear,
          })
        ),
        withTiming(0, {
          duration: 16,
          easing: Easing.linear,
        })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(translateX);
      translateX.value = 0;
    };
  }, [animationDurationMs, isTopbar, resolvedTextWidth, restartKey, shouldMarquee, translateX]);

  const handlePress = async () => {
    const resolvedLink = resolveAppLink(href);
    if (resolvedLink.kind === "none") {
      return;
    }

    if (resolvedLink.kind === "external") {
      await Linking.openURL(resolvedLink.href);
      return;
    }

    router.push(resolvedLink.href as never);
  };

  return (
    <Pressable
      accessibilityRole={href ? "button" : undefined}
      disabled={!href}
      onPress={handlePress}
      style={[
        styles.wrap,
        variant === "topbar" ? styles.wrapTopbar : styles.wrapPill,
        { backgroundColor: activeTenant.palette.primary, borderColor: activeTenant.palette.primary },
      ]}
    >
      <View style={styles.measureWrap}>
        <ThemedText
          type="smallBold"
          style={[styles.text, isTopbar ? styles.topbarText : null, styles.measureText]}
          numberOfLines={1}
          onTextLayout={(event) => {
            const measuredWidth = Math.max(...event.nativeEvent.lines.map((line) => Math.ceil(line.width || 0)), 0);
            if (measuredWidth > 0) {
              updateTextWidth(measuredWidth);
            }
          }}
        >
          {marqueeText}
        </ThemedText>
      </View>
      <Feather name="bell" size={14} color="#ffffff" />
      <View
        style={styles.viewport}
        onLayout={(event) => {
          setContainerWidth(Math.round(event.nativeEvent.layout.width));
        }}
      >
        {shouldMarquee ? (
          <Animated.View style={[styles.marqueeTrack, styles.singleTrack, marqueeTrackStyle]}>
            <ThemedText
              type="smallBold"
              style={[styles.text, isTopbar ? styles.topbarText : null]}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              {marqueeText}
            </ThemedText>
          </Animated.View>
        ) : (
          <ThemedText
            type="smallBold"
            style={[styles.text, isTopbar ? styles.topbarText : styles.staticText]}
            numberOfLines={1}
          >
            {trimmedText}
          </ThemedText>
        )}
      </View>
      {href ? <Feather name="arrow-up-right" size={14} color="#ffffff" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  measureWrap: {
    position: "absolute",
    left: 0,
    top: 0,
    opacity: 0,
    flexDirection: "row",
    pointerEvents: "none",
  },
  wrapPill: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 12,
  },
  wrapTopbar: {
    minHeight: 38,
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: 0,
    alignItems: "center",
  },
  viewport: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    justifyContent: "center",
    minHeight: 28,
  },
  marqueeTrack: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  singleTrack: {
    paddingRight: MARQUEE_GAP,
  },
  text: {
    color: "#ffffff",
    paddingVertical: 8,
    flexShrink: 0,
  },
  measureText: {
    alignSelf: "flex-start",
  },
  staticText: {
    minWidth: "100%",
  },
  topbarText: {
    paddingVertical: 0,
    fontSize: 13,
    lineHeight: 16,
  },
});

import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Linking, Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

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

const MARQUEE_GAP = 48;
const TOPBAR_START_DELAY_MS = 1400;

export function AnnouncementStrip({ text, href, speed = 30, variant = "pill", restartKey }: AnnouncementStripProps) {
  const router = useRouter();
  const isTopbar = variant === "topbar";
  const trimmedText = String(text || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const translateX = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  if (!trimmedText) {
    return null;
  }

  const shouldMarquee = containerWidth > 0 && textWidth > containerWidth + 12;
  const travelDistance = shouldMarquee ? textWidth + MARQUEE_GAP : 0;

  const animationDurationMs = useMemo(() => {
    const pixelsPerSecond = Math.max(26, speed * 6);
    return Math.max(9000, Math.round((Math.max(travelDistance, containerWidth) / pixelsPerSecond) * 1000));
  }, [containerWidth, speed, travelDistance]);

  const updateTextWidth = (nextWidth: number) => {
    const normalizedWidth = Math.max(0, Math.round(nextWidth));
    setTextWidth((currentWidth) => (currentWidth === normalizedWidth ? currentWidth : normalizedWidth));
  };

  useEffect(() => {
    animationRef.current?.stop();
    animationRef.current = null;
    translateX.stopAnimation();
    translateX.setValue(0);

    if (!shouldMarquee) {
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(isTopbar ? TOPBAR_START_DELAY_MS : 600),
        Animated.timing(translateX, {
          toValue: -travelDistance,
          duration: animationDurationMs,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animationRef.current = loop;
    loop.start();

    return () => {
      animationRef.current?.stop();
      animationRef.current = null;
      translateX.stopAnimation();
      translateX.setValue(0);
    };
  }, [animationDurationMs, isTopbar, restartKey, shouldMarquee, translateX, travelDistance]);

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
          ellipsizeMode="clip"
          onLayout={(event) => {
            const measuredWidth = event.nativeEvent.layout.width;
            if (measuredWidth > 0) {
              updateTextWidth(measuredWidth);
            }
          }}
        >
          {trimmedText}
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
          <Animated.View style={[styles.marqueeTrack, { transform: [{ translateX }] }]}>
            <ThemedText
              type="smallBold"
              style={[styles.text, isTopbar ? styles.topbarText : null]}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              {trimmedText}
            </ThemedText>
            <ThemedText
              type="smallBold"
              style={[styles.text, styles.cloneText, isTopbar ? styles.topbarText : null]}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              {trimmedText}
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
    paddingVertical: 8,
    alignItems: "center",
  },
  viewport: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    justifyContent: "center",
    minHeight: 16,
  },
  marqueeTrack: {
    flexDirection: "row",
    alignItems: "center",
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
  cloneText: {
    marginLeft: MARQUEE_GAP,
  },
  topbarText: {
    paddingVertical: 0,
    fontSize: 13,
    lineHeight: 16,
  },
});

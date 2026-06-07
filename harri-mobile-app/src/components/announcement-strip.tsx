import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Linking, Platform, Pressable, StyleSheet, View } from "react-native";
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
};

const MARQUEE_GAP = 40;
const TOPBAR_LOOP_SEPARATOR = "   •   ";
const TOPBAR_START_PAUSE_MS = 1200;

export function AnnouncementStrip({ text, href, speed = 30, variant = "pill" }: AnnouncementStripProps) {
  const router = useRouter();
  const isTopbar = variant === "topbar";
  const trimmedText = String(text || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const marqueeText = isTopbar ? `${trimmedText}${TOPBAR_LOOP_SEPARATOR}` : trimmedText;
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const shouldMarquee = containerWidth > 0 && textWidth > 0 && (isTopbar || textWidth > containerWidth);

  if (!trimmedText) {
    return null;
  }

  const animationDurationMs = useMemo(() => {
    return Math.max(8000, Math.round(Math.max(10, speed) * 1000));
  }, [speed]);

  const updateTextWidth = (nextWidth: number) => {
    const normalizedWidth = Math.max(0, Math.round(nextWidth));
    setTextWidth((currentWidth) => (currentWidth === normalizedWidth ? currentWidth : normalizedWidth));
  };

  useEffect(() => {
    if (!shouldMarquee) {
      translateX.stopAnimation();
      translateX.setValue(0);
      return undefined;
    }

    const distance = textWidth + (isTopbar ? 0 : MARQUEE_GAP);
    const animationSteps: Animated.CompositeAnimation[] = [];
    if (isTopbar) {
      animationSteps.push(Animated.delay(TOPBAR_START_PAUSE_MS));
    }
    animationSteps.push(
      Animated.timing(translateX, {
        toValue: -distance,
        duration: animationDurationMs,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
      })
    );
    animationSteps.push(
      Animated.timing(translateX, {
        toValue: 0,
        duration: 0,
        useNativeDriver: Platform.OS !== "web",
      })
    );
    const loop = Animated.loop(
      Animated.sequence(animationSteps)
    );

    loop.start();

    return () => {
      loop.stop();
      translateX.stopAnimation();
    };
  }, [animationDurationMs, isTopbar, shouldMarquee, textWidth, translateX]);

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
      <Feather name="bell" size={14} color="#ffffff" />
      <View
        style={styles.viewport}
        onLayout={(event) => {
          setContainerWidth(Math.round(event.nativeEvent.layout.width));
        }}
      >
        <ThemedText
          type="smallBold"
          style={[styles.text, styles.measureText, variant === "topbar" ? styles.textTopbar : null]}
          numberOfLines={1}
          onLayout={(event) => {
            updateTextWidth(event.nativeEvent.layout.width);
          }}
        >
          {marqueeText}
        </ThemedText>
        {shouldMarquee ? (
          <Animated.View style={[styles.marqueeTrack, { transform: [{ translateX }] }]}>
            <ThemedText
              type="smallBold"
              style={[styles.text, variant === "topbar" ? styles.textTopbar : null]}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              {marqueeText}
            </ThemedText>
            <ThemedText
              type="smallBold"
              style={[styles.text, !isTopbar ? styles.cloneText : null, variant === "topbar" ? styles.textTopbar : null]}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              {marqueeText}
            </ThemedText>
          </Animated.View>
        ) : (
          <ThemedText
            type="smallBold"
            style={[styles.text, styles.staticText, variant === "topbar" ? styles.textTopbar : null]}
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
  wrapPill: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 12,
  },
  wrapTopbar: {
    minHeight: 34,
    borderRadius: 0,
    paddingHorizontal: 20,
  },
  viewport: {
    flex: 1,
    overflow: "hidden",
    justifyContent: "center",
    minHeight: 34,
  },
  marqueeTrack: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  text: {
    color: "#ffffff",
    paddingVertical: 8,
    flexShrink: 0,
  },
  measureText: {
    position: "absolute",
    left: 0,
    top: 0,
    opacity: 0,
    alignSelf: "flex-start",
  },
  staticText: {
    minWidth: "100%",
  },
  textTopbar: {
    paddingVertical: 7,
  },
  cloneText: {
    marginLeft: MARQUEE_GAP,
  },
});

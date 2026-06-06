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
};

const MARQUEE_GAP = 40;

export function AnnouncementStrip({ text, href, speed = 30 }: AnnouncementStripProps) {
  const router = useRouter();
  const trimmedText = String(text || "").trim();
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  if (!trimmedText) {
    return null;
  }

  const animationDurationMs = useMemo(() => {
    const pixelsPerSecond = Math.max(24, speed * 10);
    const distance = Math.max(textWidth + MARQUEE_GAP, containerWidth);
    return Math.max(5000, Math.round((distance / pixelsPerSecond) * 1000));
  }, [containerWidth, speed, textWidth]);

  useEffect(() => {
    if (!containerWidth || !textWidth || textWidth <= containerWidth) {
      translateX.stopAnimation();
      translateX.setValue(0);
      return undefined;
    }

    const distance = textWidth + MARQUEE_GAP;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -distance,
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

    loop.start();

    return () => {
      loop.stop();
      translateX.stopAnimation();
    };
  }, [animationDurationMs, containerWidth, textWidth, translateX]);

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
      style={[styles.wrap, { backgroundColor: activeTenant.palette.primary, borderColor: activeTenant.palette.primary }]}
    >
      <Feather name="bell" size={14} color="#ffffff" />
      <View
        style={styles.viewport}
        onLayout={(event) => {
          setContainerWidth(Math.round(event.nativeEvent.layout.width));
        }}
      >
        {textWidth > containerWidth ? (
          <Animated.View style={[styles.marqueeTrack, { transform: [{ translateX }] }]}>
            <ThemedText
              type="smallBold"
              style={styles.text}
              onLayout={(event) => {
                setTextWidth(Math.round(event.nativeEvent.layout.width));
              }}
            >
              {trimmedText}
            </ThemedText>
            <ThemedText type="smallBold" style={[styles.text, styles.cloneText]}>
              {trimmedText}
            </ThemedText>
          </Animated.View>
        ) : (
          <ThemedText
            type="smallBold"
            style={styles.text}
            numberOfLines={1}
            onLayout={(event) => {
              setTextWidth(Math.round(event.nativeEvent.layout.width));
            }}
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
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  },
  text: {
    color: "#ffffff",
    paddingVertical: 8,
    minWidth: "100%",
  },
  cloneText: {
    marginLeft: MARQUEE_GAP,
  },
});

import { useEffect, useMemo, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

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

const MARQUEE_GAP = 36;
const TOPBAR_START_DELAY_MS = 1400;

export function AnnouncementStrip({ text, href, speed = 30, variant = "pill", restartKey }: AnnouncementStripProps) {
  const router = useRouter();
  const isTopbar = variant === "topbar";
  const trimmedText = String(text || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const scrollRef = useRef<ScrollView | null>(null);
  const frameRef = useRef<number | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTickAtRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  if (!trimmedText) {
    return null;
  }

  const shouldMarquee = containerWidth > 0 && textWidth > containerWidth + 12;
  const pixelsPerSecond = useMemo(() => Math.max(22, speed * 5), [speed]);
  const loopDistance = shouldMarquee ? textWidth + MARQUEE_GAP : 0;

  useEffect(() => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    lastTickAtRef.current = null;
    offsetRef.current = 0;
    scrollRef.current?.scrollTo({ x: 0, animated: false });

    if (!shouldMarquee || !loopDistance) {
      return undefined;
    }

    const tick = (timestamp: number) => {
      if (lastTickAtRef.current === null) {
        lastTickAtRef.current = timestamp;
      } else {
        const elapsedMs = timestamp - lastTickAtRef.current;
        const nextOffset = offsetRef.current + (pixelsPerSecond * elapsedMs) / 1000;
        offsetRef.current = loopDistance > 0 ? nextOffset % loopDistance : 0;
        lastTickAtRef.current = timestamp;
        scrollRef.current?.scrollTo({ x: offsetRef.current, animated: false });
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    delayRef.current = setTimeout(() => {
      lastTickAtRef.current = null;
      frameRef.current = requestAnimationFrame(tick);
    }, isTopbar ? TOPBAR_START_DELAY_MS : 600);

    return () => {
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = null;
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastTickAtRef.current = null;
      offsetRef.current = 0;
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    };
  }, [isTopbar, loopDistance, pixelsPerSecond, restartKey, shouldMarquee]);

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
        isTopbar ? styles.wrapTopbar : styles.wrapPill,
        { backgroundColor: activeTenant.palette.primary, borderColor: activeTenant.palette.primary },
      ]}
    >
      <View style={styles.measureWrap}>
        <Text
          style={[styles.text, isTopbar ? styles.topbarText : null, styles.measureText]}
          numberOfLines={1}
          ellipsizeMode="clip"
          onLayout={(event) => {
            const measuredWidth = Math.max(0, Math.round(event.nativeEvent.layout.width));
            if (measuredWidth > 0) {
              setTextWidth((currentWidth) => (currentWidth === measuredWidth ? currentWidth : measuredWidth));
            }
          }}
        >
          {trimmedText}
        </Text>
      </View>
      <Feather name="bell" size={14} color="#ffffff" />
      <View
        style={styles.viewport}
        onLayout={(event) => {
          const nextWidth = Math.max(0, Math.round(event.nativeEvent.layout.width));
          setContainerWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
        }}
      >
        {shouldMarquee ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            bounces={false}
            overScrollMode="never"
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            style={styles.scrollViewport}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={[styles.text, isTopbar ? styles.topbarText : null]} numberOfLines={1} ellipsizeMode="clip">
              {trimmedText}
            </Text>
            <Text style={[styles.text, styles.cloneText, isTopbar ? styles.topbarText : null]} numberOfLines={1} ellipsizeMode="clip">
              {trimmedText}
            </Text>
          </ScrollView>
        ) : (
          <Text style={[styles.text, isTopbar ? styles.topbarText : styles.staticText]} numberOfLines={1} ellipsizeMode="clip">
            {trimmedText}
          </Text>
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
    left: -10000,
    top: 0,
    opacity: 0,
    pointerEvents: "none",
  },
  measureText: {
    alignSelf: "flex-start",
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
  scrollViewport: {
    flexGrow: 0,
    pointerEvents: "none",
  },
  scrollContent: {
    alignItems: "center",
  },
  text: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 16,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
    letterSpacing: 0.2,
  },
  topbarText: {
    fontSize: 13,
    lineHeight: 16,
  },
  staticText: {
    minWidth: "100%",
  },
  cloneText: {
    marginLeft: MARQUEE_GAP,
  },
});

import { PropsWithChildren, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, View } from "react-native";

import { BottomTabInset } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ScreenShellProps = PropsWithChildren<{
  scroll?: boolean;
  resetScrollKey?: string | number | null;
}>;

export function ScreenShell({ children, scroll = true, resetScrollKey = null }: ScreenShellProps) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (!scroll || resetScrollKey == null) {
      return;
    }

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    });
  }, [resetScrollKey, scroll]);

  const content = scroll ? (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.backdrop}>
        <View style={[styles.orb, styles.orbPrimary]} />
        <View style={[styles.orb, styles.orbAccent]} />
        <View style={[styles.gridWash, { borderColor: "rgba(22, 124, 73, 0.06)" }]} />
      </View>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    position: "relative",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
    pointerEvents: "none",
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orbPrimary: {
    width: 280,
    height: 280,
    top: -90,
    right: -70,
    backgroundColor: "rgba(22, 124, 73, 0.08)",
  },
  orbAccent: {
    width: 220,
    height: 220,
    bottom: 90,
    left: -80,
    backgroundColor: "rgba(240, 123, 36, 0.08)",
  },
  gridWash: {
    position: "absolute",
    top: 120,
    left: 24,
    right: 24,
    bottom: 40,
    borderWidth: 1,
    borderRadius: 36,
    opacity: 0.5,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 18,
    paddingBottom: BottomTabInset + 32,
    gap: 18,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 18,
    paddingBottom: BottomTabInset + 24,
    gap: 18,
  },
});

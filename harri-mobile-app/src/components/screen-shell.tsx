import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, View } from "react-native";

import { BottomTabInset } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ScreenShellProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function ScreenShell({ children, scroll = true }: ScreenShellProps) {
  const theme = useTheme();
  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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

import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, View } from "react-native";

import { activeTenant } from "@/domain/active-tenant";

type ScreenShellProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function ScreenShell({ children, scroll = true }: ScreenShellProps) {
  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: activeTenant.palette.background }]}>
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
    gap: 18,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 18,
  },
});

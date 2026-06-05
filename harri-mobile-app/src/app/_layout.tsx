import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { RootProvider } from '@/providers/root-provider';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const theme = useMemo(
    () => ({
      ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
      dark: scheme === 'dark',
      colors: {
        ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        background: colors.background,
        card: colors.backgroundElement,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
        notification: colors.accent,
      },
    }),
    [colors, scheme]
  );

  return (
    <RootProvider>
      <ThemeProvider value={theme}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </RootProvider>
  );
}

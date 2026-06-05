import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';

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
    <ThemeProvider value={theme}>
      <AppTabs />
    </ThemeProvider>
  );
}

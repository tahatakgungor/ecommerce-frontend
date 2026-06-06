import { Platform, type ViewStyle } from 'react-native';
import { activeTenant } from '@/domain/active-tenant';

export const Colors = {
  light: {
    text: activeTenant.palette.text,
    background: activeTenant.palette.background,
    backgroundElement: activeTenant.palette.surface,
    backgroundSelected: activeTenant.palette.primarySoft,
    textSecondary: activeTenant.palette.mutedText,
    primary: activeTenant.palette.primary,
    accent: activeTenant.palette.accent,
    border: activeTenant.palette.border,
  },
  dark: {
    text: '#eef7ef',
    background: '#0f1712',
    backgroundElement: '#16221a',
    backgroundSelected: '#1e3126',
    textSecondary: '#9fb0a2',
    primary: '#63c58a',
    accent: '#ebb07f',
    border: '#294032',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;

  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function commerceShadow(color: string, y: number, blur: number, opacity: number, elevation = 2): ViewStyle {
  const { r, g, b } = hexToRgb(color);
  if (Platform.OS === "web") {
    return {
      boxShadow: `0px ${y}px ${blur}px rgba(${r}, ${g}, ${b}, ${opacity})`,
    };
  }

  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: y },
    shadowRadius: blur,
    shadowOpacity: opacity,
    elevation,
  };
}

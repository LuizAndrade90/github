import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { colors } from './colors';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.accent,
    secondaryContainer: colors.primaryLight,
    tertiary: colors.info,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.backgroundSecondary,
    error: colors.error,
    errorContainer: colors.error,
    onPrimary: colors.white,
    onPrimaryContainer: colors.primary,
    onSecondary: colors.white,
    onSecondaryContainer: colors.accent,
    onTertiary: colors.white,
    onBackground: colors.text,
    onSurface: colors.text,
    onSurfaceVariant: colors.textSecondary,
    onError: colors.white,
    onErrorContainer: colors.white,
    outline: colors.border,
    outlineVariant: colors.gray300,
    inverseSurface: colors.gray800,
    inverseOnSurface: colors.white,
    inversePrimary: colors.primaryLight,
    shadow: colors.black,
    scrim: colors.overlay,
    backdrop: colors.overlay,
  },
  roundness: 12,
  fonts: {
    ...DefaultTheme.fonts,
  },
};

export type AppTheme = typeof theme;

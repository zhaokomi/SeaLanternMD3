export type ColorPlan = "light" | "dark" | "lightAcrylic" | "darkAcrylic";

/** MD3 完整颜色令牌 */
export interface ThemeColors {
  // Surface
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  // Primary
  primary: string;
  onPrimary?: string;
  primaryContainer?: string;
  onPrimaryContainer?: string;
  // Secondary
  secondary: string;
  onSecondary?: string;
  secondaryContainer?: string;
  onSecondaryContainer?: string;
  // Tertiary (MD3)
  tertiary?: string;
  onTertiary?: string;
  tertiaryContainer?: string;
  onTertiaryContainer?: string;
  // Error (MD3)
  error?: string;
  onError?: string;
  errorContainer?: string;
  onErrorContainer?: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  // Borders
  border: string;
  outline?: string;
  outlineVariant?: string;
  // Surface containers (MD3)
  surface?: string;
  surfaceContainerLowest?: string;
  surfaceContainerLow?: string;
  surfaceContainer?: string;
  surfaceContainerHigh?: string;
  surfaceContainerHighest?: string;
  // Index signature
  [key: string]: string | undefined;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description?: string;
  author?: string;
  version?: string;
  light: ThemeColors;
  dark: ThemeColors;
  lightAcrylic: ThemeColors;
  darkAcrylic: ThemeColors;
  [key: string]: unknown;
}

export type ThemeRegistry = Record<string, ThemeDefinition>;

/**
 * Design tokens for MeasureMart.
 * All colours, typography sizes, spacing and radii are defined here so that
 * individual components never hard-code visual values.
 */

export const colors = {
  primary: '#1A56DB',       // Brand blue — CTAs, active states
  primaryLight: '#EBF5FF',  // Tinted blue — backgrounds, badges
  secondary: '#7E3AF2',     // Purple — accents, promotions
  accent: '#F05252',        // Red — sale prices, error states
  background: '#F9FAFB',    // App background
  surface: '#FFFFFF',       // Card / sheet background
  textPrimary: '#111928',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  success: '#0E9F6E',
  error: '#F05252',
  warning: '#FF8A4C',
  overlay: 'rgba(0,0,0,0.4)',
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
};

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};

// ---------------------------------------------------------------------------
// PascalCase aliases (used by new screens / components per spec)
// ---------------------------------------------------------------------------
export const Colors = {
  ...colors,
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const FontSize = fontSizes;

export const Spacing = spacing;

export const BorderRadius = radii;

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const cardShadow = shadows.md;

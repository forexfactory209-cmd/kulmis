export const Colors = {
  // Brand - Green Theme (from design)
  primary: {
    900: '#0D3B25',
    800: '#14532D',
    700: '#1B4332',
    600: '#2D6A4F',
    500: '#40916C',
    400: '#52B788',
    300: '#74C69D',
    200: '#95D5B2',
    100: '#B7E4C7',
    50: '#D8F3DC',
  },
  // Neutrals
  neutral: {
    900: '#111827',
    800: '#1F2937',
    700: '#374151',
    600: '#4B5563',
    500: '#6B7280',
    400: '#9CA3AF',
    300: '#D1D5DB',
    200: '#E5E7EB',
    100: '#F3F4F6',
    50: '#F9FAFB',
  },
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  // Base
  white: '#FFFFFF',
  black: '#000000',
  // Background
  background: '#FFFFFF',
  card: '#F9FAFB',
  border: '#E5E7EB',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  display: 32,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadows = {
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

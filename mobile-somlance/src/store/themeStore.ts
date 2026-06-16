import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface ThemeState {
  isDark: boolean;
  toggleDarkMode: () => void;
  initTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,

  toggleDarkMode: () => {
    const newVal = !get().isDark;
    set({ isDark: newVal });
    SecureStore.setItemAsync('Kulmis_dark_mode', JSON.stringify(newVal)).catch(() => {});
  },

  initTheme: async () => {
    try {
      const stored = await SecureStore.getItemAsync('Kulmis_dark_mode');
      if (stored !== null) {
        set({ isDark: JSON.parse(stored) });
      }
    } catch {
      // use default (light)
    }
  },
}));

// Helper hook for quick dynamic colors
export function useDarkColors() {
  const isDark = useThemeStore(s => s.isDark);
  return {
    isDark,
    bg: isDark ? '#0F172A' : '#FFFFFF',
    cardBg: isDark ? '#1E293B' : '#FFFFFF',
    surfaceBg: isDark ? '#1E293B' : '#F9FAFB',
    textPrimary: isDark ? '#F1F5F9' : '#111827',
    textSecondary: isDark ? '#94A3B8' : '#6B7280',
    textMuted: isDark ? '#64748B' : '#9CA3AF',
    border: isDark ? '#334155' : '#E5E7EB',
    inputBg: isDark ? '#334155' : '#F9FAFB',
    iconBg: isDark ? '#334155' : '#F9FAFB',
    statusBar: isDark ? 'light-content' as const : 'dark-content' as const,
  };
}

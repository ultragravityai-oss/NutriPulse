export const Colors = {
  // Dark luxury theme default
  dark: {
    bg: '#0B0F19',
    card: '#131B2E',
    cardElevated: '#1C2742',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accent: '#10B981', // emerald
    accentLight: '#34D399',
    accentDark: '#059669',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    
    // Macro colors
    calories: '#10B981', // Emerald
    protein: '#6366F1', // Indigo / Purple
    carbs: '#F59E0B', // Amber
    fat: '#EC4899', // Pink / Rose
    water: '#06B6D4', // Cyan
    burn: '#EF4444', // Red

    // UI elements
    inputBg: '#1A233A',
    modalBg: '#101626',
    tabBar: '#0B0F19',
    tabBarBorder: '#1E293B',
    badgeSuccess: '#064E3B',
    badgeWarning: '#78350F',
    badgeError: '#7F1D1D',
  },
  light: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    cardElevated: '#F1F5F9',
    cardBorder: 'rgba(0, 0, 0, 0.06)',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    accent: '#059669',
    accentLight: '#10B981',
    accentDark: '#047857',
    accentGlow: 'rgba(16, 185, 129, 0.15)',

    calories: '#059669',
    protein: '#4F46E5',
    carbs: '#D97706',
    fat: '#DB2777',
    water: '#0284C7',
    burn: '#DC2626',

    inputBg: '#F1F5F9',
    modalBg: '#FFFFFF',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    badgeSuccess: '#D1FAE5',
    badgeWarning: '#FEF3C7',
    badgeError: '#FEE2E2',
  },
};

export const MACRO_COLORS = {
  calories: {
    primary: '#10B981',
    gradient: ['#10B981', '#059669'] as const,
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  protein: {
    primary: '#6366F1',
    gradient: ['#818CF8', '#6366F1'] as const,
    bg: 'rgba(99, 102, 241, 0.12)',
  },
  carbs: {
    primary: '#F59E0B',
    gradient: ['#FBBF24', '#F59E0B'] as const,
    bg: 'rgba(245, 158, 11, 0.12)',
  },
  fat: {
    primary: '#EC4899',
    gradient: ['#F472B6', '#EC4899'] as const,
    bg: 'rgba(236, 72, 153, 0.12)',
  },
  water: {
    primary: '#06B6D4',
    gradient: ['#22D3EE', '#06B6D4'] as const,
    bg: 'rgba(6, 182, 212, 0.12)',
  },
  burn: {
    primary: '#EF4444',
    gradient: ['#F87171', '#EF4444'] as const,
    bg: 'rgba(239, 68, 68, 0.12)',
  },
};

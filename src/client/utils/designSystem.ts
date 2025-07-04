/**
 * Centralized Design System
 * Following SOLID and DRY principles for consistent theming
 */

// Base color definitions
export const BaseColors = {
  // Primary colors
  matrix: '#00ff41',
  matrixDim: '#00cc33',
  matrixBright: '#00ff55',
  
  // Fantasy colors
  mysticalPurple: '#8b5cf6',
  enchantedGold: '#f59e0b',
  dragonFire: '#ef4444',
  forestMagic: '#10b981',
  arcaneBlue: '#3b82f6',
  twilightViolet: '#7c3aed',
  shimmeringGold: '#fbbf24',
  elderberryPurple: '#6366f1',
  moonbeamSilver: '#e5e7eb',
  stardustWhite: '#f8fafc',
  deepForest: '#065f46',
  ancientStone: '#374151',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  
  // Gray scale
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Fantasy-enhanced semantic colors
  success: '#10b981', // Forest magic
  warning: '#f59e0b', // Enchanted gold
  error: '#ef4444',   // Dragon fire
  info: '#3b82f6',    // Arcane blue
  
  // Enhanced syntax highlighting colors
  orange: '#ff9500',
  green: '#10b981',   // Forest magic for strings
  lightBlue: '#60a5fa', // Softer arcane blue
  red: '#ef4444',     // Dragon fire for nulls
  purple: '#8b5cf6',  // Mystical purple
  yellow: '#fbbf24',  // Shimmering gold
} as const;

// Theme color schemes
export const ThemeColors = {
  light: {
    // Magical background colors with gradients
    background: {
      primary: 'linear-gradient(135deg, #fef7ff 0%, #f3e8ff 50%, #ede9fe 100%)', // Mystical gradient
      secondary: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)', // Starlight gradient
      tertiary: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%)', // Golden enchantment
      overlay: 'rgba(139, 92, 246, 0.15)', // Mystical purple overlay
      modalBackdrop: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 0%, rgba(0, 0, 0, 0.8) 70%)',
      cardGlow: 'rgba(139, 92, 246, 0.1)',
      shimmer: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.8) 50%, transparent 70%)',
    },
    // Enchanted text colors
    text: {
      primary: BaseColors.deepForest, // Deep forest green for readability
      secondary: BaseColors.twilightViolet, // Twilight violet for secondary text
      tertiary: BaseColors.mysticalPurple, // Mystical purple for tertiary
      inverse: BaseColors.stardustWhite, // Stardust white for inverse
      magical: BaseColors.enchantedGold, // Gold for magical emphasis
      legendary: BaseColors.elderberryPurple, // Elderberry for legendary items
    },
    // Mystical border colors
    border: {
      primary: 'linear-gradient(90deg, #d8b4fe, #c084fc, #a855f7)', // Purple gradient border
      secondary: 'linear-gradient(90deg, #fde68a, #f59e0b, #d97706)', // Gold gradient border
      focus: 'linear-gradient(90deg, #60a5fa, #3b82f6, #2563eb)', // Arcane blue focus
      magical: 'linear-gradient(90deg, #d8b4fe, #fde68a, #d8b4fe)', // Alternating mystical border
    },
    // Enchanted component colors
    component: {
      card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)',
      cardHover: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 0.98) 100%)',
      input: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
      inputFocus: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)',
      button: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6366f1 100%)',
      buttonHover: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%)',
      buttonSecondary: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
      buttonGhost: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
    },
    // Fantasy syntax colors
    syntax: {
      key: BaseColors.enchantedGold, // Golden keys
      string: BaseColors.forestMagic, // Forest magic strings
      number: BaseColors.arcaneBlue, // Arcane blue numbers
      boolean: BaseColors.twilightViolet, // Twilight violet booleans
      null: BaseColors.dragonFire, // Dragon fire nulls
      default: BaseColors.deepForest, // Deep forest default
    },
    // Special effects
    effects: {
      glow: '0 0 20px rgba(139, 92, 246, 0.3)',
      shimmer: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.8) 50%, transparent 70%)',
      sparkle: 'radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, transparent 70%)',
      enchantment: '0 0 30px rgba(139, 92, 246, 0.4), inset 0 0 20px rgba(139, 92, 246, 0.1)',
      levitation: '0 10px 30px rgba(139, 92, 246, 0.2)',
    },
  },
  dark: {
    // Background colors
    background: {
      primary: BaseColors.gray900,
      secondary: BaseColors.gray800,
      tertiary: BaseColors.gray700,
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    // Text colors
    text: {
      primary: BaseColors.gray100,
      secondary: BaseColors.gray300,
      tertiary: BaseColors.gray400,
      inverse: BaseColors.gray900,
    },
    // Border colors
    border: {
      primary: BaseColors.gray700,
      secondary: BaseColors.gray600,
      focus: BaseColors.info,
    },
    // Component colors
    component: {
      card: BaseColors.gray800,
      input: BaseColors.gray800,
      button: BaseColors.purple,
      buttonHover: '#9333ea',
    },
    // Syntax colors
    syntax: {
      key: BaseColors.orange,
      string: BaseColors.green,
      number: BaseColors.lightBlue,
      boolean: BaseColors.orange,
      null: BaseColors.red,
      default: BaseColors.gray100,
    },
  },
  matrix: {
    // Background colors
    background: {
      primary: BaseColors.black,
      secondary: 'rgba(0, 0, 0, 0.9)',
      tertiary: 'rgba(0, 0, 0, 0.8)',
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    // Text colors
    text: {
      primary: BaseColors.matrix,
      secondary: BaseColors.matrixDim,
      tertiary: 'rgba(0, 255, 65, 0.7)',
      inverse: BaseColors.black,
    },
    // Border colors
    border: {
      primary: 'rgba(0, 255, 65, 0.3)',
      secondary: 'rgba(0, 255, 65, 0.5)',
      focus: 'rgba(0, 255, 65, 0.7)',
    },
    // Component colors
    component: {
      card: 'rgba(0, 0, 0, 0.9)',
      input: 'rgba(0, 0, 0, 0.9)',
      button: 'rgba(0, 255, 65, 0.1)',
      buttonHover: 'rgba(0, 255, 65, 0.2)',
    },
    // Syntax colors
    syntax: {
      key: BaseColors.orange,
      string: BaseColors.green,
      number: BaseColors.lightBlue,
      boolean: BaseColors.orange,
      null: BaseColors.red,
      default: BaseColors.matrix,
    },
  },
  performance: {
    // Minimal background colors
    background: {
      primary: BaseColors.gray900,
      secondary: BaseColors.gray800,
      tertiary: BaseColors.gray700,
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    // Simple text colors
    text: {
      primary: BaseColors.gray100,
      secondary: BaseColors.gray300,
      tertiary: BaseColors.gray400,
      inverse: BaseColors.gray900,
    },
    // Basic border colors
    border: {
      primary: BaseColors.gray600,
      secondary: BaseColors.gray500,
      focus: BaseColors.gray400,
    },
    // Simple component colors
    component: {
      card: BaseColors.gray800,
      input: BaseColors.gray800,
      button: BaseColors.gray700,
      buttonHover: BaseColors.gray600,
    },
    // Simple syntax colors
    syntax: {
      key: BaseColors.gray300,
      string: BaseColors.gray200,
      number: BaseColors.gray200,
      boolean: BaseColors.gray300,
      null: BaseColors.gray400,
      default: BaseColors.gray100,
    },
  },
} as const;

// Type definitions
export type ThemeName = keyof typeof ThemeColors;
export type ColorCategory = 'background' | 'text' | 'border' | 'component' | 'syntax';
export type ColorVariant = keyof typeof ThemeColors.light.background;

// Design system interface
export interface IDesignSystem {
  getThemeColors(theme: ThemeName): typeof ThemeColors[ThemeName];
  getColor(theme: ThemeName, category: ColorCategory, variant: string): string;
  getSyntaxColors(theme: ThemeName): typeof ThemeColors[ThemeName]['syntax'];
  getComponentStyles(theme: ThemeName): ComponentStyles;
}

// Component style definitions
export interface ComponentStyles {
  modal: {
    backdrop: string;
    container: string;
    header: string;
    content: string;
  };
  button: {
    primary: string;
    secondary: string;
    ghost: string;
    hover?: string;
  };
  input: {
    base: string;
    focused: string;
  };
  card: {
    base: string;
    elevated: string;
    hover?: string;
  };
  effects?: {
    glow?: string;
    shimmer?: string;
    sparkle?: string;
    enchantment?: string;
    levitation?: string;
  };
}

// Design system implementation
export class DesignSystem implements IDesignSystem {
  getThemeColors(theme: ThemeName) {
    return ThemeColors[theme];
  }

  getColor(theme: ThemeName, category: ColorCategory, variant: string): string {
    const themeColors = this.getThemeColors(theme);
    
    if (category in themeColors) {
      const categoryColors = themeColors[category] as Record<string, string>;
      return categoryColors?.[variant] || themeColors.text.primary;
    }
    
    return themeColors.text.primary;
  }

  getSyntaxColors(theme: ThemeName) {
    return this.getThemeColors(theme).syntax;
  }

  getComponentStyles(theme: ThemeName): ComponentStyles {
    const colors = this.getThemeColors(theme);
    
    const baseStyles: ComponentStyles = {
      modal: {
        backdrop: 'modalBackdrop' in colors.background ? colors.background.modalBackdrop : colors.background.overlay,
        container: colors.component.card,
        header: colors.background.secondary,
        content: colors.background.primary,
      },
      button: {
        primary: colors.component.button,
        secondary: (colors.component as Record<string, string>).buttonSecondary || colors.background.secondary,
        ghost: (colors.component as Record<string, string>).buttonGhost || 'transparent',
        hover: (colors.component as Record<string, string>).buttonHover,
      },
      input: {
        base: colors.component.input,
        focused: (colors.component as Record<string, string>).inputFocus || colors.border.focus,
      },
      card: {
        base: colors.component.card,
        elevated: colors.background.secondary,
        hover: (colors.component as Record<string, string>).cardHover,
      },
    };

    // Add special effects for fantasy/light theme
    if (theme === 'light' && (colors as Record<string, Record<string, string>>).effects) {
      baseStyles.effects = (colors as Record<string, Record<string, string>>).effects;
    }

    return baseStyles;
  }
}

// Singleton instance
export const designSystem = new DesignSystem();

// Utility functions for easy access
export const getThemeColors = (theme: ThemeName) => designSystem.getThemeColors(theme);
export const getSyntaxColors = (theme: ThemeName) => designSystem.getSyntaxColors(theme);
export const getComponentStyles = (theme: ThemeName) => designSystem.getComponentStyles(theme);

// Legacy compatibility - maintains existing API
export const getThemeStyles = (theme: string) => {
  return {
    bg: `${theme === 'light' ? 'bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50' : 
          theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-black'}`,
    card: theme === 'matrix' ? 'bg-black backdrop-blur-md shadow-2xl border border-green-500/50' :
          theme === 'dark' ? 'bg-gray-800/90 backdrop-blur-md shadow-2xl' :
          'bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-md shadow-xl border border-purple-200',
    text: theme === 'matrix' ? 'text-green-400' :
          theme === 'dark' ? 'text-gray-100' : 'text-emerald-800',
    border: theme === 'matrix' ? 'border-green-500/50' :
            theme === 'dark' ? 'border-gray-700' : 'border-purple-200',
    accent: theme === 'matrix' ? 'bg-green-600 hover:bg-green-700' :
            theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700',
    secondary: theme === 'matrix' ? 'bg-green-800 hover:bg-green-900' :
               theme === 'dark' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
  };
};

// Design tokens for consistent spacing, typography, etc.
export const DesignTokens = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
} as const;
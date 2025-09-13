'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getActiveTheme } from '@/app/actions/adminSystemActions';

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    heading: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

interface Theme {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  config: ThemeConfig;
}

interface ThemeContextType {
  activeTheme: Theme | null;
  isLoading: boolean;
  applyTheme: (theme: Theme) => void;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme | null;
}

export default function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [activeTheme, setActiveTheme] = useState<Theme | null>(initialTheme || null);
  const [isLoading, setIsLoading] = useState(false);

  const applyTheme = (theme: Theme) => {
    if (!theme?.config) return;

    const { colors, fonts, spacing, borderRadius } = theme.config;

    // Apply CSS variables to the document root
    const root = document.documentElement;
    
    // Apply color variables
    root.style.setProperty('--primary-50', generateColorShades(colors.primary, 50));
    root.style.setProperty('--primary-100', generateColorShades(colors.primary, 100));
    root.style.setProperty('--primary-200', generateColorShades(colors.primary, 200));
    root.style.setProperty('--primary-300', generateColorShades(colors.primary, 300));
    root.style.setProperty('--primary-400', generateColorShades(colors.primary, 400));
    root.style.setProperty('--primary-500', colors.primary);
    root.style.setProperty('--primary-600', generateColorShades(colors.primary, 600));
    root.style.setProperty('--primary-700', generateColorShades(colors.primary, 700));
    root.style.setProperty('--primary-800', generateColorShades(colors.primary, 800));
    root.style.setProperty('--primary-900', generateColorShades(colors.primary, 900));
    root.style.setProperty('--primary-950', generateColorShades(colors.primary, 950));

    root.style.setProperty('--secondary-50', generateColorShades(colors.secondary, 50));
    root.style.setProperty('--secondary-100', generateColorShades(colors.secondary, 100));
    root.style.setProperty('--secondary-200', generateColorShades(colors.secondary, 200));
    root.style.setProperty('--secondary-300', generateColorShades(colors.secondary, 300));
    root.style.setProperty('--secondary-400', generateColorShades(colors.secondary, 400));
    root.style.setProperty('--secondary-500', colors.secondary);
    root.style.setProperty('--secondary-600', generateColorShades(colors.secondary, 600));
    root.style.setProperty('--secondary-700', generateColorShades(colors.secondary, 700));
    root.style.setProperty('--secondary-800', generateColorShades(colors.secondary, 800));
    root.style.setProperty('--secondary-900', generateColorShades(colors.secondary, 900));
    root.style.setProperty('--secondary-950', generateColorShades(colors.secondary, 950));

    // Apply accent colors
    root.style.setProperty('--accent-50', generateColorShades(colors.accent, 50));
    root.style.setProperty('--accent-100', generateColorShades(colors.accent, 100));
    root.style.setProperty('--accent-200', generateColorShades(colors.accent, 200));
    root.style.setProperty('--accent-300', generateColorShades(colors.accent, 300));
    root.style.setProperty('--accent-400', generateColorShades(colors.accent, 400));
    root.style.setProperty('--accent-500', colors.accent);
    root.style.setProperty('--accent-600', generateColorShades(colors.accent, 600));
    root.style.setProperty('--accent-700', generateColorShades(colors.accent, 700));
    root.style.setProperty('--accent-800', generateColorShades(colors.accent, 800));
    root.style.setProperty('--accent-900', generateColorShades(colors.accent, 900));
    root.style.setProperty('--accent-950', generateColorShades(colors.accent, 950));

    // Apply background and text colors
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--surface', colors.surface);
    root.style.setProperty('--text', colors.text);
    root.style.setProperty('--text-secondary', colors.textSecondary);

    // Apply font families
    root.style.setProperty('--font-primary', fonts.primary);
    root.style.setProperty('--font-secondary', fonts.secondary);
    root.style.setProperty('--font-heading', fonts.heading);

    // Apply spacing
    root.style.setProperty('--spacing-xs', spacing.xs);
    root.style.setProperty('--spacing-sm', spacing.sm);
    root.style.setProperty('--spacing-md', spacing.md);
    root.style.setProperty('--spacing-lg', spacing.lg);
    root.style.setProperty('--spacing-xl', spacing.xl);

    // Apply border radius
    root.style.setProperty('--radius-sm', borderRadius.sm);
    root.style.setProperty('--radius-md', borderRadius.md);
    root.style.setProperty('--radius-lg', borderRadius.lg);
    root.style.setProperty('--radius-xl', borderRadius.xl);

    // Update body classes for dark/light mode
    if (colors.background.includes('#0F') || colors.background.includes('#1E') || colors.background.includes('#0A')) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }

    setActiveTheme(theme);
  };

  const refreshTheme = async () => {
    setIsLoading(true);
    try {
      const theme = await getActiveTheme();
      if (theme) {
        applyTheme(theme);
      }
    } catch (error) {
      console.error('Error refreshing theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for user's custom theme first
    const userTheme = localStorage.getItem('userTheme');
    if (userTheme) {
      try {
        const theme = JSON.parse(userTheme);
        applyUserTheme(theme);
        return;
      } catch (error) {
        console.error('Error loading user theme:', error);
      }
    }

    // Fall back to admin theme
    if (initialTheme) {
      applyTheme(initialTheme);
    } else {
      refreshTheme();
    }
  }, [initialTheme]);

  const applyUserTheme = (theme: any) => {
    const root = document.documentElement;
    
    // Apply user's custom colors
    root.style.setProperty('--primary-500', theme.primary);
    root.style.setProperty('--primary-600', darkenColor(theme.primary, 0.1));
    root.style.setProperty('--primary-700', darkenColor(theme.primary, 0.2));
    
    root.style.setProperty('--secondary-500', theme.secondary);
    root.style.setProperty('--secondary-600', darkenColor(theme.secondary, 0.1));
    root.style.setProperty('--secondary-700', darkenColor(theme.secondary, 0.2));
    
    root.style.setProperty('--accent-500', theme.accent);
    root.style.setProperty('--accent-600', darkenColor(theme.accent, 0.1));
    
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--surface', theme.surface);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    
    // Apply font settings
    if (theme.fontFamily) {
      root.style.setProperty('--font-primary', theme.fontFamily);
      root.style.setProperty('--font-heading', theme.fontFamily);
      root.style.setProperty('--font-secondary', theme.fontFamily);
      document.body.style.fontFamily = theme.fontFamily;
    }
    
    if (theme.fontSize) {
      root.style.setProperty('--font-size-base', theme.fontSize);
      document.body.style.fontSize = theme.fontSize;
    }
    
    // Apply border radius
    if (theme.borderRadius) {
      root.style.setProperty('--radius-md', theme.borderRadius);
      root.style.setProperty('--radius-lg', `calc(${theme.borderRadius} * 1.5)`);
      root.style.setProperty('--radius-xl', `calc(${theme.borderRadius} * 2)`);
    }
    
    // Update body classes for dark/light mode
    if (theme.background.includes('#0f') || theme.background.includes('#1e')) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  };

  const darkenColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const value: ThemeContextType = {
    activeTheme,
    isLoading,
    applyTheme,
    refreshTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper function to generate color shades
function generateColorShades(baseColor: string, shade: number): string {
  // Convert hex to RGB
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Generate shade based on the shade number
  let factor: number;
  switch (shade) {
    case 50: factor = 0.95; break;
    case 100: factor = 0.9; break;
    case 200: factor = 0.8; break;
    case 300: factor = 0.7; break;
    case 400: factor = 0.6; break;
    case 500: factor = 0.5; break;
    case 600: factor = 0.4; break;
    case 700: factor = 0.3; break;
    case 800: factor = 0.2; break;
    case 900: factor = 0.1; break;
    case 950: factor = 0.05; break;
    default: factor = 0.5;
  }

  const newR = Math.round(r + (255 - r) * factor);
  const newG = Math.round(g + (255 - g) * factor);
  const newB = Math.round(b + (255 - b) * factor);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

'use client';

import { useState } from 'react';

interface ThemePreviewProps {
  theme: {
    id: string;
    name: string;
    displayName: string;
    config: {
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
    };
  };
  onApply: (theme: any) => void;
}

export default function ThemePreview({ theme, onApply }: ThemePreviewProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);

  const applyPreview = () => {
    if (!theme?.config) return;

    const { colors, fonts, spacing, borderRadius } = theme.config;
    const root = document.documentElement;
    
    // Apply color variables
    root.style.setProperty('--primary-500', colors.primary);
    root.style.setProperty('--secondary-500', colors.secondary);
    root.style.setProperty('--accent-500', colors.accent);
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--surface', colors.surface);
    root.style.setProperty('--text', colors.text);
    root.style.setProperty('--text-secondary', colors.textSecondary);

    // Apply font families
    root.style.setProperty('--font-primary', fonts.primary);
    root.style.setProperty('--font-secondary', fonts.secondary);
    root.style.setProperty('--font-heading', fonts.heading);

    // Apply spacing
    root.style.setProperty('--spacing-md', spacing.md);
    root.style.setProperty('--spacing-lg', spacing.lg);

    // Apply border radius
    root.style.setProperty('--radius-md', borderRadius.md);
    root.style.setProperty('--radius-xl', borderRadius.xl);

    // Update body classes for dark/light mode
    if (colors.background.includes('#0F') || colors.background.includes('#1E') || colors.background.includes('#0A')) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }

    setIsPreviewing(true);
  };

  const resetPreview = () => {
    // Reset to default theme
    const root = document.documentElement;
    root.style.removeProperty('--primary-500');
    root.style.removeProperty('--secondary-500');
    root.style.removeProperty('--accent-500');
    root.style.removeProperty('--background');
    root.style.removeProperty('--surface');
    root.style.removeProperty('--text');
    root.style.removeProperty('--text-secondary');
    root.style.removeProperty('--font-primary');
    root.style.removeProperty('--font-secondary');
    root.style.removeProperty('--font-heading');
    root.style.removeProperty('--spacing-md');
    root.style.removeProperty('--spacing-lg');
    root.style.removeProperty('--radius-md');
    root.style.removeProperty('--radius-xl');
    
    document.body.classList.remove('dark-theme', 'light-theme');
    setIsPreviewing(false);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={isPreviewing ? resetPreview : applyPreview}
        className={`px-3 py-1 text-xs rounded-md transition-colors ${
          isPreviewing 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isPreviewing ? 'Reset Preview' : 'Preview'}
      </button>
      <button
        onClick={() => onApply(theme)}
        className="px-3 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
      >
        Apply Theme
      </button>
    </div>
  );
}


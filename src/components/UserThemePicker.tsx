'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PaintBrushIcon, 
  SunIcon, 
  MoonIcon,
  SwatchIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface UserThemePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onHidePermanently: () => void;
}

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  fontFamily: string;
  fontSize: string;
  borderRadius: string;
}

const defaultThemes = {
  light: {
    primary: '#ec4899',
    secondary: '#0ea5e9',
    accent: '#eab308',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280',
    fontFamily: 'Inter',
    fontSize: '16px',
    borderRadius: '8px',
    // Complete color mapping
    white: '#ffffff',
    black: '#000000',
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
    gray950: '#030712',
    red50: '#fef2f2',
    red100: '#fee2e2',
    red200: '#fecaca',
    red300: '#fca5a5',
    red400: '#f87171',
    red500: '#ef4444',
    red600: '#dc2626',
    red700: '#b91c1c',
    red800: '#991b1b',
    red900: '#7f1d1d',
    pink50: '#fdf2f8',
    pink100: '#fce7f3',
    pink200: '#fbcfe8',
    pink300: '#f9a8d4',
    pink400: '#f472b6',
    pink500: '#ec4899',
    pink600: '#db2777',
    pink700: '#be185d',
    pink800: '#9d174d',
    pink900: '#831843',
    blue50: '#eff6ff',
    blue100: '#dbeafe',
    blue200: '#bfdbfe',
    blue300: '#93c5fd',
    blue400: '#60a5fa',
    blue500: '#3b82f6',
    blue600: '#2563eb',
    blue700: '#1d4ed8',
    blue800: '#1e40af',
    blue900: '#1e3a8a',
    yellow50: '#fefce8',
    yellow100: '#fef9c3',
    yellow200: '#fef08a',
    yellow300: '#fde047',
    yellow400: '#facc15',
    yellow500: '#eab308',
    yellow600: '#ca8a04',
    yellow700: '#a16207',
    yellow800: '#854d0e',
    yellow900: '#713f12',
    green50: '#f0fdf4',
    green100: '#dcfce7',
    green200: '#bbf7d0',
    green300: '#86efac',
    green400: '#4ade80',
    green500: '#22c55e',
    green600: '#16a34a',
    green700: '#15803d',
    green800: '#166534',
    green900: '#14532d',
    purple50: '#faf5ff',
    purple100: '#f3e8ff',
    purple200: '#e9d5ff',
    purple300: '#d8b4fe',
    purple400: '#c084fc',
    purple500: '#a855f7',
    purple600: '#9333ea',
    purple700: '#7c3aed',
    purple800: '#6b21a8',
    purple900: '#581c87'
  },
  dark: {
    primary: '#a855f7',
    secondary: '#ec4899',
    accent: '#10b981',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    fontFamily: 'Inter',
    fontSize: '16px',
    borderRadius: '8px',
    // Dark theme color mapping (inverted)
    white: '#000000',
    black: '#ffffff',
    gray50: '#030712',
    gray100: '#111827',
    gray200: '#1f2937',
    gray300: '#374151',
    gray400: '#4b5563',
    gray500: '#6b7280',
    gray600: '#9ca3af',
    gray700: '#d1d5db',
    gray800: '#e5e7eb',
    gray900: '#f3f4f6',
    gray950: '#f9fafb',
    red50: '#7f1d1d',
    red100: '#991b1b',
    red200: '#b91c1c',
    red300: '#dc2626',
    red400: '#ef4444',
    red500: '#f87171',
    red600: '#fca5a5',
    red700: '#fecaca',
    red800: '#fee2e2',
    red900: '#fef2f2',
    pink50: '#831843',
    pink100: '#9d174d',
    pink200: '#be185d',
    pink300: '#db2777',
    pink400: '#ec4899',
    pink500: '#f472b6',
    pink600: '#f9a8d4',
    pink700: '#fbcfe8',
    pink800: '#fce7f3',
    pink900: '#fdf2f8',
    blue50: '#1e3a8a',
    blue100: '#1e40af',
    blue200: '#1d4ed8',
    blue300: '#2563eb',
    blue400: '#3b82f6',
    blue500: '#60a5fa',
    blue600: '#93c5fd',
    blue700: '#bfdbfe',
    blue800: '#dbeafe',
    blue900: '#eff6ff',
    yellow50: '#713f12',
    yellow100: '#854d0e',
    yellow200: '#a16207',
    yellow300: '#ca8a04',
    yellow400: '#eab308',
    yellow500: '#facc15',
    yellow600: '#fde047',
    yellow700: '#fef08a',
    yellow800: '#fef9c3',
    yellow900: '#fefce8',
    green50: '#14532d',
    green100: '#166534',
    green200: '#15803d',
    green300: '#16a34a',
    green400: '#22c55e',
    green500: '#4ade80',
    green600: '#86efac',
    green700: '#bbf7d0',
    green800: '#dcfce7',
    green900: '#f0fdf4',
    purple50: '#581c87',
    purple100: '#6b21a8',
    purple200: '#7c3aed',
    purple300: '#9333ea',
    purple400: '#a855f7',
    purple500: '#c084fc',
    purple600: '#d8b4fe',
    purple700: '#e9d5ff',
    purple800: '#f3e8ff',
    purple900: '#faf5ff'
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#eff6ff',
    text: '#1e293b',
    textSecondary: '#64748b',
    fontFamily: 'Inter',
    fontSize: '18px',
    borderRadius: '6px',
    // Blue theme color mapping (pink to blue)
    white: '#ffffff',
    black: '#000000',
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
    gray950: '#030712',
    red50: '#fef2f2',
    red100: '#fee2e2',
    red200: '#fecaca',
    red300: '#fca5a5',
    red400: '#f87171',
    red500: '#ef4444',
    red600: '#dc2626',
    red700: '#b91c1c',
    red800: '#991b1b',
    red900: '#7f1d1d',
    pink50: '#eff6ff',
    pink100: '#dbeafe',
    pink200: '#bfdbfe',
    pink300: '#93c5fd',
    pink400: '#60a5fa',
    pink500: '#3b82f6',
    pink600: '#2563eb',
    pink700: '#1d4ed8',
    pink800: '#1e40af',
    pink900: '#1e3a8a',
    blue50: '#eff6ff',
    blue100: '#dbeafe',
    blue200: '#bfdbfe',
    blue300: '#93c5fd',
    blue400: '#60a5fa',
    blue500: '#3b82f6',
    blue600: '#2563eb',
    blue700: '#1d4ed8',
    blue800: '#1e40af',
    blue900: '#1e3a8a',
    yellow50: '#fefce8',
    yellow100: '#fef9c3',
    yellow200: '#fef08a',
    yellow300: '#fde047',
    yellow400: '#facc15',
    yellow500: '#eab308',
    yellow600: '#ca8a04',
    yellow700: '#a16207',
    yellow800: '#854d0e',
    yellow900: '#713f12',
    green50: '#f0fdf4',
    green100: '#dcfce7',
    green200: '#bbf7d0',
    green300: '#86efac',
    green400: '#4ade80',
    green500: '#22c55e',
    green600: '#16a34a',
    green700: '#15803d',
    green800: '#166534',
    green900: '#14532d',
    purple50: '#faf5ff',
    purple100: '#f3e8ff',
    purple200: '#e9d5ff',
    purple300: '#d8b4fe',
    purple400: '#c084fc',
    purple500: '#a855f7',
    purple600: '#9333ea',
    purple700: '#7c3aed',
    purple800: '#6b21a8',
    purple900: '#581c87'
  }
};

const fontFamilies = [
  { name: 'Inter', value: 'Inter', category: 'Sans Serif' },
  { name: 'Poppins', value: 'Poppins', category: 'Sans Serif' },
  { name: 'Roboto', value: 'Roboto', category: 'Sans Serif' },
  { name: 'Open Sans', value: 'Open Sans', category: 'Sans Serif' },
  { name: 'Lato', value: 'Lato', category: 'Sans Serif' },
  { name: 'Montserrat', value: 'Montserrat', category: 'Sans Serif' },
  { name: 'Nunito', value: 'Nunito', category: 'Sans Serif' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro', category: 'Sans Serif' },
  { name: 'Raleway', value: 'Raleway', category: 'Sans Serif' },
  { name: 'Ubuntu', value: 'Ubuntu', category: 'Sans Serif' },
  { name: 'Playfair Display', value: 'Playfair Display', category: 'Serif' },
  { name: 'Merriweather', value: 'Merriweather', category: 'Serif' },
  { name: 'Lora', value: 'Lora', category: 'Serif' },
  { name: 'Crimson Text', value: 'Crimson Text', category: 'Serif' },
  { name: 'Libre Baskerville', value: 'Libre Baskerville', category: 'Serif' },
  { name: 'Dancing Script', value: 'Dancing Script', category: 'Handwriting' },
  { name: 'Pacifico', value: 'Pacifico', category: 'Handwriting' },
  { name: 'Caveat', value: 'Caveat', category: 'Handwriting' },
  { name: 'Kalam', value: 'Kalam', category: 'Handwriting' },
  { name: 'Satisfy', value: 'Satisfy', category: 'Handwriting' },
  { name: 'Fira Code', value: 'Fira Code', category: 'Monospace' },
  { name: 'Source Code Pro', value: 'Source Code Pro', category: 'Monospace' },
  { name: 'JetBrains Mono', value: 'JetBrains Mono', category: 'Monospace' },
  { name: 'Inconsolata', value: 'Inconsolata', category: 'Monospace' }
];

const fontSizes = [
  { name: 'Small', value: '14px' },
  { name: 'Medium', value: '16px' },
  { name: 'Large', value: '18px' },
  { name: 'Extra Large', value: '20px' }
];

const borderRadiusOptions = [
  { name: 'Sharp', value: '4px' },
  { name: 'Rounded', value: '8px' },
  { name: 'More Rounded', value: '12px' },
  { name: 'Very Rounded', value: '16px' }
];

export default function UserThemePicker({ isVisible, onClose, onHidePermanently }: UserThemePickerProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(defaultThemes.light);
  const [selectedPreset, setSelectedPreset] = useState<string>('light');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set(['Inter', 'Poppins']));

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        setCurrentTheme(theme);
        applyTheme(theme);
      } catch (error) {
        console.error('Error loading saved theme:', error);
      }
    }
  }, []);

  const applyTheme = (theme: any, isPreview = false) => {
    const root = document.documentElement;
    
    // Apply primary colors
    root.style.setProperty('--primary-500', theme.primary);
    root.style.setProperty('--primary-600', darkenColor(theme.primary, 0.1));
    root.style.setProperty('--primary-700', darkenColor(theme.primary, 0.2));
    
    // Apply secondary colors
    root.style.setProperty('--secondary-500', theme.secondary);
    root.style.setProperty('--secondary-600', darkenColor(theme.secondary, 0.1));
    root.style.setProperty('--secondary-700', darkenColor(theme.secondary, 0.2));
    
    // Apply accent colors
    root.style.setProperty('--accent-500', theme.accent);
    root.style.setProperty('--accent-600', darkenColor(theme.accent, 0.1));
    
    // Apply background and text colors
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--surface', theme.surface);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    
    // Apply ALL color mappings for complete theme switching
    if (theme.white) root.style.setProperty('--white', theme.white);
    if (theme.black) root.style.setProperty('--black', theme.black);
    
    // Gray colors
    if (theme.gray50) root.style.setProperty('--gray-50', theme.gray50);
    if (theme.gray100) root.style.setProperty('--gray-100', theme.gray100);
    if (theme.gray200) root.style.setProperty('--gray-200', theme.gray200);
    if (theme.gray300) root.style.setProperty('--gray-300', theme.gray300);
    if (theme.gray400) root.style.setProperty('--gray-400', theme.gray400);
    if (theme.gray500) root.style.setProperty('--gray-500', theme.gray500);
    if (theme.gray600) root.style.setProperty('--gray-600', theme.gray600);
    if (theme.gray700) root.style.setProperty('--gray-700', theme.gray700);
    if (theme.gray800) root.style.setProperty('--gray-800', theme.gray800);
    if (theme.gray900) root.style.setProperty('--gray-900', theme.gray900);
    if (theme.gray950) root.style.setProperty('--gray-950', theme.gray950);
    
    // Red colors
    if (theme.red50) root.style.setProperty('--red-50', theme.red50);
    if (theme.red100) root.style.setProperty('--red-100', theme.red100);
    if (theme.red200) root.style.setProperty('--red-200', theme.red200);
    if (theme.red300) root.style.setProperty('--red-300', theme.red300);
    if (theme.red400) root.style.setProperty('--red-400', theme.red400);
    if (theme.red500) root.style.setProperty('--red-500', theme.red500);
    if (theme.red600) root.style.setProperty('--red-600', theme.red600);
    if (theme.red700) root.style.setProperty('--red-700', theme.red700);
    if (theme.red800) root.style.setProperty('--red-800', theme.red800);
    if (theme.red900) root.style.setProperty('--red-900', theme.red900);
    
    // Pink colors
    if (theme.pink50) root.style.setProperty('--pink-50', theme.pink50);
    if (theme.pink100) root.style.setProperty('--pink-100', theme.pink100);
    if (theme.pink200) root.style.setProperty('--pink-200', theme.pink200);
    if (theme.pink300) root.style.setProperty('--pink-300', theme.pink300);
    if (theme.pink400) root.style.setProperty('--pink-400', theme.pink400);
    if (theme.pink500) root.style.setProperty('--pink-500', theme.pink500);
    if (theme.pink600) root.style.setProperty('--pink-600', theme.pink600);
    if (theme.pink700) root.style.setProperty('--pink-700', theme.pink700);
    if (theme.pink800) root.style.setProperty('--pink-800', theme.pink800);
    if (theme.pink900) root.style.setProperty('--pink-900', theme.pink900);
    
    // Blue colors
    if (theme.blue50) root.style.setProperty('--blue-50', theme.blue50);
    if (theme.blue100) root.style.setProperty('--blue-100', theme.blue100);
    if (theme.blue200) root.style.setProperty('--blue-200', theme.blue200);
    if (theme.blue300) root.style.setProperty('--blue-300', theme.blue300);
    if (theme.blue400) root.style.setProperty('--blue-400', theme.blue400);
    if (theme.blue500) root.style.setProperty('--blue-500', theme.blue500);
    if (theme.blue600) root.style.setProperty('--blue-600', theme.blue600);
    if (theme.blue700) root.style.setProperty('--blue-700', theme.blue700);
    if (theme.blue800) root.style.setProperty('--blue-800', theme.blue800);
    if (theme.blue900) root.style.setProperty('--blue-900', theme.blue900);
    
    // Yellow colors
    if (theme.yellow50) root.style.setProperty('--yellow-50', theme.yellow50);
    if (theme.yellow100) root.style.setProperty('--yellow-100', theme.yellow100);
    if (theme.yellow200) root.style.setProperty('--yellow-200', theme.yellow200);
    if (theme.yellow300) root.style.setProperty('--yellow-300', theme.yellow300);
    if (theme.yellow400) root.style.setProperty('--yellow-400', theme.yellow400);
    if (theme.yellow500) root.style.setProperty('--yellow-500', theme.yellow500);
    if (theme.yellow600) root.style.setProperty('--yellow-600', theme.yellow600);
    if (theme.yellow700) root.style.setProperty('--yellow-700', theme.yellow700);
    if (theme.yellow800) root.style.setProperty('--yellow-800', theme.yellow800);
    if (theme.yellow900) root.style.setProperty('--yellow-900', theme.yellow900);
    
    // Green colors
    if (theme.green50) root.style.setProperty('--green-50', theme.green50);
    if (theme.green100) root.style.setProperty('--green-100', theme.green100);
    if (theme.green200) root.style.setProperty('--green-200', theme.green200);
    if (theme.green300) root.style.setProperty('--green-300', theme.green300);
    if (theme.green400) root.style.setProperty('--green-400', theme.green400);
    if (theme.green500) root.style.setProperty('--green-500', theme.green500);
    if (theme.green600) root.style.setProperty('--green-600', theme.green600);
    if (theme.green700) root.style.setProperty('--green-700', theme.green700);
    if (theme.green800) root.style.setProperty('--green-800', theme.green800);
    if (theme.green900) root.style.setProperty('--green-900', theme.green900);
    
    // Purple colors
    if (theme.purple50) root.style.setProperty('--purple-50', theme.purple50);
    if (theme.purple100) root.style.setProperty('--purple-100', theme.purple100);
    if (theme.purple200) root.style.setProperty('--purple-200', theme.purple200);
    if (theme.purple300) root.style.setProperty('--purple-300', theme.purple300);
    if (theme.purple400) root.style.setProperty('--purple-400', theme.purple400);
    if (theme.purple500) root.style.setProperty('--purple-500', theme.purple500);
    if (theme.purple600) root.style.setProperty('--purple-600', theme.purple600);
    if (theme.purple700) root.style.setProperty('--purple-700', theme.purple700);
    if (theme.purple800) root.style.setProperty('--purple-800', theme.purple800);
    if (theme.purple900) root.style.setProperty('--purple-900', theme.purple900);
    
    // Apply font settings
    root.style.setProperty('--font-primary', theme.fontFamily);
    root.style.setProperty('--font-heading', theme.fontFamily);
    root.style.setProperty('--font-secondary', theme.fontFamily);
    root.style.setProperty('--font-size-base', theme.fontSize);
    
    // Apply border radius
    root.style.setProperty('--radius-md', theme.borderRadius);
    root.style.setProperty('--radius-lg', `calc(${theme.borderRadius} * 1.5)`);
    root.style.setProperty('--radius-xl', `calc(${theme.borderRadius} * 2)`);
    
    // Update body classes for dark/light mode
    if (theme.background.includes('#0f') || theme.background.includes('#1e')) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
    
    // Update body font
    document.body.style.fontFamily = theme.fontFamily;
    document.body.style.fontSize = theme.fontSize;
  };

  const darkenColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const loadGoogleFont = (fontFamily: string) => {
    if (loadedFonts.has(fontFamily)) return;
    
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    setLoadedFonts(prev => new Set([...prev, fontFamily]));
  };

  const handleColorChange = (colorType: keyof ThemeColors, value: string) => {
    const newTheme = { ...currentTheme, [colorType]: value };
    setCurrentTheme(newTheme);
    setHasUnsavedChanges(true);
    
    // Always apply live preview
    applyTheme(newTheme, true);
  };

  const handlePresetSelect = (presetName: string) => {
    const preset = defaultThemes[presetName as keyof typeof defaultThemes];
    setCurrentTheme(preset);
    setSelectedPreset(presetName);
    setHasUnsavedChanges(true);
    
    // Always apply live preview
    applyTheme(preset, true);
  };

  const handleApply = () => {
    applyTheme(currentTheme, false);
    localStorage.setItem('userTheme', JSON.stringify(currentTheme));
    setHasUnsavedChanges(false);
    onClose();
  };

  const handleReset = () => {
    const defaultTheme = defaultThemes.light;
    setCurrentTheme(defaultTheme);
    setSelectedPreset('light');
    setHasUnsavedChanges(true);
    applyTheme(defaultTheme, true);
    localStorage.removeItem('userTheme');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <PaintBrushIcon className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Customize Theme
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onHidePermanently}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Hide permanently"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Unsaved Changes Indicator */}
            {hasUnsavedChanges && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You have unsaved changes. Click "Save" to apply permanently.
                </p>
              </div>
            )}

            {/* Preset Themes */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Preset Themes
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(defaultThemes).map(([name, theme]) => (
                  <button
                    key={name}
                    onClick={() => handlePresetSelect(name)}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      selectedPreset === name
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex space-x-1 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.secondary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {name}
                    </span>
                    {selectedPreset === name && (
                      <CheckIcon className="absolute top-1 right-1 w-3 h-3 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Customization */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Font Settings
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Font Family
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    {fontFamilies.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => {
                          loadGoogleFont(font.value);
                          handleColorChange('fontFamily', font.value);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                          currentTheme.fontFamily === font.value
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                        }`}
                        style={{ fontFamily: font.value }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{font.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {font.category}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1" style={{ fontFamily: font.value }}>
                          The quick brown fox jumps over the lazy dog
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Font Size
                  </label>
                  <select
                    value={currentTheme.fontSize}
                    onChange={(e) => handleColorChange('fontSize', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {fontSizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.name} ({size.value})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Border Radius
                  </label>
                  <select
                    value={currentTheme.borderRadius}
                    onChange={(e) => handleColorChange('borderRadius', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {borderRadiusOptions.map((radius) => (
                      <option key={radius.value} value={radius.value}>
                        {radius.name} ({radius.value})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Color Customization */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Customize Colors
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={currentTheme.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={currentTheme.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={currentTheme.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={currentTheme.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={currentTheme.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={currentTheme.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={currentTheme.background}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={currentTheme.background}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Surface Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={currentTheme.surface}
                      onChange={(e) => handleColorChange('surface', e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={currentTheme.surface}
                      onChange={(e) => handleColorChange('surface', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Preview
              </h4>
              <div className="space-y-2">
                <div 
                  className="p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: currentTheme.surface,
                    borderColor: currentTheme.primary + '20'
                  }}
                >
                  <div 
                    className="text-sm font-medium mb-1"
                    style={{ color: currentTheme.text }}
                  >
                    Sample Text
                  </div>
                  <div 
                    className="text-xs mb-2"
                    style={{ color: currentTheme.textSecondary }}
                  >
                    Secondary text
                  </div>
                  <button
                    className="px-3 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: currentTheme.primary }}
                  >
                    Primary Button
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReset}
              className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Reset
            </button>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 text-xs text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ 
                  backgroundColor: currentTheme.primary,
                  borderRadius: currentTheme.borderRadius
                }}
              >
                {hasUnsavedChanges ? 'Save Changes' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

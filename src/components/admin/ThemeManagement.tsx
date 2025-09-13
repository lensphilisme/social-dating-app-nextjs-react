'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  SwatchIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  SwatchIcon as ColorSwatchIcon
} from '@heroicons/react/24/outline';
import { activateTheme, deleteTheme, createTheme, updateTheme } from '@/app/actions/adminSystemActions';
import { useRouter } from 'next/navigation';
import ThemePreview from './ThemePreview';

interface ThemeManagementProps {
  themes: any[];
}

export default function ThemeManagement({ themes }: ThemeManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState<any>(null);
  const [previewTheme, setPreviewTheme] = useState<any>(null);
  const router = useRouter();

  const [newTheme, setNewTheme] = useState({
    name: '',
    displayName: '',
    description: '',
    config: {
      colors: {
        primary: '#8B5CF6',
        secondary: '#EC4899',
        accent: '#06B6D4',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: '#1F2937',
        textSecondary: '#6B7280'
      },
      fonts: {
        primary: 'Inter',
        secondary: 'Inter',
        heading: 'Inter'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem'
      }
    }
  });

  const handleActivateTheme = async (themeId: string) => {
    try {
      await activateTheme(themeId);
      // Refresh the page to apply the new theme
      window.location.reload();
    } catch (error) {
      console.error('Error activating theme:', error);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (confirm('Are you sure you want to delete this theme?')) {
      try {
        await deleteTheme(themeId);
        router.refresh();
      } catch (error) {
        console.error('Error deleting theme:', error);
      }
    }
  };

  const handleCreateTheme = async () => {
    try {
      await createTheme(newTheme);
      setShowCreateModal(false);
      setNewTheme({
        name: '',
        displayName: '',
        description: '',
        config: {
          colors: {
            primary: '#8B5CF6',
            secondary: '#EC4899',
            accent: '#06B6D4',
            background: '#FFFFFF',
            surface: '#F8FAFC',
            text: '#1F2937',
            textSecondary: '#6B7280'
          },
          fonts: {
            primary: 'Inter',
            secondary: 'Inter',
            heading: 'Inter'
          },
          spacing: {
            xs: '0.25rem',
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem'
          },
          borderRadius: {
            sm: '0.375rem',
            md: '0.5rem',
            lg: '0.75rem',
            xl: '1rem'
          }
        }
      });
      router.refresh();
    } catch (error) {
      console.error('Error creating theme:', error);
    }
  };

  const handleUpdateTheme = async () => {
    try {
      await updateTheme(editingTheme.id, {
        displayName: editingTheme.displayName,
        description: editingTheme.description,
        config: editingTheme.config
      });
      setEditingTheme(null);
      router.refresh();
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
    <div className="flex items-center space-x-3">
      <label className="text-sm font-medium text-gray-700 w-24">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Theme Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Customize the appearance and branding of your platform
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Theme
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Theme Preview */}
              <div 
                className="h-32 relative"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.config.colors.primary}, ${theme.config.colors.secondary})` 
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-4 left-4">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <SwatchIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                {theme.isActive && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Active
                    </div>
                  </div>
                )}
                {theme.isDefault && (
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Default
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{theme.displayName}</h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setPreviewTheme(theme)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Preview"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingTheme(theme)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    {!theme.isDefault && (
                      <button
                        onClick={() => handleDeleteTheme(theme.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{theme.description}</p>

                {/* Color Palette */}
                <div className="flex space-x-1 mb-4">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: theme.config.colors.primary }}
                    title="Primary"
                  ></div>
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: theme.config.colors.secondary }}
                    title="Secondary"
                  ></div>
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: theme.config.colors.accent }}
                    title="Accent"
                  ></div>
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: theme.config.colors.background }}
                    title="Background"
                  ></div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <ThemePreview 
                    theme={theme} 
                    onApply={() => handleActivateTheme(theme.id)}
                  />
                  {theme.isActive && (
                    <div className="flex-1 px-3 py-2 bg-green-100 text-green-800 text-sm rounded-lg text-center">
                      Currently Active
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Theme Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Theme</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme Name</label>
                <input
                  type="text"
                  value={newTheme.name}
                  onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., modern-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  value={newTheme.displayName}
                  onChange={(e) => setNewTheme({ ...newTheme, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Modern Dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTheme.description}
                  onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe this theme..."
                />
              </div>

              {/* Color Configuration */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <ColorSwatchIcon className="w-5 h-5 mr-2" />
                  Colors
                </h4>
                <div className="space-y-3">
                  <ColorPicker
                    label="Primary"
                    value={newTheme.config.colors.primary}
                    onChange={(value) => setNewTheme({
                      ...newTheme,
                      config: {
                        ...newTheme.config,
                        colors: { ...newTheme.config.colors, primary: value }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Secondary"
                    value={newTheme.config.colors.secondary}
                    onChange={(value) => setNewTheme({
                      ...newTheme,
                      config: {
                        ...newTheme.config,
                        colors: { ...newTheme.config.colors, secondary: value }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Accent"
                    value={newTheme.config.colors.accent}
                    onChange={(value) => setNewTheme({
                      ...newTheme,
                      config: {
                        ...newTheme.config,
                        colors: { ...newTheme.config.colors, accent: value }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Background"
                    value={newTheme.config.colors.background}
                    onChange={(value) => setNewTheme({
                      ...newTheme,
                      config: {
                        ...newTheme.config,
                        colors: { ...newTheme.config.colors, background: value }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Surface"
                    value={newTheme.config.colors.surface}
                    onChange={(value) => setNewTheme({
                      ...newTheme,
                      config: {
                        ...newTheme.config,
                        colors: { ...newTheme.config.colors, surface: value }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Text"
                    value={newTheme.config.colors.text}
                    onChange={(value) => setNewTheme({
                      ...newTheme,
                      config: {
                        ...newTheme.config,
                        colors: { ...newTheme.config.colors, text: value }
                      }
                    })}
                  />
                </div>
              </div>

              {/* Font Configuration */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Fonts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Font</label>
                    <select
                      value={newTheme.config.fonts.primary}
                      onChange={(e) => setNewTheme({
                        ...newTheme,
                        config: {
                          ...newTheme.config,
                          fonts: { ...newTheme.config.fonts, primary: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Font</label>
                    <select
                      value={newTheme.config.fonts.secondary}
                      onChange={(e) => setNewTheme({
                        ...newTheme,
                        config: {
                          ...newTheme.config,
                          fonts: { ...newTheme.config.fonts, secondary: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heading Font</label>
                    <select
                      value={newTheme.config.fonts.heading}
                      onChange={(e) => setNewTheme({
                        ...newTheme,
                        config: {
                          ...newTheme.config,
                          fonts: { ...newTheme.config.fonts, heading: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTheme}
                disabled={!newTheme.name || !newTheme.displayName}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Theme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Theme Modal */}
      {editingTheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Theme: {editingTheme.displayName}</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  value={editingTheme.displayName}
                  onChange={(e) => setEditingTheme({ ...editingTheme, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingTheme.description}
                  onChange={(e) => setEditingTheme({ ...editingTheme, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Color Configuration */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <ColorSwatchIcon className="w-5 h-5 mr-2" />
                  Colors
                </h4>
                <div className="space-y-3">
                  <ColorPicker
                    label="Primary"
                    value={editingTheme.config.colors.primary}
                    onChange={(value) => setEditingTheme({
                      ...editingTheme,
                      config: {
                        ...editingTheme.config,
                        colors: { ...editingTheme.config.colors, primary: value }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Secondary"
                    value={editingTheme.config.colors.secondary}
                    onChange={(value) => setEditingTheme({
                      ...editingTheme,
                      config: {
                        ...editingTheme.config,
                        colors: { ...editingTheme.config.colors, secondary: value }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Accent"
                    value={editingTheme.config.colors.accent}
                    onChange={(value) => setEditingTheme({
                      ...editingTheme,
                      config: {
                        ...editingTheme.config,
                        colors: { ...editingTheme.config.colors, accent: value }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Background"
                    value={editingTheme.config.colors.background}
                    onChange={(value) => setEditingTheme({
                      ...editingTheme,
                      config: {
                        ...editingTheme.config,
                        colors: { ...editingTheme.config.colors, background: value }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Surface"
                    value={editingTheme.config.colors.surface}
                    onChange={(value) => setEditingTheme({
                      ...editingTheme,
                      config: {
                        ...editingTheme.config,
                        colors: { ...editingTheme.config.colors, surface: value }
                      }
                    })}
                  />
                  <ColorPicker
                    label="Text"
                    value={editingTheme.config.colors.text}
                    onChange={(value) => setEditingTheme({
                      ...editingTheme,
                      config: {
                        ...editingTheme.config,
                        colors: { ...editingTheme.config.colors, text: value }
                      }
                    })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setEditingTheme(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTheme}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Update Theme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Theme Preview: {previewTheme.displayName}</h3>
              <button
                onClick={() => setPreviewTheme(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div 
                className="rounded-lg p-8 min-h-[400px]"
                style={{ 
                  backgroundColor: previewTheme.config.colors.background,
                  color: previewTheme.config.colors.text,
                  fontFamily: previewTheme.config.fonts.primary
                }}
              >
                <div className="max-w-2xl mx-auto">
                  <h1 
                    className="text-4xl font-bold mb-4"
                    style={{ 
                      color: previewTheme.config.colors.primary,
                      fontFamily: previewTheme.config.fonts.heading
                    }}
                  >
                    Welcome to NextMatch
                  </h1>
                  <p 
                    className="text-lg mb-8"
                    style={{ color: previewTheme.config.colors.textSecondary }}
                  >
                    Find meaningful connections with people who share your values and beliefs.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div 
                      className="p-6 rounded-lg"
                      style={{ 
                        backgroundColor: previewTheme.config.colors.surface,
                        borderRadius: previewTheme.config.borderRadius.lg
                      }}
                    >
                      <h3 
                        className="text-xl font-semibold mb-3"
                        style={{ color: previewTheme.config.colors.primary }}
                      >
                        Smart Matching
                      </h3>
                      <p style={{ color: previewTheme.config.colors.textSecondary }}>
                        Our AI-powered algorithm finds compatible matches based on your preferences.
                      </p>
                    </div>
                    <div 
                      className="p-6 rounded-lg"
                      style={{ 
                        backgroundColor: previewTheme.config.colors.surface,
                        borderRadius: previewTheme.config.borderRadius.lg
                      }}
                    >
                      <h3 
                        className="text-xl font-semibold mb-3"
                        style={{ color: previewTheme.config.colors.secondary }}
                      >
                        Safe & Secure
                      </h3>
                      <p style={{ color: previewTheme.config.colors.textSecondary }}>
                        Your privacy and safety are our top priorities with verified profiles.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button 
                      className="px-6 py-3 rounded-lg font-medium transition-colors"
                      style={{ 
                        backgroundColor: previewTheme.config.colors.primary,
                        color: '#FFFFFF',
                        borderRadius: previewTheme.config.borderRadius.md
                      }}
                    >
                      Get Started
                    </button>
                    <button 
                      className="px-6 py-3 rounded-lg font-medium border transition-colors"
                      style={{ 
                        borderColor: previewTheme.config.colors.primary,
                        color: previewTheme.config.colors.primary,
                        borderRadius: previewTheme.config.borderRadius.md
                      }}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

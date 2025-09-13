'use client';

import { useState, useEffect } from 'react';
import { 
  CogIcon, 
  GlobeAltIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  ChartBarIcon,
  EyeIcon,
  LockClosedIcon,
  HeartIcon,
  Bars3Icon,
  ExclamationTriangleIcon,
  MegaphoneIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { 
  CogIcon as CogIconSolid,
  GlobeAltIcon as GlobeAltIconSolid,
  UsersIcon as UsersIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  BellIcon as BellIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  EyeIcon as EyeIconSolid,
  LockClosedIcon as LockClosedIconSolid,
  HeartIcon as HeartIconSolid,
  Bars3Icon as Bars3IconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  MegaphoneIcon as MegaphoneIconSolid,
  KeyIcon as KeyIconSolid,
  DevicePhoneMobileIcon as DevicePhoneMobileIconSolid,
  ArrowsUpDownIcon as ArrowsUpDownIconSolid
} from '@heroicons/react/24/solid';
import { updateAdminSetting, updateMultipleAdminSettings } from '@/app/actions/adminSystemActions';
import { toast } from 'react-hot-toast';

interface AdminSettingsProps {
  settings: any[];
}

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  isPublic: boolean;
}

const tabs = [
  { id: 'general', name: 'General', icon: GlobeAltIcon, iconSolid: GlobeAltIconSolid },
  { id: 'navigation', name: 'Navigation', icon: Bars3Icon, iconSolid: Bars3IconSolid },
  { id: 'users', name: 'Users', icon: UsersIcon, iconSolid: UsersIconSolid },
  { id: 'reports', name: 'Reports', icon: ExclamationTriangleIcon, iconSolid: ExclamationTriangleIconSolid },
  { id: 'matching', name: 'Matching', icon: HeartIcon, iconSolid: HeartIconSolid },
  { id: 'moderation', name: 'Moderation', icon: ShieldCheckIcon, iconSolid: ShieldCheckIconSolid },
  { id: 'media', name: 'Media', icon: EyeIcon, iconSolid: EyeIconSolid },
  { id: 'security', name: 'Security', icon: LockClosedIcon, iconSolid: LockClosedIconSolid },
  { id: 'notifications', name: 'Notifications', icon: BellIcon, iconSolid: BellIconSolid },
  { id: 'auth', name: 'Authentication', icon: KeyIcon, iconSolid: KeyIconSolid },
  { id: 'theme', name: 'Theme', icon: CogIcon, iconSolid: CogIconSolid }
];

export default function AdminSettings({ settings }: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [settingsState, setSettingsState] = useState<Setting[]>(settings);
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Filter settings based on search query
  const filteredSettings = settingsState.filter(setting => 
    setting.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    setting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    setting.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group settings by category
  const settingsByCategory = filteredSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, Setting[]>);

  const handleEditSetting = (setting: Setting) => {
    setEditingSetting(setting.key);
    setEditValue(setting.value);
  };

  const handleSaveSetting = async (key: string) => {
    if (!editValue.trim()) {
      toast.error('Value cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      await updateAdminSetting(key, editValue);
      
      // Update local state
      setSettingsState(prev => 
        prev.map(setting => 
          setting.key === key 
            ? { ...setting, value: editValue }
            : setting
        )
      );
      
      setEditingSetting(null);
      setEditValue('');
      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSetting(null);
    setEditValue('');
  };

  const handleToggleSetting = async (setting: Setting) => {
    const newValue = setting.value === 'true' ? 'false' : 'true';
    setIsLoading(true);
    
    // Update local state immediately for live updates
    setSettingsState(prev => 
      prev.map(s => 
        s.key === setting.key 
          ? { ...s, value: newValue }
          : s
      )
    );
    
    try {
      await updateAdminSetting(setting.key, newValue);
      toast.success(`${setting.key.replace(/_/g, ' ')} updated successfully`);
      
      // Dispatch event to update navigation if it's a navigation setting
      if (setting.key.startsWith('nav_')) {
        window.dispatchEvent(new CustomEvent('navigationSettingsUpdated'));
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
      
      // Revert local state on error
      setSettingsState(prev => 
        prev.map(s => 
          s.key === setting.key 
            ? { ...s, value: setting.value }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpdate = async (category: string, updates: Record<string, string>) => {
    setIsLoading(true);
    
    // Store original values for rollback
    const originalValues: Record<string, string> = {};
    Object.keys(updates).forEach(key => {
      const setting = settingsState.find(s => s.key === key);
      if (setting) {
        originalValues[key] = setting.value;
      }
    });
    
    // Update local state immediately for live updates
    setSettingsState(prev => 
      prev.map(setting => 
        updates[setting.key] !== undefined
          ? { ...setting, value: updates[setting.key] }
          : setting
      )
    );
    
    try {
      await updateMultipleAdminSettings(updates);
      toast.success(`${Object.keys(updates).length} settings updated successfully`);
      
      // Dispatch event to update navigation if any navigation settings were updated
      const hasNavSettings = Object.keys(updates).some(key => key.startsWith('nav_'));
      if (hasNavSettings) {
        window.dispatchEvent(new CustomEvent('navigationSettingsUpdated'));
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
      
      // Revert local state on error
      setSettingsState(prev => 
        prev.map(setting => 
          originalValues[setting.key] !== undefined
            ? { ...setting, value: originalValues[setting.key] }
            : setting
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, itemKey: string) => {
    console.log('Drag start:', itemKey);
    setDraggedItem(itemKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    console.log('Drop on:', targetKey, 'Dragged:', draggedItem);
    
    if (!draggedItem || draggedItem === targetKey) {
      console.log('No drag item or same target');
      setDraggedItem(null);
      return;
    }

    try {
      // Get current order settings
      const orderSettings = settingsByCategory['navigation']?.filter(s => s.key.includes('_order')) || [];
      const draggedOrderKey = `${draggedItem.replace('_visible', '')}_order`;
      const targetOrderKey = `${targetKey.replace('_visible', '')}_order`;
      
      const draggedOrderSetting = orderSettings.find(s => s.key === draggedOrderKey);
      const targetOrderSetting = orderSettings.find(s => s.key === targetOrderKey);

      if (draggedOrderSetting && targetOrderSetting) {
        const draggedOrder = parseInt(draggedOrderSetting.value);
        const targetOrder = parseInt(targetOrderSetting.value);

        // Update the order values
        const updates: Record<string, string> = {};
        updates[draggedOrderKey] = targetOrder.toString();
        updates[targetOrderKey] = draggedOrder.toString();

        await handleBulkUpdate('navigation', updates);
        toast.success('Navigation order updated successfully');
      } else {
        // If settings don't exist, create them with the swapped values
        const updates: Record<string, string> = {};
        updates[draggedOrderKey] = targetOrderSetting?.value || '1';
        updates[targetOrderKey] = draggedOrderSetting?.value || '1';
        
        await handleBulkUpdate('navigation', updates);
        toast.success('Navigation order updated successfully');
      }
    } catch (error) {
      console.error('Error updating navigation order:', error);
      toast.error('Failed to update navigation order');
    }

    setDraggedItem(null);
  };

  const getInputType = (setting: Setting) => {
    if (setting.key.includes('duration') || setting.key.includes('timeout') || setting.key.includes('threshold') || setting.key.includes('age') || setting.key.includes('size') || setting.key.includes('count')) {
      return 'number';
    }
    if (setting.key.includes('email') || setting.key.includes('url')) {
      return 'email';
    }
    if (setting.key.includes('password')) {
      return 'password';
    }
    return 'text';
  };

  const validateSetting = (key: string, value: string) => {
    // Number validation
    if (key.includes('duration') || key.includes('timeout') || key.includes('threshold') || key.includes('age') || key.includes('size') || key.includes('count')) {
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        return 'Value must be a positive number';
      }
    }
    
    // Email validation
    if (key.includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }
    
    // URL validation
    if (key.includes('url')) {
      try {
        new URL(value);
      } catch {
        return 'Please enter a valid URL';
      }
    }
    
    return null;
  };

  const renderSettingInput = (setting: Setting) => {
    if (editingSetting === setting.key) {
      const inputType = getInputType(setting);
      const validationError = validateSetting(setting.key, editValue);
      
      return (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type={inputType}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={`flex-1 px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? 'border-red-300' : 'border-gray-300'
              }`}
              autoFocus
              min={inputType === 'number' ? '0' : undefined}
            />
            <button
              onClick={() => handleSaveSetting(setting.key)}
              disabled={isLoading || !!validationError}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
          {validationError && (
            <p className="text-xs text-red-600">{validationError}</p>
          )}
        </div>
      );
    }

    // Boolean settings
    if (setting.value === 'true' || setting.value === 'false') {
      return (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggleSetting(setting)}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              setting.value === 'true' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                setting.value === 'true' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-600">
            {setting.value === 'true' ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      );
    }

    // Text/number settings
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-900 font-medium">{setting.value}</span>
        <button
          onClick={() => handleEditSetting(setting)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Edit
        </button>
      </div>
    );
  };

  const renderSettingsCategory = (category: string) => {
    const categorySettings = settingsByCategory[category] || [];
    
    // Special handling for General category to include maintenance mode
    if (category === 'general') {
      const maintenanceSettings = [
        {
          id: 'maintenance_mode',
          key: 'maintenance_mode',
          value: categorySettings.find(s => s.key === 'maintenance_mode')?.value || 'false',
          description: 'Enable maintenance mode to disable site access for non-admin users',
          category: 'general',
          isPublic: false
        },
        {
          id: 'site_name',
          key: 'site_name',
          value: categorySettings.find(s => s.key === 'site_name')?.value || 'LoveConnect',
          description: 'Site name displayed on maintenance page and throughout the application',
          category: 'general',
          isPublic: true
        },
        {
          id: 'site_description',
          key: 'site_description',
          value: categorySettings.find(s => s.key === 'site_description')?.value || 'We are currently performing maintenance. Please check back soon.',
          description: 'Description text shown on the maintenance page',
          category: 'general',
          isPublic: true
        }
      ];

      return (
        <div className="space-y-6">
          {/* Maintenance Mode Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Mode</h3>
            <div className="space-y-4">
              {maintenanceSettings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {setting.key.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {setting.description}
                    </p>
                  </div>
                  <div className="ml-4">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Other General Settings */}
          {categorySettings.filter(s => !['maintenance_mode', 'site_name', 'site_description'].includes(s.key) && !s.key.startsWith('nav_')).map((setting) => (
            <div key={setting.key} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {setting.key.replace(/_/g, ' ')}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {setting.description}
                  </p>
                </div>
                <div className="ml-4">
                  {renderSettingInput(setting)}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (categorySettings.length === 0) return null;

    return (
      <div className="space-y-6">
        {categorySettings.map((setting) => (
          <div key={setting.key} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 capitalize">
                  {setting.key.replace(/_/g, ' ')}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {setting.description}
                </p>
              </div>
              <div className="ml-4">
                {renderSettingInput(setting)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNavigationSettings = () => {
    const navSettings = settingsByCategory['navigation'] || [];
    const navItems = [
      { key: 'nav_home_visible', name: 'Home', description: 'Show Home link in navigation', icon: '🏠' },
      { key: 'nav_discover_visible', name: 'Discover', description: 'Show Discover link in navigation', icon: '🔍' },
      { key: 'nav_matches_visible', name: 'Matches', description: 'Show Matches link in navigation', icon: '💕' },
      { key: 'nav_messages_visible', name: 'Messages', description: 'Show Messages link in navigation', icon: '💬' },
      { key: 'nav_members_visible', name: 'Members', description: 'Show Members link in navigation', icon: '👥' },
      { key: 'nav_favorites_visible', name: 'Favorites', description: 'Show Favorites link in navigation', icon: '⭐' },
      { key: 'nav_questions_visible', name: 'Questions', description: 'Show Questions link in navigation', icon: '❓' },
      { key: 'nav_reports_visible', name: 'Reports', description: 'Show Reports link in navigation', icon: '📋' },
      { key: 'nav_match_requests_visible', name: 'Match Requests', description: 'Show Match Requests link in navigation', icon: '🤝' },
      { key: 'nav_dashboard_visible', name: 'Dashboard', description: 'Show Dashboard link in navigation', icon: '📊' },
      { key: 'nav_settings_visible', name: 'Settings', description: 'Show Settings link in navigation', icon: '⚙️' }
    ];

    // Debug: Log the navigation settings
    console.log('Navigation settings:', navSettings);
    console.log('Settings by category:', settingsByCategory);

    // Get or create settings for each nav item
    const getOrCreateSetting = (key: string, defaultValue: string) => {
      const existing = navSettings.find(s => s.key === key);
      if (existing) {
        return existing;
      }
      // Return a default setting object if not found
      return {
        id: key,
        key: key,
        value: defaultValue,
        description: `Setting for ${key}`,
        category: 'navigation',
        isPublic: false
      };
    };

    // Sort nav items by their order settings with proper default values
    const sortedNavItems = navItems.sort((a, b) => {
      const aOrderKey = `${a.key.replace('_visible', '')}_order`;
      const bOrderKey = `${b.key.replace('_visible', '')}_order`;
      
      // Get default order based on item index
      const aDefaultOrder = navItems.indexOf(a) + 1;
      const bDefaultOrder = navItems.indexOf(b) + 1;
      
      const aOrderSetting = getOrCreateSetting(aOrderKey, aDefaultOrder.toString());
      const bOrderSetting = getOrCreateSetting(bOrderKey, bDefaultOrder.toString());
      
      const aOrder = parseInt(aOrderSetting.value);
      const bOrder = parseInt(bOrderSetting.value);
      return aOrder - bOrder;
    });

    return (
      <div className="space-y-6">
        {/* Navigation Order */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Navigation Order</h3>
            <div className="flex items-center text-sm text-gray-500">
              <ArrowsUpDownIcon className="w-4 h-4 mr-1" />
              Drag to reorder
            </div>
          </div>
          <div className="space-y-2">
            {sortedNavItems.map((item, index) => {
              const setting = getOrCreateSetting(item.key, 'true');
              const orderSetting = getOrCreateSetting(`${item.key.replace('_visible', '')}_order`, (index + 1).toString());
              
              return (
                <div
                  key={item.key}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.key)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.key)}
                  className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-move transition-all hover:shadow-md ${
                    draggedItem === item.key ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">{item.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500">
                      Order: {orderSetting.value}
                    </div>
                    <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Visibility */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Navigation Visibility</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedNavItems.map((item, index) => {
              const setting = getOrCreateSetting(item.key, 'true');
              
              return (
                <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">{item.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSetting(setting)}
                    disabled={isLoading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      setting.value === 'true' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        setting.value === 'true' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderReportsSettings = () => {
    const reportSettings = settingsByCategory['reports'] || [];
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Automatic Ban Management</h3>
          <div className="space-y-4">
            {reportSettings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 capitalize">
                    {setting.key.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
                <div className="ml-4">
                  {renderSettingInput(setting)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };


  const renderTabContent = () => {
    // If searching, show all matching settings regardless of tab
    if (searchQuery) {
      if (filteredSettings.length === 0) {
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No settings found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        );
      }
      
      return (
        <div className="space-y-6">
          {Object.entries(settingsByCategory).map(([category, settings]) => (
            <div key={category}>
              <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                {category} Settings
              </h3>
              {renderSettingsCategory(category)}
            </div>
          ))}
        </div>
      );
    }

    // Normal tab-based rendering
    switch (activeTab) {
      case 'navigation':
        return renderNavigationSettings();
      case 'reports':
        return renderReportsSettings();
      default:
        return renderSettingsCategory(activeTab);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Configure and manage all system settings and features
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search settings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {filteredSettings.length} of {settingsState.length} settings
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                const updates: Record<string, string> = {};
                settingsByCategory['navigation']?.forEach(setting => {
                  updates[setting.key] = 'true';
                });
                handleBulkUpdate('navigation', updates);
              }}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Bars3Icon className="w-4 h-4 mr-2" />
              Enable All Navigation
            </button>
            <button
              onClick={() => {
                const updates: Record<string, string> = {};
                settingsByCategory['reports']?.forEach(setting => {
                  if (setting.key === 'auto_ban_enabled') {
                    updates[setting.key] = 'true';
                  }
                });
                handleBulkUpdate('reports', updates);
              }}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              Enable Auto Ban
            </button>
            <button
              onClick={() => {
                const updates: Record<string, string> = {};
                settingsByCategory['announcements']?.forEach(setting => {
                  if (setting.key === 'announcements_enabled') {
                    updates[setting.key] = 'true';
                  }
                });
                handleBulkUpdate('announcements', updates);
              }}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <MegaphoneIcon className="w-4 h-4 mr-2" />
              Enable Announcements
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = activeTab === tab.id ? tab.iconSolid : tab.icon;
                const hasSettings = settingsByCategory[tab.id] && settingsByCategory[tab.id].length > 0;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {tab.name}
                    {hasSettings && (
                      <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {settingsByCategory[tab.id].length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 capitalize">
                  {activeTab} Settings
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Configure {activeTab} related settings and preferences
                </p>
              </div>
              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

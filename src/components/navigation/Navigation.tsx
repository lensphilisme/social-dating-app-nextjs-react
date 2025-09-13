'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  HandRaisedIcon,
  ChartBarIcon,
  StarIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  HeartIcon as HeartIconSolid, 
  ChatBubbleLeftRightIcon as ChatIconSolid, 
  UserGroupIcon as UserGroupIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  HandRaisedIcon as HandRaisedIconSolid,
  StarIcon as StarIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  DocumentTextIcon as DocumentTextIconSolid
} from '@heroicons/react/24/solid';
import { useSession, signOut } from 'next-auth/react';
import NotificationPopup from '../NotificationPopup';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  iconSolid: any;
  badge?: number;
  isMain?: boolean;
  key?: string;
}

interface NotificationCounts {
  matches: number;
  messages: number;
  favorites: number;
  matchRequests: number;
}

export default function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({
    matches: 0,
    messages: 0,
    favorites: 0,
    matchRequests: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const { data: session } = useSession();

  // All navigation items
  const [navSettings, setNavSettings] = useState<any>({});

  // Fetch navigation settings
  useEffect(() => {
    const fetchNavSettings = async () => {
      try {
        const response = await fetch('/api/navigation/settings');
        if (response.ok) {
          const settings = await response.json();
          setNavSettings(settings);
        }
      } catch (error) {
        console.error('Error fetching navigation settings:', error);
      }
    };

    fetchNavSettings();

    // Listen for navigation settings updates
    const handleNavUpdate = () => {
      fetchNavSettings();
    };

    window.addEventListener('navigationSettingsUpdated', handleNavUpdate);
    return () => window.removeEventListener('navigationSettingsUpdated', handleNavUpdate);
  }, []);

  const allNavItems: NavItem[] = [
    { name: 'Home', href: '/', icon: HomeIcon, iconSolid: HomeIconSolid, isMain: true, key: 'nav_home_visible' },
    { name: 'Discover', href: '/discover', icon: MagnifyingGlassIcon, iconSolid: MagnifyingGlassIconSolid, isMain: true, key: 'nav_discover_visible' },
    { name: 'Matches', href: '/matches', icon: HeartIcon, iconSolid: HeartIconSolid, badge: notificationCounts.matches, isMain: true, key: 'nav_matches_visible' },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, iconSolid: ChatIconSolid, badge: notificationCounts.messages, isMain: true, key: 'nav_messages_visible' },
    { name: 'Members', href: '/members', icon: UserGroupIcon, iconSolid: UserGroupIconSolid, isMain: false, key: 'nav_members_visible' },
    { name: 'Favorites', href: '/favorites', icon: StarIcon, iconSolid: StarIconSolid, badge: notificationCounts.favorites, isMain: false, key: 'nav_favorites_visible' },
    { name: 'Match Requests', href: '/match-requests', icon: HandRaisedIcon, iconSolid: HandRaisedIconSolid, badge: notificationCounts.matchRequests, isMain: false, key: 'nav_match_requests_visible' },
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon, iconSolid: ChartBarIconSolid, isMain: false, key: 'nav_dashboard_visible' },
    { name: 'Questions', href: '/questions', icon: QuestionMarkCircleIcon, iconSolid: QuestionMarkCircleIconSolid, isMain: false, key: 'nav_questions_visible' },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid, isMain: false, key: 'nav_settings_visible' },
    { name: 'My Reports', href: '/reports', icon: DocumentTextIcon, iconSolid: DocumentTextIconSolid, isMain: false, key: 'nav_reports_visible' },
  ];

  // Filter and sort navigation items based on settings
  const filteredNavItems = allNavItems
    .filter(item => {
      const isVisible = item.key ? navSettings[item.key] !== 'false' : true;
      return isVisible;
    })
    .sort((a, b) => {
      if (!a.key || !b.key) return 0;
      const aOrderKey = `${a.key.replace('_visible', '')}_order`;
      const bOrderKey = `${b.key.replace('_visible', '')}_order`;
      const aOrder = parseInt(navSettings[aOrderKey] || '1');
      const bOrder = parseInt(navSettings[bOrderKey] || '1');
      return aOrder - bOrder;
    });

  const mainNavItems = filteredNavItems.filter(item => item.isMain);
  const additionalNavItems = filteredNavItems.filter(item => !item.isMain);

  // Save sidebar state to localStorage and dispatch events
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
    window.dispatchEvent(new CustomEvent('sidebarToggle'));
  }, [sidebarOpen]);

  // Fetch notification counts from database
  useEffect(() => {
    const fetchNotificationCounts = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/notifications/counts');
        if (response.ok) {
          const data = await response.json();
          setNotificationCounts(data);
        }
      } catch (error) {
        console.error('Failed to fetch notification counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificationCounts();
  }, [session?.user?.id]);

  // Check if user is admin
  const isAdmin = session?.user?.role === 'ADMIN';

  // Hide user navigation for admin users (they use AdminNavigation)
  if (isAdmin) {
    return null;
  }

  const isActive = (href: string) => pathname === href;

  // For non-logged users, show only logo (no navbar buttons)
  if (!session) {
    return (
      <>
        {/* Top Navbar for Non-Logged Users - Logo Only */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-neutral-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <HeartIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl text-neutral-900 group-hover:text-pink-600 transition-colors">LoveConnect</span>
              </Link>
            </div>
          </div>
        </nav>
      </>
    );
  }

  // For logged-in users, show sidebar navigation
  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">LoveConnect</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pb-20">
            {/* Main Navigation */}
            <div className="p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Main</div>
              <nav className="space-y-1 pointer-events-auto">
              {mainNavItems.map((item) => {
                const Icon = isActive(item.href) ? item.iconSolid : item.icon;
                const hasNotification = item.badge && item.badge > 0;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                          ? 'bg-pink-100 text-pink-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 ${
                          isActive(item.href) ? 'text-pink-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                      {hasNotification && (
                        <span className="ml-auto w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
                    )}
                  </Link>
                );
              })}
              </nav>
            </div>

            {/* Additional Navigation */}
            <div className="p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">More</div>
              <nav className="space-y-1 pointer-events-auto">
            {additionalNavItems.map((item) => {
              const Icon = isActive(item.href) ? item.iconSolid : item.icon;
              const hasNotification = item.badge && item.badge > 0;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                          ? 'bg-pink-100 text-pink-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 ${
                          isActive(item.href) ? 'text-pink-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                      {hasNotification && (
                        <span className="ml-auto w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
          </div>

          {/* User info and logout */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
                </div>

              <button
              onClick={() => {
                signOut({ callbackUrl: '/auth/signin' });
                setSidebarOpen(false);
              }}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Logout
              </button>
            </div>
          </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-30 pointer-events-auto ${
        sidebarOpen ? 'lg:w-80' : 'lg:w-16'
      }`}>
        {/* Logo */}
        <div className="flex h-16 items-center px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <HeartIcon className="w-5 h-5 text-white" />
                      </div>
            {sidebarOpen && <h1 className="text-xl font-bold text-gray-900">LoveConnect</h1>}
          </div>
                  </div>

        <div className="flex-1 overflow-y-auto relative">
          {/* Main Navigation */}
          <div className="p-4">
            {sidebarOpen && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Main</div>}
            <nav className="space-y-1 pointer-events-auto">
              {mainNavItems.map((item) => {
                      const Icon = isActive(item.href) ? item.iconSolid : item.icon;
                      const hasNotification = item.badge && item.badge > 0;
                      return (
                  <Link
                          key={item.name}
                            href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActive(item.href)
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive(item.href) ? 'text-pink-500' : 'text-gray-400 group-hover:text-gray-500'
                      } ${sidebarOpen ? 'mr-3' : 'mx-auto'}`}
                    />
                    {sidebarOpen && (
                      <>
                        {item.name}
                        {hasNotification && (
                          <span className="ml-auto w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
                        )}
                      </>
                            )}
                          </Link>
                      );
                    })}
                  </nav>
          </div>

          {/* Additional Navigation */}
          <div className="p-4">
            {sidebarOpen && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">More</div>}
            <nav className="space-y-1 pointer-events-auto">
              {additionalNavItems.map((item) => {
                      const Icon = isActive(item.href) ? item.iconSolid : item.icon;
                      const hasNotification = item.badge && item.badge > 0;
                      return (
                  <Link
                          key={item.name}
                            href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActive(item.href)
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive(item.href) ? 'text-pink-500' : 'text-gray-400 group-hover:text-gray-500'
                      } ${sidebarOpen ? 'mr-3' : 'mx-auto'}`}
                    />
                    {sidebarOpen && (
                      <>
                        {item.name}
                        {hasNotification && (
                          <span className="ml-auto w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
                        )}
                      </>
                            )}
                          </Link>
                      );
                    })}
                  </nav>
                    </div>
                  </div>

        {/* User info and logout */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
                </div>
          )}
      </div>

          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <ArrowRightOnRectangleIcon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''}`} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg shadow-lg"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
                </div>
                
      {/* Desktop hamburger menu button */}
      <div className="hidden lg:block fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg shadow-lg"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        </div>
        
      {/* Notification icon - top right for all screen sizes */}
      <div className="fixed top-4 right-4 z-50">
        <NotificationPopup />
      </div>
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import NotificationPopup from '../NotificationPopup';
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  SwatchIcon,
  CogIcon,
  BellIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  HandRaisedIcon,
  StarIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  MegaphoneIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  HeartIcon as HeartIconSolid,
  ChatBubbleLeftRightIcon as ChatIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  HandRaisedIcon as HandRaisedIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  StarIcon as StarIconSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/react/24/solid';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  iconSolid: any;
  badge?: number;
  isAdmin?: boolean;
}

interface NotificationCounts {
  matches: number;
  messages: number;
  favorites: number;
  matchRequests: number;
}

export default function AdminNavigation() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({
    matches: 0,
    messages: 0,
    favorites: 0,
    matchRequests: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Initialize sidebar state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sidebarOpen');
    if (stored !== null) {
      setSidebarOpen(JSON.parse(stored));
    }
  }, []);

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
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // User navigation items
  const userNavItems: NavItem[] = [
    { name: 'Home', href: '/', icon: HomeIcon, iconSolid: HomeIconSolid, isAdmin: false },
    { name: 'Discover', href: '/discover', icon: MagnifyingGlassIcon, iconSolid: MagnifyingGlassIconSolid, isAdmin: false },
    { name: 'Matches', href: '/matches', icon: HeartIcon, iconSolid: HeartIconSolid, badge: notificationCounts.matches, isAdmin: false },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, iconSolid: ChatIconSolid, badge: notificationCounts.messages, isAdmin: false },
    { name: 'Members', href: '/members', icon: UserGroupIcon, iconSolid: UserGroupIconSolid, isAdmin: false },
    { name: 'Favorites', href: '/favorites', icon: StarIcon, iconSolid: StarIconSolid, badge: notificationCounts.favorites, isAdmin: false },
    { name: 'Match Requests', href: '/match-requests', icon: HandRaisedIcon, iconSolid: HandRaisedIconSolid, badge: notificationCounts.matchRequests, isAdmin: false },
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon, iconSolid: ChartBarIconSolid, isAdmin: false },
    { name: 'Questions', href: '/questions', icon: QuestionMarkCircleIcon, iconSolid: QuestionMarkCircleIconSolid, isAdmin: false },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid, isAdmin: false },
    { name: 'Support', href: '/support', icon: BellIcon, iconSolid: BellIcon, isAdmin: false },
    { name: 'My Reports', href: '/reports', icon: DocumentTextIcon, iconSolid: DocumentTextIcon, isAdmin: false },
  ];

  // Admin navigation items
  const adminNavItems: NavItem[] = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid, isAdmin: true },
    { name: 'User Management', href: '/admin/users', icon: UsersIcon, iconSolid: UsersIcon, isAdmin: true },
    { name: 'Moderation', href: '/admin/moderation', icon: ShieldCheckIcon, iconSolid: ShieldCheckIcon, isAdmin: true },
    { name: 'Reports', href: '/admin/reports', icon: DocumentTextIcon, iconSolid: DocumentTextIcon, isAdmin: true },
    { name: 'Announcements', href: '/admin/announcements', icon: MegaphoneIcon, iconSolid: MegaphoneIcon, isAdmin: true },
    { name: 'Themes', href: '/admin/themes', icon: SwatchIcon, iconSolid: SwatchIcon, isAdmin: true },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, iconSolid: ChartBarIcon, isAdmin: true },
    { name: 'System Settings', href: '/admin/settings', icon: CogIcon, iconSolid: CogIcon, isAdmin: true },
    { name: 'Logs', href: '/admin/logs', icon: EyeIcon, iconSolid: EyeIcon, isAdmin: true },
  ];

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/auth/signin' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (href: string) => pathname === href;

  // Check if user is admin - moved after all hooks
  const isAdmin = session?.user?.role === 'ADMIN';
  
  // Hide admin navigation when user is not admin
  if (!isAdmin) {
    return null;
  }

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
            {/* User Navigation */}
            <div className="p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">User Features</div>
              <nav className="space-y-1 pointer-events-auto">
                {userNavItems.map((item) => {
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

            {/* Admin Navigation */}
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Admin Panel</div>
              <nav className="space-y-1 pointer-events-auto">
                {adminNavItems.map((item) => {
                  const Icon = isActive(item.href) ? item.iconSolid : item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 ${
                          isActive(item.href) ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
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
                  {session?.user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
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
          {/* User Navigation */}
          <div className="p-4">
            {sidebarOpen && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">User Features</div>}
            <nav className="space-y-1 pointer-events-auto">
              {userNavItems.map((item) => {
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

          {/* Admin Navigation */}
          <div className="p-4 border-t border-gray-200">
            {sidebarOpen && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Admin Panel</div>}
            <nav className="space-y-1 pointer-events-auto">
              {adminNavItems.map((item) => {
                const Icon = isActive(item.href) ? item.iconSolid : item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive(item.href) ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'
                      } ${sidebarOpen ? 'mr-3' : 'mx-auto'}`}
                    />
                    {sidebarOpen && item.name}
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
                  {session?.user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
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
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
  Cog6ToothIcon
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
import { useSession } from 'next-auth/react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  iconSolid: any;
  badge?: number;
  isMain?: boolean;
}

interface NotificationCounts {
  matches: number;
  messages: number;
  favorites: number;
  matchRequests: number;
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({
    matches: 0,
    messages: 0,
    favorites: 0,
    matchRequests: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const { data: session } = useSession();

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

  // All navigation items
  const allNavItems: NavItem[] = [
    { name: 'Home', href: '/', icon: HomeIcon, iconSolid: HomeIconSolid, isMain: true },
    { name: 'Discover', href: '/discover', icon: MagnifyingGlassIcon, iconSolid: MagnifyingGlassIconSolid, isMain: true },
    { name: 'Matches', href: '/matches', icon: HeartIcon, iconSolid: HeartIconSolid, badge: notificationCounts.matches, isMain: true },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, iconSolid: ChatIconSolid, badge: notificationCounts.messages, isMain: true },
    { name: 'Members', href: '/members', icon: UserGroupIcon, iconSolid: UserGroupIconSolid, isMain: false },
    { name: 'Favorites', href: '/favorites', icon: StarIcon, iconSolid: StarIconSolid, badge: notificationCounts.favorites, isMain: false },
    { name: 'Match Requests', href: '/match-requests', icon: HandRaisedIcon, iconSolid: HandRaisedIconSolid, badge: notificationCounts.matchRequests, isMain: false },
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon, iconSolid: ChartBarIconSolid, isMain: false },
    { name: 'Questions', href: '/questions', icon: QuestionMarkCircleIcon, iconSolid: QuestionMarkCircleIconSolid, isMain: false },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid, isMain: false },
  ];

  const mainNavItems = allNavItems.filter(item => item.isMain);
  const additionalNavItems = allNavItems.filter(item => !item.isMain);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  // For non-logged users, show only logo (no navbar buttons)
  if (!session) {
    return (
      <>
        {/* Top Navbar for Non-Logged Users - Logo Only */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-neutral-200/50' 
            : 'bg-transparent'
        }`}>
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

  // For logged-in users, show full navigation
  return (
    <>
      {/* Desktop Top Navigation */}
      <nav className={`hidden lg:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-neutral-200/50' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-neutral-900 group-hover:text-pink-600 transition-colors">LoveConnect</span>
            </Link>

            {/* Main Navigation Links */}
            <div className="flex items-center space-x-1">
              {mainNavItems.map((item) => {
                const Icon = isActive(item.href) ? item.iconSolid : item.icon;
                const hasNotification = item.badge && item.badge > 0;
                const isDotItem = item.name === 'Matches' || item.name === 'Messages';
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 group ${
                      isActive(item.href)
                        ? 'text-pink-600 bg-pink-50 shadow-sm'
                        : 'text-neutral-600 hover:text-pink-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${
                      isActive(item.href) ? 'scale-110' : 'group-hover:scale-105'
                    }`} />
                    <span className="font-medium">{item.name}</span>
                    
                    {/* Notification Indicator - Only dots for Matches and Messages when there are new notifications */}
                    {!isLoading && hasNotification && isDotItem && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm animate-pulse"></span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <Link
                href="/notifications"
                className="relative p-2 text-neutral-600 hover:text-pink-600 hover:bg-neutral-50 rounded-xl transition-all duration-200"
              >
                <BellIcon className="w-5 h-5" />
                {!isLoading && notificationCounts.matches + notificationCounts.messages + notificationCounts.matchRequests > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
                )}
              </Link>
              
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-pink-600 hover:bg-neutral-50 rounded-xl transition-all duration-200"
              >
                <UserIcon className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar for Large Screens */}
      <aside className="hidden xl:block fixed left-0 top-16 bottom-0 w-72 bg-white/95 backdrop-blur-md border-r border-neutral-200/50 shadow-lg z-40">
        <div className="p-6">
          <nav className="space-y-2">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">More Features</div>
            {additionalNavItems.map((item) => {
              const Icon = isActive(item.href) ? item.iconSolid : item.icon;
              const hasNotification = item.badge && item.badge > 0;
              const isFavorites = item.name === 'Favorites';
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive(item.href)
                      ? 'text-pink-600 bg-pink-50 border border-pink-200 shadow-sm'
                      : 'text-neutral-600 hover:text-pink-600 hover:bg-neutral-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${
                    isActive(item.href) ? 'scale-110' : 'group-hover:scale-105'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                  
                  {/* Notification Indicator - Numbers only for Favorites when there are items */}
                  {!isLoading && hasNotification && isFavorites && (
                    <span className="ml-auto w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs flex items-center justify-center font-bold shadow-sm rounded-full">
                      {item.badge}
                    </span>
                  )}
                  
                  {/* Dot for other items when there are new notifications */}
                  {!isLoading && hasNotification && !isFavorites && (
                    <span className="ml-auto w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm animate-pulse"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Hamburger Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <nav className={`transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-neutral-200/50' 
            : 'bg-transparent'
        }`}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <HeartIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl text-neutral-900 group-hover:text-pink-600 transition-colors">LoveConnect</span>
              </Link>

              {/* Hamburger Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-neutral-600 hover:text-pink-600 hover:bg-neutral-50 rounded-xl transition-all duration-200"
              >
                {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Menu Panel */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50"
              >
                <div className="p-6">
                  {/* Menu Header */}
                  <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <HeartIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-display font-bold text-xl text-neutral-900">LoveConnect</span>
                    </Link>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-neutral-600 hover:text-pink-600 hover:bg-neutral-50 rounded-xl transition-all duration-200"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Main Navigation Links */}
                  <nav className="space-y-2">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Main</div>
                    {mainNavItems.map((item, index) => {
                      const Icon = isActive(item.href) ? item.iconSolid : item.icon;
                      const hasNotification = item.badge && item.badge > 0;
                      const isDotItem = item.name === 'Matches' || item.name === 'Messages';
                      
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                              isActive(item.href)
                                ? 'text-pink-600 bg-pink-50 border border-pink-200 shadow-sm'
                                : 'text-neutral-600 hover:text-pink-600 hover:bg-neutral-50'
                            }`}
                          >
                            <Icon className={`w-5 h-5 transition-transform duration-200 ${
                              isActive(item.href) ? 'scale-110' : 'group-hover:scale-105'
                            }`} />
                            <span className="font-medium">{item.name}</span>
                            
                            {/* Notification Indicator - Only dots for Matches and Messages when there are new notifications */}
                            {!isLoading && hasNotification && isDotItem && (
                              <span className="ml-auto w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm animate-pulse"></span>
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>

                  {/* Additional Navigation Links */}
                  <nav className="space-y-2 mt-6">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">More</div>
                    {additionalNavItems.map((item, index) => {
                      const Icon = isActive(item.href) ? item.iconSolid : item.icon;
                      const hasNotification = item.badge && item.badge > 0;
                      const isFavorites = item.name === 'Favorites';
                      
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index + mainNavItems.length) * 0.1 }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                              isActive(item.href)
                                ? 'text-pink-600 bg-pink-50 border border-pink-200 shadow-sm'
                                : 'text-neutral-600 hover:text-pink-600 hover:bg-neutral-50'
                            }`}
                          >
                            <Icon className={`w-5 h-5 transition-transform duration-200 ${
                              isActive(item.href) ? 'scale-110' : 'group-hover:scale-105'
                            }`} />
                            <span className="font-medium">{item.name}</span>
                            
                            {/* Notification Indicator - Numbers only for Favorites when there are items */}
                            {!isLoading && hasNotification && isFavorites && (
                              <span className="ml-auto w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs flex items-center justify-center font-bold shadow-sm rounded-full">
                                {item.badge}
                              </span>
                            )}
                            
                            {/* Dot for other items when there are new notifications */}
                            {!isLoading && hasNotification && !isFavorites && (
                              <span className="ml-auto w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm animate-pulse"></span>
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>

                  {/* Additional Links */}
                  <div className="mt-8 pt-6 border-t border-neutral-200">
                    <div className="space-y-2">
                      <Link
                        href="/notifications"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-neutral-600 hover:text-pink-600 hover:bg-neutral-50 rounded-xl transition-all duration-200"
                      >
                        <BellIcon className="w-5 h-5" />
                        <span className="font-medium">Notifications</span>
                        {!isLoading && notificationCounts.matches + notificationCounts.messages + notificationCounts.matchRequests > 0 && (
                          <span className="ml-auto w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
                        )}
                      </Link>
                      
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-neutral-600 hover:text-pink-600 hover:bg-neutral-50 rounded-xl transition-all duration-200"
                      >
                        <UserIcon className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-t border-neutral-200/60 shadow-lg">
        <div className="flex items-center justify-around py-1">
          {mainNavItems.map((item) => {
            const Icon = isActive(item.href) ? item.iconSolid : item.icon;
            const hasNotification = item.badge && item.badge > 0;
            const isDotItem = item.name === 'Matches' || item.name === 'Messages';
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center justify-center px-2 py-2 rounded-xl transition-all duration-300 group ${
                  isActive(item.href)
                    ? 'text-pink-600 bg-pink-50/80 scale-105'
                    : 'text-neutral-600 hover:text-pink-600 hover:bg-neutral-50/50'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className={`w-6 h-6 transition-transform duration-300 ${
                    isActive(item.href) ? 'scale-110' : 'group-hover:scale-105'
                  }`} />
                  
                  {/* Notification Indicator - Only dots for Matches and Messages when there are new notifications */}
                  {!isLoading && hasNotification && isDotItem && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm animate-pulse"></span>
                  )}
                </div>
                
                <span className={`text-xs font-medium mt-1 transition-colors duration-300 ${
                  isActive(item.href) ? 'text-pink-600' : 'text-neutral-500 group-hover:text-pink-600'
                }`}>
                  {item.name}
                </span>
                
                {/* Active indicator */}
                {isActive(item.href) && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Bottom safe area for devices with home indicator */}
        <div className="h-1 bg-gradient-to-r from-transparent via-neutral-200/30 to-transparent"></div>
      </nav>

    </>
  );
}

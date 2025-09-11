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
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  Cog6ToothIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  HeartIcon as HeartIconSolid, 
  ChatBubbleLeftRightIcon as ChatIconSolid, 
  UserGroupIcon as UserGroupIconSolid
} from '@heroicons/react/24/solid';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  iconSolid: any;
  badge?: number;
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/', icon: HomeIcon, iconSolid: HomeIconSolid },
  { name: 'Discover', href: '/discover', icon: MagnifyingGlassIcon, iconSolid: MagnifyingGlassIcon },
  { name: 'Matches', href: '/matches', icon: HeartIcon, iconSolid: HeartIconSolid, badge: 3 },
  { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, iconSolid: ChatIconSolid, badge: 5 },
  { name: 'Members', href: '/members', icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
];

export default function ResponsiveNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-neutral-900">LoveConnect</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = isActive(item.href) ? item.iconSolid : item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors">
                <BellIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors">
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors">
                <UserIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <HeartIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-neutral-900">LoveConnect</span>
            </Link>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2">
              <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors">
                <BellIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors"
              >
                {isOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 lg:hidden"
            >
              <div className="p-6">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <HeartIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-display font-bold text-xl text-neutral-900">LoveConnect</span>
                  </Link>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="space-y-2">
                  {navigation.map((item, index) => {
                    const Icon = isActive(item.href) ? item.iconSolid : item.icon;
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
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            isActive(item.href)
                              ? 'text-primary-600 bg-primary-50 border border-primary-200'
                              : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto w-6 h-6 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Sidebar Footer */}
                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <div className="space-y-2">
                    <button className="flex items-center space-x-3 px-4 py-3 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-xl transition-colors w-full">
                      <Cog6ToothIcon className="w-5 h-5" />
                      <span className="font-medium">Settings</span>
                    </button>
                    <button className="flex items-center space-x-3 px-4 py-3 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-xl transition-colors w-full">
                      <UserIcon className="w-5 h-5" />
                      <span className="font-medium">Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-neutral-200/50">
        <div className="flex items-center justify-around py-2">
          {navigation.slice(0, 4).map((item) => {
            const Icon = isActive(item.href) ? item.iconSolid : item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-primary-600'
                    : 'text-neutral-600'
                }`}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16 lg:h-16" />
      <div className="lg:hidden h-16" />
    </>
  );
}

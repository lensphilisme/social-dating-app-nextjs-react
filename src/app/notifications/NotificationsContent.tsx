'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon, 
  FireIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, ChatBubbleLeftRightIcon as ChatIconSolid } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';

interface Notification {
  id: string;
  type: 'like' | 'match' | 'message' | 'match_request' | 'report' | 'admin_message' | 'profile_view';
  title: string;
  message: string;
  userId: string;
  timestamp: Date;
  read: boolean;
}

export default function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { notifications: realTimeNotifications, markAsRead, markAllAsRead } = useNotifications();

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    realTimeNotifications.forEach(notification => {
      if (!isVisible.has(notification.id)) {
        setIsVisible(prev => new Set([...prev, notification.id]));
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
          setIsVisible(prev => {
            const newSet = new Set(prev);
            newSet.delete(notification.id);
            return newSet;
          });
        }, 5000);
      }
    });

    setNotifications(realTimeNotifications);
  }, [realTimeNotifications, isVisible]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <HeartIconSolid className="w-6 h-6 text-pink-500" />;
      case 'match':
        return <FireIcon className="w-6 h-6 text-red-500" />;
      case 'message':
        return <ChatIconSolid className="w-6 h-6 text-blue-500" />;
      case 'match_request':
        return <FireIcon className="w-6 h-6 text-orange-500" />;
      case 'report':
        return <XMarkIcon className="w-6 h-6 text-red-600" />;
      case 'admin_message':
        return <BellIcon className="w-6 h-6 text-purple-500" />;
      case 'profile_view':
        return <BellIcon className="w-6 h-6 text-green-500" />;
      default:
        return <BellIcon className="w-6 h-6 text-neutral-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'bg-pink-50 border-pink-200';
      case 'match':
        return 'bg-red-50 border-red-200';
      case 'message':
        return 'bg-blue-50 border-blue-200';
      case 'match_request':
        return 'bg-orange-50 border-orange-200';
      case 'report':
        return 'bg-red-50 border-red-200';
      case 'admin_message':
        return 'bg-purple-50 border-purple-200';
      case 'profile_view':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-neutral-50 border-neutral-200';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'match':
        router.push('/matches');
        break;
      case 'message':
        router.push('/messages');
        break;
      case 'match_request':
        router.push('/matches');
        break;
      case 'profile_view':
        router.push('/dashboard');
        break;
      default:
        break;
    }
  };

  const handleDismiss = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setIsVisible(prev => {
      const newSet = new Set(prev);
      newSet.delete(notificationId);
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-neutral-600" />
          </button>
          <h1 className="text-lg font-semibold text-neutral-900">Notifications</h1>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
              <BellIcon className="w-12 h-12 text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">No notifications yet</h2>
            <p className="text-neutral-600 text-center max-w-sm">
              When you get likes, matches, or messages, they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`relative p-4 rounded-2xl border ${getNotificationColor(notification.type)} ${
                    !notification.read ? 'ring-2 ring-primary-200' : ''
                  }`}
                >
                  <div 
                    className="flex items-start space-x-3 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-neutral-700 text-sm leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-xs text-neutral-500 mt-2">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                  
                  {/* Dismiss Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(notification.id);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-neutral-200 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 text-neutral-500" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom Spacing */}
      <div className="h-20"></div>
    </div>
  );
}

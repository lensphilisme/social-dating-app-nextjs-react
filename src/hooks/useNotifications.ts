'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { subscribeToNotifications, unsubscribeFromNotifications } from '@/lib/pusher';

interface Notification {
  id: string;
  type: 'like' | 'match' | 'message' | 'match_request';
  title: string;
  message: string;
  userId: string;
  timestamp: Date;
  read: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = subscribeToNotifications(session.user.id, (data: any) => {
      const notification: Notification = {
        id: data.id,
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId,
        timestamp: new Date(data.timestamp),
        read: false,
      };

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      unsubscribeFromNotifications(channel);
    };
  }, [session?.user?.id]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};

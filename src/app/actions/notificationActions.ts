'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions';

export interface NotificationData {
  id: string;
  type: 'like' | 'message' | 'match_request' | 'match_accepted' | 'report' | 'favorite';
  title: string;
  message: string;
  userId: string;
  relatedUserId?: string;
  relatedId?: string; // ID of the related entity (match request, message, etc.)
  isRead: boolean;
  createdAt: Date;
}

export async function createNotification(
  userId: string,
  type: 'like' | 'message' | 'match_request' | 'match_accepted' | 'report' | 'favorite',
  title: string,
  message: string,
  relatedUserId?: string,
  relatedId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedUserId,
        relatedId,
        isRead: false,
      }
    });

    return { success: true, message: 'Notification created' };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, message: 'Failed to create notification' };
  }
}

export async function getNotifications(): Promise<NotificationData[]> {
  try {
    const userId = await getAuthUserId();
    
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 notifications
    });

    return notifications.map(notification => ({
      id: notification.id,
      type: notification.type as any,
      title: notification.title,
      message: notification.message,
      userId: notification.userId,
      relatedUserId: notification.relatedUserId || undefined,
      relatedId: notification.relatedId || undefined,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationsAsRead(): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getAuthUserId();
    
    await prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false 
      },
      data: { isRead: true }
    });

    return { success: true, message: 'Notifications marked as read' };
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return { success: false, message: 'Failed to mark notifications as read' };
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const userId = await getAuthUserId();
    
    const count = await prisma.notification.count({
      where: { 
        userId,
        isRead: false 
      }
    });

    return count;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

export async function deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getAuthUserId();
    
    await prisma.notification.delete({
      where: { 
        id: notificationId,
        userId // Ensure user can only delete their own notifications
      }
    });

    return { success: true, message: 'Notification deleted' };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, message: 'Failed to delete notification' };
  }
}

// Helper functions for specific notification types
export async function notifyLike(fromUserId: string, toUserId: string, memberName: string): Promise<void> {
  await createNotification(
    toUserId,
    'like',
    'New Like! 💖',
    `${memberName} liked your profile`,
    fromUserId
  );
}

export async function notifyMessage(fromUserId: string, toUserId: string, memberName: string): Promise<void> {
  await createNotification(
    toUserId,
    'message',
    'New Message 💬',
    `You have a new message from ${memberName}`,
    fromUserId
  );
}

export async function notifyMatchRequest(fromUserId: string, toUserId: string, memberName: string, requestId: string): Promise<void> {
  await createNotification(
    toUserId,
    'match_request',
    'New Match Request! 💌',
    `${memberName} sent you a match request`,
    fromUserId,
    requestId
  );
}

export async function notifyMatchAccepted(fromUserId: string, toUserId: string, memberName: string): Promise<void> {
  await createNotification(
    toUserId,
    'match_accepted',
    'Match Accepted! 🎉',
    `${memberName} accepted your match request`,
    fromUserId
  );
}

export async function notifyReport(fromUserId: string, toUserId: string, memberName: string, reportId: string): Promise<void> {
  await createNotification(
    toUserId,
    'report',
    'New Report 📋',
    `You have been reported by ${memberName}`,
    fromUserId,
    reportId
  );
}

export async function notifyFavorite(fromUserId: string, toUserId: string, memberName: string): Promise<void> {
  await createNotification(
    toUserId,
    'favorite',
    'Added to Favorites! ⭐',
    `${memberName} added you to their favorites`,
    fromUserId
  );
}


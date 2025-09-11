import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

declare global {
  var pusherServerInstance: PusherServer | undefined;
  var pusherClientInstance: PusherClient | undefined;
}

if (!global.pusherServerInstance) {
  global.pusherServerInstance = new PusherServer({
    appId: process.env.PUSHER_APP_ID || '123456',
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'your-pusher-key',
    secret: process.env.PUSHER_SECRET || 'your-pusher-secret',
    cluster: 'us2',
    useTLS: true,
  });
}

if (!global.pusherClientInstance) {
  global.pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'your-pusher-key', {
    channelAuthorization: {
      endpoint: '/api/pusher/auth',
      transport: 'ajax',
    },
    cluster: 'us2',
  });
}

export const pusherServer = global.pusherServerInstance;
export const pusherClient = global.pusherClientInstance;

// Client-side functions for notifications
export const subscribeToNotifications = (userId: string, callback: (data: any) => void) => {
  if (typeof window === 'undefined') return null;
  
  const pusherInstance = pusherClient;
  if (!pusherInstance) return null;
  
  const channel = pusherInstance.subscribe(`private-notifications-${userId}`);
  channel.bind('notification', callback);
  
  return channel;
};

export const unsubscribeFromNotifications = (channel: any) => {
  if (channel) {
    channel.unbind_all();
    channel.unsubscribe();
  }
};

// Server-side notification functions
export const sendNotification = async (userId: string, notification: {
  type: 'like' | 'match' | 'message' | 'match_request' | 'report' | 'admin_message' | 'profile_view';
  title: string;
  message: string;
  data?: any;
}) => {
  try {
    await pusherServer.trigger(`private-notifications-${userId}`, 'notification', {
      id: Date.now().toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      userId: userId,
      timestamp: new Date().toISOString(),
      data: notification.data,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Specific notification functions
export const sendLikeNotification = async (targetUserId: string, likerName: string) => {
  await sendNotification(targetUserId, {
    type: 'like',
    title: 'New Like! 💖',
    message: `${likerName} liked your profile`,
  });
};

export const sendMatchNotification = async (userId: string, matchName: string) => {
  await sendNotification(userId, {
    type: 'match',
    title: 'It\'s a Match! 🎉',
    message: `You and ${matchName} liked each other!`,
  });
};

export const sendMessageNotification = async (recipientId: string, senderName: string, messagePreview: string) => {
  await sendNotification(recipientId, {
    type: 'message',
    title: 'New Message 💬',
    message: `${senderName}: ${messagePreview}`,
  });
};

export const sendMatchRequestNotification = async (recipientId: string, senderName: string) => {
  await sendNotification(recipientId, {
    type: 'match_request',
    title: 'Match Request 🔥',
    message: `${senderName} sent you a match request`,
  });
};

export const sendReportNotification = async (reportedUserId: string, reporterName: string) => {
  await sendNotification(reportedUserId, {
    type: 'report',
    title: 'Profile Report ⚠️',
    message: `Your profile was reported by ${reporterName}`,
  });
};

export const sendAdminMessageNotification = async (userId: string, adminName: string, message: string) => {
  await sendNotification(userId, {
    type: 'admin_message',
    title: 'Admin Message 👨‍💼',
    message: `${adminName}: ${message}`,
  });
};

export const sendProfileViewNotification = async (userId: string, viewerName: string) => {
  await sendNotification(userId, {
    type: 'profile_view',
    title: 'Profile View 👀',
    message: `${viewerName} viewed your profile`,
  });
};

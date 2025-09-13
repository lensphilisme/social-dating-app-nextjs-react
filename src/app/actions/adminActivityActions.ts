'use server';

import { prisma } from '@/lib/prisma';
import { getUserRole } from './authActions';

export async function getRecentActivity(limit = 10) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    // Get recent user registrations (using member creation date)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { emailVerified: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        member: {
          select: {
            created: true
          }
        }
      }
    });

    // Get recent matches
    const recentMatches = await prisma.match.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user1: {
          select: { name: true }
        },
        user2: {
          select: { name: true }
        }
      }
    });

    // Get recent messages
    const recentMessages = await prisma.message.findMany({
      take: 5,
      orderBy: { created: 'desc' },
      include: {
        sender: {
          select: { name: true }
        },
        recipient: {
          select: { name: true }
        }
      }
    });

    // Get pending photos
    const pendingPhotos = await prisma.photo.count({
      where: { isApproved: false }
    });

    // Format activity items
    const activities = [];

    // Add user registrations
    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user_registration',
        title: 'New User Registration',
        description: `${user.name || 'Unnamed User'} joined the platform`,
        timestamp: user.member?.created || user.emailVerified || new Date(),
        icon: 'user',
        color: 'blue'
      });
    });

    // Add matches
    recentMatches.forEach(match => {
      activities.push({
        id: `match-${match.id}`,
        type: 'new_match',
        title: 'New Match',
        description: `${match.user1.name} and ${match.user2.name} matched`,
        timestamp: match.createdAt,
        icon: 'heart',
        color: 'pink'
      });
    });

    // Add system status
    if (pendingPhotos > 0) {
      activities.push({
        id: 'photos-alert',
        type: 'system_alert',
        title: 'Photo Moderation',
        description: `${pendingPhotos} photos awaiting approval`,
        timestamp: new Date(),
        icon: 'photo',
        color: 'orange'
      });
    }

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
}

function getAdminActionTitle(action: string): string {
  const actionTitles: { [key: string]: string } = {
    'UPDATE_SETTING': 'Setting Updated',
    'CREATE_THEME': 'Theme Created',
    'UPDATE_THEME': 'Theme Updated',
    'ACTIVATE_THEME': 'Theme Activated',
    'DELETE_THEME': 'Theme Deleted',
    'BAN_USER': 'User Banned',
    'UNBAN_USER': 'User Unbanned',
    'ASSIGN_MODERATION': 'Moderation Assigned',
    'RESOLVE_MODERATION': 'Moderation Resolved',
    'CREATE_NOTIFICATION': 'Notification Created',
    'UPDATE_NOTIFICATION': 'Notification Updated'
  };
  return actionTitles[action] || 'Admin Action';
}

function getAdminActionDescription(action: string, targetType?: string, targetId?: string): string {
  const descriptions: { [key: string]: string } = {
    'UPDATE_SETTING': `Updated system setting: ${targetId}`,
    'CREATE_THEME': 'Created a new theme',
    'UPDATE_THEME': 'Updated theme configuration',
    'ACTIVATE_THEME': 'Activated a new theme',
    'DELETE_THEME': 'Deleted a theme',
    'BAN_USER': `Banned user: ${targetId}`,
    'UNBAN_USER': `Unbanned user: ${targetId}`,
    'ASSIGN_MODERATION': `Assigned moderation item: ${targetId}`,
    'RESOLVE_MODERATION': `Resolved moderation item: ${targetId}`,
    'CREATE_NOTIFICATION': 'Created system notification',
    'UPDATE_NOTIFICATION': 'Updated system notification'
  };
  return descriptions[action] || `Performed ${action} on ${targetType}`;
}

export async function getSystemStats() {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      newUsersToday,
      totalMatches,
      newMatchesToday,
      totalMessages,
      newMessagesToday,
      pendingPhotos,
      activeUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          member: {
            created: {
              gte: today
            }
          }
        }
      }),
      prisma.match.count(),
      prisma.match.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      }),
      prisma.message.count(),
      prisma.message.count({
        where: {
          created: {
            gte: today
          }
        }
      }),
      prisma.photo.count({
        where: { isApproved: false }
      }),
      prisma.user.count({
        where: {
          member: {
            updated: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        }
      })
    ]);

    return {
      totalUsers,
      newUsersToday,
      totalMatches,
      newMatchesToday,
      totalMessages,
      newMessagesToday,
      pendingModeration: 0, // Will be implemented when moderation queue is ready
      pendingPhotos,
      activeUsers
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    throw error;
  }
}

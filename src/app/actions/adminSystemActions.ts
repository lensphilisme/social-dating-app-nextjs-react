'use server';

import { prisma } from '@/lib/prisma';
import { getUserRole } from './authActions';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// Admin Settings Actions
export async function getAdminSettings(category?: string) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const where = category ? { category } : {};
    return await (prisma as any).adminSettings.findMany({
      where,
      orderBy: { category: 'asc' }
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    throw error;
  }
}

export async function updateAdminSetting(key: string, value: string, description?: string) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const setting = await (prisma as any).adminSettings.upsert({
      where: { key },
      update: { 
        value,
        ...(description && { description }),
        updatedAt: new Date()
      },
      create: {
        key,
        value,
        description,
        category: 'general',
        isPublic: false
      }
    });

    await logAdminAction('UPDATE_SETTING', 'admin_setting', key, { key, value });
    revalidatePath('/admin');
    
    return setting;
  } catch (error) {
    console.error('Error updating admin setting:', error);
    throw error;
  }
}

export async function updateMultipleAdminSettings(updates: Record<string, string>) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const results = [];
    for (const [key, value] of Object.entries(updates)) {
      const setting = await (prisma as any).adminSettings.upsert({
        where: { key },
        update: { 
          value,
          updatedAt: new Date()
        },
        create: {
          key,
          value,
          description: `Setting for ${key}`,
          category: 'general',
          isPublic: false
        }
      });
      results.push(setting);
    }

    await logAdminAction('BULK_UPDATE_SETTINGS', 'admin_settings', 'bulk', { 
      updatedKeys: Object.keys(updates),
      count: Object.keys(updates).length
    });
    revalidatePath('/admin');
    
    return results;
  } catch (error) {
    console.error('Error updating multiple admin settings:', error);
    throw error;
  }
}

export async function getNavigationSettings() {
  try {
    const settings = await (prisma as any).adminSettings.findMany({
      where: {
        category: 'navigation'
      }
    });

    // Convert to a more usable format
    const navSettings: Record<string, any> = {};
    settings.forEach((setting: any) => {
      navSettings[setting.key] = setting.value;
    });

    return navSettings;
  } catch (error) {
    console.error('Error fetching navigation settings:', error);
    // Return default settings if there's an error
    return {
      'nav_home_visible': 'true',
      'nav_discover_visible': 'true',
      'nav_matches_visible': 'true',
      'nav_messages_visible': 'true',
      'nav_members_visible': 'true',
      'nav_favorites_visible': 'true',
      'nav_questions_visible': 'true',
      'nav_reports_visible': 'true',
      'nav_home_order': '1',
      'nav_discover_order': '2',
      'nav_matches_order': '3',
      'nav_messages_order': '4',
      'nav_members_order': '5',
      'nav_favorites_order': '6',
      'nav_questions_order': '7',
      'nav_reports_order': '8'
    };
  }
}

export async function getPublicNavigationSettings() {
  try {
    const settings = await (prisma as any).adminSettings.findMany({
      where: {
        category: 'navigation'
      }
    });

    // Convert to a more usable format
    const navSettings: Record<string, any> = {};
    settings.forEach((setting: any) => {
      navSettings[setting.key] = setting.value;
    });

    return navSettings;
  } catch (error) {
    console.error('Error fetching navigation settings:', error);
    // Return default settings if there's an error
    return {
      'nav_home_visible': 'true',
      'nav_discover_visible': 'true',
      'nav_matches_visible': 'true',
      'nav_messages_visible': 'true',
      'nav_members_visible': 'true',
      'nav_favorites_visible': 'true',
      'nav_questions_visible': 'true',
      'nav_reports_visible': 'true',
      'nav_home_order': '1',
      'nav_discover_order': '2',
      'nav_matches_order': '3',
      'nav_messages_order': '4',
      'nav_members_order': '5',
      'nav_favorites_order': '6',
      'nav_questions_order': '7',
      'nav_reports_order': '8'
    };
  }
}

// Theme Management Actions
export async function getThemes() {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    return await (prisma as any).theme.findMany({
      orderBy: { isDefault: 'desc' }
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    throw error;
  }
}

export async function getActiveTheme() {
  try {
    const activeTheme = await (prisma as any).theme.findFirst({
      where: { isActive: true }
    });

    if (!activeTheme) {
      // Return default theme if no active theme
      const defaultTheme = await (prisma as any).theme.findFirst({
        where: { isDefault: true }
      });
      return defaultTheme;
    }

    return activeTheme;
  } catch (error) {
    console.error('Error fetching active theme:', error);
    return null;
  }
}

export async function createTheme(data: {
  name: string;
  displayName: string;
  description?: string;
  config: any;
}) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const theme = await (prisma as any).theme.create({
      data: {
        ...data,
        isActive: false,
        isDefault: false
      }
    });

    await logAdminAction('CREATE_THEME', 'theme', theme.id, data);
    revalidatePath('/admin/themes');
    
    return theme;
  } catch (error) {
    console.error('Error creating theme:', error);
    throw error;
  }
}

export async function updateTheme(id: string, data: {
  displayName?: string;
  description?: string;
  config?: any;
}) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const theme = await (prisma as any).theme.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    await logAdminAction('UPDATE_THEME', 'theme', id, data);
    revalidatePath('/admin/themes');
    
    return theme;
  } catch (error) {
    console.error('Error updating theme:', error);
    throw error;
  }
}

export async function activateTheme(id: string) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    // Deactivate all themes first
    await (prisma as any).theme.updateMany({
      data: { isActive: false }
    });

    // Activate the selected theme
    const theme = await (prisma as any).theme.update({
      where: { id },
      data: { isActive: true }
    });

    await logAdminAction('ACTIVATE_THEME', 'theme', id, { themeName: theme.name });
    revalidatePath('/admin/themes');
    
    return theme;
  } catch (error) {
    console.error('Error activating theme:', error);
    throw error;
  }
}

export async function deleteTheme(id: string) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const theme = await (prisma as any).theme.findUnique({ where: { id } });
    if (!theme) throw new Error('Theme not found');
    if (theme.isDefault) throw new Error('Cannot delete default theme');

    await (prisma as any).theme.delete({ where: { id } });

    await logAdminAction('DELETE_THEME', 'theme', id, { themeName: theme.name });
    revalidatePath('/admin/themes');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting theme:', error);
    throw error;
  }
}

// User Management Actions
export async function getAllUsers(page = 1, limit = 20, search?: string) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const skip = (page - 1) * limit;
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as any } },
        { email: { contains: search, mode: 'insensitive' as any } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          member: true,
          bans: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              reportsMade: true,
              reportsReceived: true,
              media: true
            }
          }
        } as any,
        orderBy: { emailVerified: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function banUser(userId: string, reason: string, duration?: number) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const expiresAt = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;

    const ban = await (prisma as any).userBan.create({
      data: {
        userId,
        reason,
        duration,
        expiresAt,
        isActive: true
      }
    });

    await logAdminAction('BAN_USER', 'user', userId, { reason, duration, expiresAt });
    revalidatePath('/admin/users');
    
    return ban;
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
}

export async function unbanUser(banId: string) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const ban = await (prisma as any).userBan.update({
      where: { id: banId },
      data: { isActive: false }
    });

    await logAdminAction('UNBAN_USER', 'user_ban', banId, { userId: ban.userId });
    revalidatePath('/admin/users');
    
    return ban;
  } catch (error) {
    console.error('Error unbanning user:', error);
    throw error;
  }
}

// Content Moderation Actions
export async function getModerationQueue(status?: string, type?: string, page = 1, limit = 20) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (status) where.status = status;
    if (type) where.type = type;

    const [items, total] = await Promise.all([
      (prisma as any).moderationQueue.findMany({
        where,
        include: {
          assignedAdmin: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        skip,
        take: limit
      }),
      (prisma as any).moderationQueue.count({ where })
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    throw error;
  }
}

export async function assignModerationItem(itemId: string, adminId: string) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const item = await (prisma as any).moderationQueue.update({
      where: { id: itemId },
      data: { 
        assignedTo: adminId,
        status: 'IN_REVIEW'
      }
    });

    await logAdminAction('ASSIGN_MODERATION', 'moderation_queue', itemId, { adminId });
    revalidatePath('/admin/moderation');
    
    return item;
  } catch (error) {
    console.error('Error assigning moderation item:', error);
    throw error;
  }
}

export async function resolveModerationItem(itemId: string, action: string, notes?: string) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const item = await (prisma as any).moderationQueue.update({
      where: { id: itemId },
      data: { 
        status: 'RESOLVED',
        resolvedAt: new Date(),
        details: {
          action,
          notes,
          resolvedBy: role
        }
      }
    });

    await logAdminAction('RESOLVE_MODERATION', 'moderation_queue', itemId, { action, notes });
    revalidatePath('/admin/moderation');
    
    return item;
  } catch (error) {
    console.error('Error resolving moderation item:', error);
    throw error;
  }
}

// Analytics Actions
export async function getSystemAnalytics(days = 30) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalUsers,
      newUsers,
      activeUsers,
      totalMatches,
      newMatches,
      totalMessages,
      newMessages,
      totalReports,
      pendingReports,
      totalPhotos,
      pendingPhotos,
      userGrowth,
      matchGrowth,
      messageGrowth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          member: {
            created: { gte: startDate }
          }
        }
      }),
      prisma.user.count({
        where: {
          member: {
            updated: { gte: startDate }
          }
        }
      }),
      prisma.match.count(),
      prisma.match.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.message.count(),
      prisma.message.count({
        where: { created: { gte: startDate } }
      }),
      (prisma as any).report.count(),
      (prisma as any).report.count({
        where: { status: 'PENDING' }
      }),
      prisma.photo.count(),
      prisma.photo.count({
        where: { isApproved: false }
      }),
      // Growth data - using member creation dates
      prisma.member.groupBy({
        by: ['created'],
        _count: { id: true },
        where: { created: { gte: startDate } },
        orderBy: { created: 'asc' }
      }),
      prisma.match.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.message.groupBy({
        by: ['created'],
        _count: { id: true },
        where: { created: { gte: startDate } },
        orderBy: { created: 'asc' }
      })
    ]);

    return {
      overview: {
        totalUsers,
        newUsers,
        activeUsers,
        totalMatches,
        newMatches,
        totalMessages,
        newMessages,
        totalReports,
        pendingReports,
        totalPhotos,
        pendingPhotos
      },
      growth: {
        users: userGrowth,
        matches: matchGrowth,
        messages: messageGrowth
      }
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

// Admin Logging
export async function logAdminAction(
  action: string,
  targetType: string,
  targetId: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) return;

    // Check if user exists before logging
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.warn('User not found for admin logging:', userId);
      return;
    }

    await (prisma as any).adminLog.create({
      data: {
        adminId: userId,
        action,
        targetType,
        targetId,
        details,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw error to avoid breaking the main action
  }
}

export async function getAdminLogs(page = 1, limit = 50, action?: string) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const skip = (page - 1) * limit;
    const where = action ? { action } : {};

    const [logs, total] = await Promise.all([
      (prisma as any).adminLog.findMany({
        where,
        include: {
          admin: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      (prisma as any).adminLog.count({ where })
    ]);

    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    throw error;
  }
}

// System Notifications
export async function createSystemNotification(data: {
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  startDate?: Date;
  endDate?: Date;
  targetUsers?: string[];
}) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const notification = await (prisma as any).systemNotification.create({
      data: {
        ...data,
        targetUsers: data.targetUsers ? JSON.stringify(data.targetUsers) : null
      }
    });

    await logAdminAction('CREATE_NOTIFICATION', 'system_notification', notification.id, data);
    revalidatePath('/admin/notifications');
    
    return notification;
  } catch (error) {
    console.error('Error creating system notification:', error);
    throw error;
  }
}

export async function getSystemNotifications(active?: boolean) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const where = active !== undefined ? { isActive: active } : {};

    return await (prisma as any).systemNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Error fetching system notifications:', error);
    throw error;
  }
}

export async function updateSystemNotification(id: string, data: {
  title?: string;
  message?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const notification = await (prisma as any).systemNotification.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    await logAdminAction('UPDATE_NOTIFICATION', 'system_notification', id, data);
    revalidatePath('/admin/notifications');
    
    return notification;
  } catch (error) {
    console.error('Error updating system notification:', error);
    throw error;
  }
}

// Bulk Operations
export async function bulkVerifyUsers(userIds: string[]) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    if (!userIds || userIds.length === 0) {
      throw new Error('No users selected');
    }

    // Update all users to be verified
    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
        role: { not: 'ADMIN' } // Don't modify admin users
      },
      data: {
        emailVerified: new Date()
      }
    });

    return { 
      success: true, 
      message: `${result.count} users verified successfully`,
      count: result.count
    };
  } catch (error) {
    console.error('Error bulk verifying users:', error);
    throw error;
  }
}

export async function bulkBanUsers(userIds: string[], reason: string, duration?: number) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    if (!userIds || userIds.length === 0) {
      throw new Error('No users selected');
    }

    if (!reason.trim()) {
      throw new Error('Ban reason is required');
    }

    const expiresAt = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;

    // Create ban records for all users
    const banPromises = userIds.map(userId => 
      (prisma as any).userBan.create({
        data: {
          userId,
          reason,
          expiresAt,
          isActive: true,
          bannedBy: 'system' // You might want to get the actual admin ID
        }
      })
    );

    await Promise.all(banPromises);

    return { 
      success: true, 
      message: `${userIds.length} users banned successfully`,
      count: userIds.length
    };
  } catch (error) {
    console.error('Error bulk banning users:', error);
    throw error;
  }
}

export async function bulkUnbanUsers(userIds: string[]) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    if (!userIds || userIds.length === 0) {
      throw new Error('No users selected');
    }

    // Deactivate all active bans for these users
    const result = await (prisma as any).userBan.updateMany({
      where: {
        userId: { in: userIds },
        isActive: true
      },
      data: {
        isActive: false,
        unbannedAt: new Date()
      }
    });

    return { 
      success: true, 
      message: `${result.count} users unbanned successfully`,
      count: result.count
    };
  } catch (error) {
    console.error('Error bulk unbanning users:', error);
    throw error;
  }
}

// User Editing Functions
export async function updateUserDetails(userId: string, data: {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'MEMBER';
  profileComplete?: boolean;
}) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.role && { role: data.role }),
        ...(data.profileComplete !== undefined && { profileComplete: data.profileComplete })
      },
      include: {
        member: true,
        bans: {
          where: { isActive: true }
        }
      } as any
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating user details:', error);
    throw error;
  }
}

export async function updateMemberDetails(userId: string, data: {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: string;
  city?: string;
  country?: string;
  description?: string;
  profession?: string;
  education?: string;
  hobbies?: string;
  languages?: string;
  spiritualGoals?: string;
  spiritualStatement?: string;
  favoriteScripture?: string;
  spiritualAchievements?: string;
  spiritualExpectations?: string;
  maritalGoals?: string;
  childrenPreference?: string;
  baptismStatus?: string;
  baptismDate?: Date;
  congregation?: string;
  meetingAttendance?: string;
  fieldService?: string;
  moralIntegrity?: string;
  countryOfBirth?: string;
  state?: string;
}) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { member: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update member details
    const updatedMember = await prisma.member.update({
      where: { userId },
      data: {
        ...data,
        updated: new Date()
      } as any
    });

    return { success: true, member: updatedMember };
  } catch (error) {
    console.error('Error updating member details:', error);
    throw error;
  }
}

// Media Management Functions
export async function deleteUserMedia(mediaId: string) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    // Check if media exists
    const media = await (prisma as any).userMedia.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      throw new Error('Media not found');
    }

    // Delete media
    await (prisma as any).userMedia.delete({
      where: { id: mediaId }
    });

    return { success: true, message: 'Media deleted successfully' };
  } catch (error) {
    console.error('Error deleting media:', error);
    throw error;
  }
}

export async function getUserMedia(userId: string) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') throw new Error('Forbidden');

    const media = await (prisma as any).userMedia.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return media;
  } catch (error) {
    console.error('Error fetching user media:', error);
    throw error;
  }
}

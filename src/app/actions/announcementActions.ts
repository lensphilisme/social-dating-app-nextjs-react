'use server';

import { prisma } from '@/lib/prisma';
import { getUserRole } from './authActions';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// Get all announcement for admin
export async function getAnnouncements() {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const announcement = await (prisma as any).announcement.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        views: {
          select: {
            id: true,
            userId: true,
            viewedAt: true,
            dismissed: true
          }
        },
        _count: {
          select: {
            views: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return announcement;
  } catch (error) {
    console.error('Error fetching announcement:', error);
    throw error;
  }
}

// Get active announcement for user
export async function getActiveAnnouncements(userId: string, sessionId: string) {
  try {
    const now = new Date();
    
    const announcement = await (prisma as any).announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ],
        OR: [
          { targetUsers: null },
          { targetUsers: 'all' },
          { targetUsers: { contains: userId } }
        ]
      },
      include: {
        views: {
          where: {
            userId: userId,
            sessionId: sessionId
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Filter out announcement that have been dismissed in this session
    // or have reached max views
    const filteredAnnouncements = announcement.filter(announcement => {
      const userViews = announcement.views || [];
      const sessionViews = userViews.filter((view: any) => view.sessionId === sessionId);
      const dismissedInSession = sessionViews.some((view: any) => view.dismissed);
      
      if (dismissedInSession) return false;
      
      if (announcement.maxViews && userViews.length >= announcement.maxViews) {
        return false;
      }
      
      return true;
    });

    return filteredAnnouncements;
  } catch (error) {
    console.error('Error fetching active announcement:', error);
    return [];
  }
}

// Create announcement
export async function createAnnouncement(data: {
  title: string;
  message: string;
  type: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  showDelay: number;
  duration: number;
  maxViews?: number;
  targetUsers?: string;
  styling?: any;
}) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error('User not found');
    }

    const announcement = await (prisma as any).announcement.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        showDelay: data.showDelay,
        duration: data.duration,
        maxViews: data.maxViews,
        targetUsers: data.targetUsers || 'all',
        styling: data.styling || {},
        createdBy: userId
      }
    });

    revalidatePath('/admin/announcement');
    return announcement;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
}

// Update announcement
export async function updateAnnouncement(id: string, data: {
  title?: string;
  message?: string;
  type?: string;
  priority?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  showDelay?: number;
  duration?: number;
  maxViews?: number;
  targetUsers?: string;
  styling?: any;
}) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.message !== undefined) updateData.message = data.message;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.showDelay !== undefined) updateData.showDelay = data.showDelay;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.maxViews !== undefined) updateData.maxViews = data.maxViews;
    if (data.targetUsers !== undefined) updateData.targetUsers = data.targetUsers;
    if (data.styling !== undefined) updateData.styling = data.styling;

    const announcement = await (prisma as any).announcement.update({
      where: { id },
      data: updateData
    });

    revalidatePath('/admin/announcement');
    return announcement;
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
}

// Delete announcement
export async function deleteAnnouncement(id: string) {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    await (prisma as any).announcement.delete({
      where: { id }
    });

    revalidatePath('/admin/announcement');
    return { success: true };
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
}

// Mark announcement as viewed
export async function markAnnouncementViewed(announcementId: string, userId: string, sessionId: string) {
  try {
    await (prisma as any).announcementView.create({
      data: {
        announcementId,
        userId,
        sessionId,
        viewedAt: new Date()
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking announcement as viewed:', error);
    // Don't throw error for view tracking
    return { success: false };
  }
}

// Dismiss announcement for session
export async function dismissAnnouncement(announcementId: string, userId: string, sessionId: string) {
  try {
    await (prisma as any).announcementView.upsert({
      where: {
        announcementId_userId_sessionId: {
          announcementId,
          userId,
          sessionId
        }
      },
      update: {
        dismissed: true
      },
      create: {
        announcementId,
        userId,
        sessionId,
        dismissed: true
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error dismissing announcement:', error);
    return { success: false };
  }
}

// Get announcement statistics
export async function getAnnouncementStats() {
  try {
    const role = await getUserRole();
    if (role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const stats = await (prisma as any).announcement.aggregate({
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    });

    const totalViews = await (prisma as any).announcementView.count();
    const dismissedViews = await (prisma as any).announcementView.count({
      where: {
        dismissed: true
      }
    });

    return {
      totalAnnouncements: stats._count.id,
      totalViews,
      dismissedViews,
      engagementRate: totalViews > 0 ? ((totalViews - dismissedViews) / totalViews * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Error fetching announcement stats:', error);
    return {
      totalAnnouncements: 0,
      totalViews: 0,
      dismissedViews: 0,
      engagementRate: 0
    };
  }
}
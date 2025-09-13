'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions';

export async function trackProfileView(viewedUserId: string) {
  try {
    const viewerId = await getAuthUserId();
    
    // Don't track self-views
    if (viewerId === viewedUserId) {
      return { success: true };
    }

    // Use upsert to create or update the view record
    await prisma.profileView.upsert({
      where: {
        viewerId_viewedId: {
          viewerId,
          viewedId: viewedUserId
        }
      },
      update: {
        createdAt: new Date()
      },
      create: {
        viewerId,
        viewedId: viewedUserId
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error tracking profile view:', error);
    return { success: false, error: 'Failed to track profile view' };
  }
}

export async function getProfileViewCount(userId: string, days: number = 1) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const count = await prisma.profileView.count({
      where: {
        viewedId: userId,
        createdAt: {
          gte: startDate
        }
      }
    });

    return count;
  } catch (error) {
    console.error('Error getting profile view count:', error);
    return 0;
  }
}


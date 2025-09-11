'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions';
import { sendLikeNotification } from '@/lib/pusher';

export async function addToFavorites(targetId: string): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getAuthUserId();
    
    if (userId === targetId) {
      return { success: false, message: 'You cannot add yourself to favorites' };
    }

    // Check if already in favorites
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_targetId: {
          userId,
          targetId
        }
      }
    });

    if (existingFavorite) {
      return { success: false, message: 'User is already in your favorites' };
    }

    await prisma.favorite.create({
      data: {
        userId,
        targetId
      }
    });

    // Send notification to the user who was liked
    try {
      const liker = await prisma.user.findUnique({
        where: { id: userId },
        include: { member: true }
      });
      
      if (liker?.member?.name) {
        await sendLikeNotification(targetId, liker.member.name);
      }
    } catch (notificationError) {
      console.error('Error sending like notification:', notificationError);
    }

    return { success: true, message: 'Added to favorites' };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return { success: false, message: 'Failed to add to favorites' };
  }
}

export async function removeFromFavorites(targetId: string): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getAuthUserId();
    
    await prisma.favorite.deleteMany({
      where: {
        userId,
        targetId
      }
    });

    return { success: true, message: 'Removed from favorites' };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return { success: false, message: 'Failed to remove from favorites' };
  }
}

export async function getFavorites(): Promise<any[]> {
  try {
    const userId = await getAuthUserId();
    
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        target: {
          include: {
            member: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return favorites.map(fav => ({
      id: fav.id,
      createdAt: fav.createdAt,
      member: fav.target.member
    }));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

export async function isFavorite(targetId: string): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_targetId: {
          userId,
          targetId
        }
      }
    });

    return !!favorite;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}

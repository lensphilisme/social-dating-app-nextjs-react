'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions';
import { sendLikeNotification } from '@/lib/pusher';

export async function addToFavorites(favoritedUserId: string): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getAuthUserId();
    
    if (userId === favoritedUserId) {
      return { success: false, message: 'You cannot add yourself to favorites' };
    }

    // Check if already in favorites
    const existingFavorite = await (prisma as any).favorite.findUnique({
      where: {
        userId_favoritedUserId: {
          userId,
          favoritedUserId
        }
      }
    });

    if (existingFavorite) {
      return { success: false, message: 'User is already in your favorites' };
    }

    await (prisma as any).favorite.create({
      data: {
        userId,
        favoritedUserId
      }
    });

    // Send notification to the user who was liked
    try {
      const liker = await prisma.user.findUnique({
        where: { id: userId },
        include: { member: true }
      });
      
      if (liker?.member?.name) {
        await sendLikeNotification(favoritedUserId, liker.member.name);
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

export async function removeFromFavorites(favoritedUserId: string): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getAuthUserId();
    
    await (prisma as any).favorite.deleteMany({
      where: {
        userId,
        favoritedUserId
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
    
    const favorites = await (prisma as any).favorite.findMany({
      where: { userId },
      include: {
        favoritedBy: {
          include: {
            member: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return favorites.map((fav: any) => ({
      id: fav.id,
      createdAt: fav.createdAt,
      member: fav.favoritedBy.member
    }));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

export async function isFavorite(favoritedUserId: string): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    
    const favorite = await (prisma as any).favorite.findUnique({
      where: {
        userId_favoritedUserId: {
          userId,
          favoritedUserId
        }
      }
    });

    return !!favorite;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}

'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions';
import { MediaType } from '@prisma/client';

export async function getUserMedia(userId?: string): Promise<any[]> {
  try {
    const targetUserId = userId || await getAuthUserId();
    
    const media = await prisma.userMedia.findMany({
      where: { 
        userId: targetUserId,
        isPublic: true 
      },
      orderBy: [
        { isMain: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return media;
  } catch (error) {
    console.error('Error fetching user media:', error);
    return [];
  }
}

export async function addUserMedia(data: {
  type: MediaType;
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  isPublic?: boolean;
  isMain?: boolean;
}): Promise<{ success: boolean; message: string; media?: any }> {
  try {
    const userId = await getAuthUserId();
    
    // If setting as main, unset other main media of same type
    if (data.isMain) {
      await prisma.userMedia.updateMany({
        where: { 
          userId,
          type: data.type,
          isMain: true 
        },
        data: { isMain: false }
      });
    }

    // Get next order number
    const lastMedia = await prisma.userMedia.findFirst({
      where: { userId },
      orderBy: { order: 'desc' }
    });
    const nextOrder = (lastMedia?.order || 0) + 1;

    const media = await prisma.userMedia.create({
      data: {
        userId,
        type: data.type,
        url: data.url,
        thumbnail: data.thumbnail,
        title: data.title,
        description: data.description,
        isPublic: data.isPublic ?? true,
        isMain: data.isMain ?? false,
        order: nextOrder,
      }
    });

    return { success: true, message: 'Media added successfully', media };
  } catch (error) {
    console.error('Error adding user media:', error);
    return { success: false, message: 'Failed to add media' };
  }
}

export async function updateUserMedia(
  mediaId: string,
  data: {
    title?: string;
    description?: string;
    isPublic?: boolean;
    isMain?: boolean;
    order?: number;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getAuthUserId();
    
    // Verify ownership
    const existingMedia = await prisma.userMedia.findFirst({
      where: { id: mediaId, userId }
    });

    if (!existingMedia) {
      return { success: false, message: 'Media not found or access denied' };
    }

    // If setting as main, unset other main media of same type
    if (data.isMain) {
      await prisma.userMedia.updateMany({
        where: { 
          userId,
          type: existingMedia.type,
          isMain: true,
          id: { not: mediaId }
        },
        data: { isMain: false }
      });
    }

    await prisma.userMedia.update({
      where: { id: mediaId },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });

    return { success: true, message: 'Media updated successfully' };
  } catch (error) {
    console.error('Error updating user media:', error);
    return { success: false, message: 'Failed to update media' };
  }
}

export async function deleteUserMedia(mediaId: string): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getAuthUserId();
    
    // Verify ownership
    const existingMedia = await prisma.userMedia.findFirst({
      where: { id: mediaId, userId }
    });

    if (!existingMedia) {
      return { success: false, message: 'Media not found or access denied' };
    }

    await prisma.userMedia.delete({
      where: { id: mediaId }
    });

    return { success: true, message: 'Media deleted successfully' };
  } catch (error) {
    console.error('Error deleting user media:', error);
    return { success: false, message: 'Failed to delete media' };
  }
}

export async function reorderUserMedia(mediaIds: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getAuthUserId();
    
    // Update order for each media item
    await Promise.all(
      mediaIds.map((mediaId, index) =>
        prisma.userMedia.updateMany({
          where: { id: mediaId, userId },
          data: { order: index + 1 }
        })
      )
    );

    return { success: true, message: 'Media reordered successfully' };
  } catch (error) {
    console.error('Error reordering user media:', error);
    return { success: false, message: 'Failed to reorder media' };
  }
}

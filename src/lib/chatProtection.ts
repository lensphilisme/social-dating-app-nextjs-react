import { prisma } from '@/lib/prisma';
import { getAuthUserId } from '@/app/actions/authActions';

export async function areUsersMatched(userId1: string, userId2: string): Promise<boolean> {
  try {
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: userId1, user2Id: userId2 },
          { user1Id: userId2, user2Id: userId1 }
        ]
      }
    });

    return !!match;
  } catch (error) {
    console.error('Error checking if users are matched:', error);
    return false;
  }
}

export async function canAccessChat(targetUserId: string): Promise<boolean> {
  try {
    const currentUserId = await getAuthUserId();
    return await areUsersMatched(currentUserId, targetUserId);
  } catch (error) {
    console.error('Error checking chat access:', error);
    return false;
  }
}

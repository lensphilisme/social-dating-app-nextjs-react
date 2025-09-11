'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions';

export async function getMatches(): Promise<any[]> {
  try {
    const userId = await getAuthUserId();
    
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: true,
        user2: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter to get the other user in each match
    return matches.map(match => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1;
      return {
        id: match.id,
        createdAt: match.createdAt,
        member: otherUser.member,
        user: otherUser
      };
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}

export async function getMatchCount(): Promise<number> {
  try {
    const userId = await getAuthUserId();
    
    const count = await prisma.match.count({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    return count;
  } catch (error) {
    console.error('Error fetching match count:', error);
    return 0;
  }
}

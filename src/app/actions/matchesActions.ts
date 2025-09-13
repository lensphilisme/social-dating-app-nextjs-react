'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getMatches(): Promise<any[]> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) {
      return [];
    }
    
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

    // Get member data for each user
    const matchesWithMembers = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
        const otherUser = match.user1Id === userId ? match.user2 : match.user1;
        
        // Get member data
        const member = await prisma.member.findUnique({
          where: { userId: otherUserId }
        });

        return {
          id: match.id,
          createdAt: match.createdAt,
          member: member,
          user: otherUser
        };
      })
    );

    return matchesWithMembers;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}

export async function getMatchCount(): Promise<number> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) {
      return 0;
    }
    
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

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get counts from database
    const [matchesCount, messagesCount, favoritesCount] = await Promise.all([
      // Count new match requests (where user is recipient and status is pending)
      prisma.matchRequest.count({
        where: {
          recipientId: userId,
          status: 'PENDING'
        }
      }),
      
      // Count unread messages
      prisma.message.count({
        where: {
          recipientId: userId,
          dateRead: null
        }
      }),
      
      // Count favorites (people who liked the user)
      prisma.favorite.count({
        where: {
          targetId: userId
        }
      })
    ]);

    return NextResponse.json({
      matches: matchesCount,
      messages: messagesCount,
      favorites: favoritesCount
    });

  } catch (error) {
    console.error('Error fetching notification counts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

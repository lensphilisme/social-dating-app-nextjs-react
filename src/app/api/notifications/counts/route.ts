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
    let matchesCount = 0;
    let messagesCount = 0;
    let favoritesCount = 0;
    let matchRequestsCount = 0;

    try {
      // Count new matches (mutual matches that allow chatting)
      matchesCount = await prisma.match.count({
        where: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });
    } catch (error) {
      console.error('Error counting matches:', error);
    }

    try {
      // Count unread messages
      messagesCount = await prisma.message.count({
        where: {
          recipientId: userId,
          dateRead: null
        }
      });
    } catch (error) {
      console.error('Error counting messages:', error);
    }

    try {
      // Count favorites (people who liked the user)
      favoritesCount = await (prisma as any).favorite.count({
        where: {
          favoritedUserId: userId
        }
      });
    } catch (error) {
      console.error('Error counting favorites:', error);
    }

    try {
      // Count new match requests (where user is recipient and status is pending)
      matchRequestsCount = await prisma.matchRequest.count({
        where: {
          recipientId: userId,
          status: 'PENDING'
        }
      });
    } catch (error) {
      console.error('Error counting match requests:', error);
    }

    return NextResponse.json({
      matches: matchesCount,
      messages: messagesCount,
      favorites: favoritesCount,
      matchRequests: matchRequestsCount
    });

  } catch (error) {
    console.error('Error fetching notification counts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

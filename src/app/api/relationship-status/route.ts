import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const currentUserId = session.user.id;

    // Check if current user has liked the target user
    const isLiked = await prisma.favorite.findFirst({
      where: {
        userId: currentUserId,
        targetId: targetUserId
      }
    });

    // Check if they are matched
    const isMatched = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: currentUserId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: currentUserId }
        ]
      }
    });

    // Check if there's a pending match request
    const hasMatchRequest = await prisma.matchRequest.findFirst({
      where: {
        senderId: currentUserId,
        recipientId: targetUserId,
        status: 'PENDING'
      }
    });

    // Can chat if they are matched
    const canChat = !!isMatched;

    return NextResponse.json({
      isLiked: !!isLiked,
      isMatched: !!isMatched,
      hasMatchRequest: !!hasMatchRequest,
      canChat: canChat
    });

  } catch (error) {
    console.error('Error checking relationship status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

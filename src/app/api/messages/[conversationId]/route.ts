import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();
    const { conversationId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get messages between current user and conversation partner
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            recipientId: conversationId
          },
          {
            senderId: conversationId,
            recipientId: userId
          }
        ]
      },
      orderBy: {
        created: 'asc'
      }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: conversationId,
        recipientId: userId,
        dateRead: null
      },
      data: {
        dateRead: new Date()
      }
    });

    const formattedMessages = messages.map(message => ({
      id: message.id,
      text: message.text,
      timestamp: message.created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromMe: message.senderId === userId,
      isRead: message.dateRead !== null,
      type: 'text' as const
    }));

    return NextResponse.json(formattedMessages);

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

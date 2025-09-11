import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { sendMessageNotification } from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientId, text } = await request.json();

    if (!recipientId || !text) {
      return NextResponse.json(
        { error: 'Recipient ID and text are required' },
        { status: 400 }
      );
    }

    // Create new message
    const message = await prisma.message.create({
      data: {
        text,
        senderId: session.user.id,
        recipientId
      }
    });

    // Send notification to recipient
    try {
      const sender = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { member: true }
      });
      
      if (sender?.member?.name) {
        await sendMessageNotification(recipientId, sender.member.name, text.substring(0, 50));
      }
    } catch (notificationError) {
      console.error('Error sending message notification:', notificationError);
    }

    return NextResponse.json({
      id: message.id,
      text: message.text,
      timestamp: message.created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromMe: true,
      isRead: false,
      type: 'text'
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { auth } from '@/auth';
import { getMessageThread } from '@/app/actions/messageActions';
import { createChatId } from '@/lib/util';
import { canAccessChat } from '@/lib/chatProtection';
import { prisma } from '@/lib/prisma';
import { transformImageUrl } from '@/lib/util';
import ChatInterface from './ChatInterface';
import { redirect } from 'next/navigation';

export default async function ChatPage({params}: {params: Promise<{userId: string}>}) {
    const { userId: targetUserId } = await params;
    
    // Get session directly
    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) {
        redirect('/auth/signin');
    }
    
    // Check if users are matched
    const canChat = await canAccessChat(targetUserId);
    if (!canChat) {
        redirect(`/members/${targetUserId}`);
    }
    
    // Get messages and user info
    const messageThread = await getMessageThread(targetUserId);
    const rawMessages = messageThread?.messages || [];
    
    // Transform messages to match ChatInterface expected format
    const messages = rawMessages.map(msg => ({
        id: msg.id,
        content: msg.text,
        senderId: msg.senderId || '',
        recipientId: msg.recipientId || '',
        dateSent: new Date(msg.created),
        dateRead: msg.dateRead ? new Date(msg.dateRead) : undefined,
        imageUrl: undefined
    }));
    
    const chatId = createChatId(userId, targetUserId);
    
    // Get target user info for header
    const targetUser = await prisma.member.findUnique({
        where: { userId: targetUserId },
        include: {
            user: {
                select: {
                    name: true,
                    image: true
                }
            }
        }
    });

    if (!targetUser) {
        redirect('/matches');
    }

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            <ChatInterface 
                messages={messages} 
                currentUserId={userId} 
                chatId={chatId}
                targetUser={targetUser}
            />
        </div>
    )
}

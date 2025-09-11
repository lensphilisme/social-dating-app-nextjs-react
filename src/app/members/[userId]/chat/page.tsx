import { getAuthUserId } from '@/app/actions/authActions';
import { getMessageThread } from '@/app/actions/messageActions';
import CardInnerWrapper from '@/components/CardInnerWrapper';
import { createChatId } from '@/lib/util';
import { canAccessChat } from '@/lib/chatProtection';
import ChatForm from './ChatForm';
import MessageList from './MessageList';
import { redirect } from 'next/navigation';

export default async function ChatPage({params}: {params: Promise<{userId: string}>}) {
    const { userId: targetUserId } = await params;
    const userId = await getAuthUserId();
    
    // Check if users are matched
    const canChat = await canAccessChat(targetUserId);
    if (!canChat) {
        redirect(`/members/${targetUserId}`);
    }
    
    const messages = await getMessageThread(targetUserId);
    const chatId = createChatId(userId, targetUserId);

    return (
        <CardInnerWrapper
            header='Chat'
            body={
                <MessageList initialMessages={messages} currentUserId={userId} chatId={chatId} />
            }
            footer={<ChatForm />}
        />
    )
}

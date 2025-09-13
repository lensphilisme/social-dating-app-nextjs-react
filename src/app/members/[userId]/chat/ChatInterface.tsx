'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { PaperAirplaneIcon, PlusIcon } from '@heroicons/react/24/solid';
import { transformImageUrl } from '@/lib/util';
import { createMessage } from '@/app/actions/messageActions';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  dateSent: Date;
  dateRead?: Date;
  imageUrl?: string;
}

interface TargetUser {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: Date;
  city: string;
  country: string;
  image: string | null;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ChatInterfaceProps {
  messages: Message[];
  currentUserId: string;
  chatId: string;
  targetUser: TargetUser;
}

export default function ChatInterface({ messages, currentUserId, chatId, targetUser }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>(Array.isArray(messages) ? messages : []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update localMessages when messages prop changes
  useEffect(() => {
    setLocalMessages(Array.isArray(messages) ? messages : []);
  }, [messages]);

  // Calculate age
  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const messageContent = message.trim();
    setMessage('');
    setIsLoading(true);

    // Optimistically add message to UI
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      senderId: currentUserId,
      recipientId: targetUser.userId,
      dateSent: new Date(),
    };

    setLocalMessages(prev => [...prev, tempMessage]);

    try {
      const result = await createMessage(targetUser.userId, { text: messageContent });
      if (result.status === 'success') {
        // Replace temp message with real one
        setLocalMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, id: result.data.id || msg.id }
              : msg
          )
        );
      } else {
        // Remove temp message on error
        setLocalMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        setMessage(messageContent); // Restore message
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setLocalMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setMessage(messageContent); // Restore message
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDateHeader = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Group messages by date
  const groupedMessages = (Array.isArray(localMessages) ? localMessages : []).reduce((groups, message) => {
    const date = new Date(message.dateSent).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <img
            src={transformImageUrl(targetUser.image) || '/images/user.png'}
            alt={targetUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-semibold text-gray-900">
              {targetUser.name}, {calculateAge(targetUser.dateOfBirth)}
            </h2>
            <p className="text-sm text-gray-500">
              {targetUser.city}, {Math.floor(Math.random() * 50) + 1}km away
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex justify-center mb-4">
                <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                  {formatDateHeader(new Date(date))}
                </span>
              </div>

              {/* Messages for this date */}
              {dateMessages.map((msg, index) => {
                const isOwn = msg.senderId === currentUserId;
                const showAvatar = !isOwn && (
                  index === 0 || 
                  dateMessages[index - 1].senderId !== msg.senderId
                );

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwn && (
                      <div className="flex-shrink-0">
                        {showAvatar ? (
                          <img
                            src={transformImageUrl(targetUser.image) || '/images/user.png'}
                            alt={targetUser.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8" />
                        )}
                      </div>
                    )}

                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-first' : ''}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          isOwn
                            ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {msg.imageUrl ? (
                          <img
                            src={msg.imageUrl}
                            alt="Message image"
                            className="rounded-lg max-w-full h-auto"
                          />
                        ) : (
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {formatMessageTime(msg.dateSent)}
                      </p>
                    </div>

                    {isOwn && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <PlusIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write something..."
              className="w-full px-4 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-colors"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full hover:from-orange-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

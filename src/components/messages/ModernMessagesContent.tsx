'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { transformImageUrl } from '@/lib/util';
import Link from 'next/link';

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    image: string;
    isOnline: boolean;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isRead: boolean;
    isFromMe: boolean;
  };
  unreadCount: number;
}

export default function ModernMessagesContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  // Fetch conversations from database
  useEffect(() => {
    const fetchConversations = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch('/api/messages/conversations');
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [session?.user?.id]);

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateMessage = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        
        
        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* New Matches Section */}
      <div className="px-4 py-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">New Matches</h2>
          <span className="text-sm text-gray-500">{conversations.filter(c => c.unreadCount > 0).length}</span>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2">
          {conversations.slice(0, 5).map((conversation) => (
            <Link
              key={conversation.id}
              href={`/members/${conversation.user.id}/chat`}
              className="flex-shrink-0 text-center"
            >
              <div className="relative">
                <img
                  src={transformImageUrl(conversation.user.image) || '/images/user.png'}
                  alt={conversation.user.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-orange-400"
                />
                {conversation.user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 mt-2 truncate max-w-16">
                {conversation.user.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Chats Section */}
      <div className="px-4 py-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Chats</h2>
        
        <div className="space-y-1">
          <AnimatePresence>
            {filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={`/members/${conversation.user.id}/chat`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={transformImageUrl(conversation.user.image) || '/images/user.png'}
                      alt={conversation.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.user.name}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${
                        conversation.lastMessage.isFromMe 
                          ? 'text-gray-600' 
                          : conversation.unreadCount > 0 
                            ? 'text-gray-900 font-medium' 
                            : 'text-gray-600'
                      }`}>
                        {conversation.lastMessage.isFromMe && 'You: '}
                        {truncateMessage(conversation.lastMessage.text)}
                      </p>
                      
                      {conversation.unreadCount > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          {conversation.unreadCount > 1 && (
                            <span className="text-xs text-orange-500 font-medium">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Empty State */}
      {filteredConversations.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500 text-center mb-6">
            Start chatting with your matches to see conversations here
          </p>
          <Link
            href="/matches"
            className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-orange-500 hover:to-pink-600 transition-all duration-300 shadow-lg"
          >
            View Matches
          </Link>
        </div>
      )}
    </div>
  );
}

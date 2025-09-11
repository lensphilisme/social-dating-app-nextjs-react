'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  EllipsisVerticalIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  FaceSmileIcon,
  PhoneIcon,
  VideoCameraIcon,
  CheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';

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

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromMe: boolean;
  isRead: boolean;
  type: 'text' | 'image' | 'emoji';
}

export default function MessagesContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
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

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/messages/${selectedConversation}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
  }, [selectedConversation, session?.user?.id]);

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation && session?.user?.id) {
      try {
        const response = await fetch('/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientId: selectedConversation,
            text: newMessage
          })
        });

        if (response.ok) {
          const message = await response.json();
          setMessages(prev => [...prev, message]);
          setNewMessage('');
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-neutral-900">Messages</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors">
              <PhoneIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors">
              <VideoCameraIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-80 bg-white border-r border-neutral-200 flex flex-col`}>
          {/* Search */}
          <div className="p-4 border-b border-neutral-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                whileHover={{ backgroundColor: '#f9fafb' }}
                className={`p-4 border-b border-neutral-100 cursor-pointer ${
                  selectedConversation === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={conversation.user.image}
                      alt={conversation.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-neutral-900 truncate">
                        {conversation.user.name}
                      </h3>
                      <span className="text-xs text-neutral-500">
                        {conversation.lastMessage.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-sm truncate ${
                        conversation.lastMessage.isRead ? 'text-neutral-600' : 'text-neutral-900 font-medium'
                      }`}>
                        {conversation.lastMessage.isFromMe && 'You: '}
                        {conversation.lastMessage.text}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <AnimatePresence>
          {selectedConversation && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col bg-neutral-50"
            >
              {/* Chat Header */}
              <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden p-1 text-neutral-600 hover:text-primary-600"
                    >
                      ←
                    </button>
                    <div className="relative">
                      <img
                        src={conversations.find(c => c.id === selectedConversation)?.user.image || '/images/user.png'}
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {conversations.find(c => c.id === selectedConversation)?.user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-neutral-900">
                        {conversations.find(c => c.id === selectedConversation)?.user.name}
                      </h2>
                      <p className="text-sm text-neutral-500">
                        {conversations.find(c => c.id === selectedConversation)?.user.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors">
                      <PhoneIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors">
                      <VideoCameraIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isFromMe 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-white text-neutral-900 border border-neutral-200'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        message.isFromMe ? 'text-primary-100' : 'text-neutral-500'
                      }`}>
                        <span className="text-xs">{message.timestamp}</span>
                        {message.isFromMe && (
                          message.isRead ? (
                            <CheckCircleIcon className="w-3 h-3" />
                          ) : (
                            <CheckIcon className="w-3 h-3" />
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex-shrink-0 bg-white border-t border-neutral-200 p-4">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors">
                    <PhotoIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 rounded-lg transition-colors">
                    <FaceSmileIcon className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!selectedConversation && (
          <div className="hidden md:flex flex-1 items-center justify-center bg-neutral-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <PaperAirplaneIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Select a conversation</h3>
              <p className="text-neutral-600">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

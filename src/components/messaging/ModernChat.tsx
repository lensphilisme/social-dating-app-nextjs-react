'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  CheckIcon as CheckIconSolid,
  CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'emoji';
}

interface ChatUser {
  id: string;
  name: string;
  image: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Hey! How are you doing today? 😊',
    sender: 'other',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'read',
    type: 'text'
  },
  {
    id: '2',
    text: 'I\'m doing great! Just finished a wonderful walk in the park. How about you?',
    sender: 'me',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    status: 'read',
    type: 'text'
  },
  {
    id: '3',
    text: 'That sounds lovely! I love spending time in nature too. What kind of park was it?',
    sender: 'other',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    status: 'read',
    type: 'text'
  },
  {
    id: '4',
    text: 'It was Central Park! The cherry blossoms are in full bloom right now 🌸',
    sender: 'me',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: 'read',
    type: 'text'
  },
  {
    id: '5',
    text: 'Oh wow, that sounds absolutely beautiful! I\'ve always wanted to see the cherry blossoms in Central Park. Do you have any photos?',
    sender: 'other',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    status: 'delivered',
    type: 'text'
  }
];

const mockUser: ChatUser = {
  id: '1',
  name: 'Sarah Johnson',
  image: '/images/user.png',
  status: 'online',
  lastSeen: new Date()
};

export default function ModernChat() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'me',
        timestamp: new Date(),
        status: 'sent',
        type: 'text'
      };
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Simulate response
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: 'That\'s interesting! Tell me more about it.',
          sender: 'other',
          timestamp: new Date(),
          status: 'delivered',
          type: 'text'
        };
        setMessages(prev => [...prev, response]);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckIcon className="w-4 h-4 text-neutral-400" />;
      case 'delivered':
        return <CheckIconSolid className="w-4 h-4 text-neutral-400" />;
      case 'read':
        return <CheckCircleIconSolid className="w-4 h-4 text-primary-500" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen bg-neutral-50 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={mockUser.image}
                alt={mockUser.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                mockUser.status === 'online' ? 'bg-green-500' : 
                mockUser.status === 'away' ? 'bg-yellow-500' : 'bg-neutral-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">{mockUser.name}</h3>
              <p className="text-sm text-neutral-500">
                {mockUser.status === 'online' ? 'Online' : 
                 mockUser.status === 'away' ? 'Away' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors">
              <PhoneIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors">
              <VideoCameraIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                message.sender === 'me' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {message.sender === 'other' && (
                  <img
                    src={mockUser.image}
                    alt={mockUser.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className={`px-4 py-3 rounded-2xl ${
                  message.sender === 'me'
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'bg-white text-neutral-900 rounded-bl-md border border-neutral-200'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div className={`flex items-center space-x-1 mt-1 ${
                    message.sender === 'me' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className={`text-xs ${
                      message.sender === 'me' ? 'text-primary-100' : 'text-neutral-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                    {message.sender === 'me' && getStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="flex items-end space-x-2">
                <img
                  src={mockUser.image}
                  alt={mockUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-neutral-200 px-4 py-4">
        <div className="flex items-end space-x-3">
          <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors">
            <PaperClipIcon className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 pr-12 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 rounded-lg transition-colors">
              <FaceSmileIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

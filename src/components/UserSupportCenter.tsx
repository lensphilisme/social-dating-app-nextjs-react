'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  PlayIcon,
  SpeakerWaveIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { sendUserSupportMessage, createUserSupportChat } from '@/app/actions/adminReportActions';
// import { SupportChatType, SupportMessageType } from '@prisma/client';

interface UserSupportCenterProps {
  chats: any[];
}

export default function UserSupportCenter({ chats }: UserSupportCenterProps) {
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [newChatSubject, setNewChatSubject] = useState('');
  const [newChatType, setNewChatType] = useState<string>('GENERAL_SUPPORT');
  const [newChatMessage, setNewChatMessage] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'WAITING_USER':
        return 'bg-yellow-100 text-yellow-800';
      case 'WAITING_ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'REPORT_SUPPORT':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'GENERAL_SUPPORT':
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />;
      case 'TECHNICAL_SUPPORT':
        return <DocumentTextIcon className="w-5 h-5 text-purple-500" />;
      case 'ACCOUNT_SUPPORT':
        return <UserIcon className="w-5 h-5 text-green-500" />;
      default:
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <PhotoIcon className="w-5 h-5 text-blue-500" />;
      case 'VIDEO':
        return <PlayIcon className="w-5 h-5 text-purple-500" />;
      case 'AUDIO':
        return <SpeakerWaveIcon className="w-5 h-5 text-green-500" />;
      case 'FILE':
        return <DocumentIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCreateNewChat = async () => {
    if (!newChatSubject.trim() || !newChatMessage.trim()) return;

    setIsCreatingChat(true);
    try {
      const result = await createUserSupportChat(
        newChatType,
        newChatSubject.trim(),
        newChatMessage.trim()
      );

      if (result.success) {
        // Reset form
        setNewChatSubject('');
        setNewChatMessage('');
        setNewChatType('GENERAL_SUPPORT');
        setShowNewChatForm(false);
        
        // Refresh the page to show the new chat
        window.location.reload();
      } else {
        console.error('Error creating chat:', result.error);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isLoading) return;

    setIsLoading(true);
    try {
      const result = await sendUserSupportMessage(selectedChat.id, newMessage.trim());
      if (result.success) {
        setNewMessage('');
        // Refresh the chat or update state
        window.location.reload();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  return (
    <div className="space-y-6">
      {/* Header with New Chat Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Support Chats</h2>
          <p className="text-sm text-gray-500">
            {chats.length} active conversation{chats.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowNewChatForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* New Chat Form */}
      <AnimatePresence>
        {showNewChatForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Start New Support Chat</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chat Type
                </label>
                <select
                  value={newChatType}
                  onChange={(e) => setNewChatType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="GENERAL_SUPPORT">General Support</option>
                  <option value="TECHNICAL_SUPPORT">Technical Support</option>
                  <option value="ACCOUNT_SUPPORT">Account Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={newChatSubject}
                  onChange={(e) => setNewChatSubject(e.target.value)}
                  placeholder="Brief description of your issue..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCreateNewChat}
                  disabled={!newChatSubject.trim() || !newChatMessage.trim() || isCreatingChat}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isCreatingChat ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : null}
                  <span>{isCreatingChat ? 'Creating...' : 'Create Chat'}</span>
                </button>
                <button
                  onClick={() => setShowNewChatForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chats List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Conversations</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {chats.length === 0 ? (
                <div className="p-6 text-center">
                  <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start a new chat to get help from our support team.
                  </p>
                </div>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-primary-50 border-r-2 border-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {getTypeIcon(chat.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {chat.subject || chat.type.replace(/_/g, ' ')}
                          </p>
                          {chat._count.messages > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {chat._count.messages}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {chat.admin?.name || 'Unassigned'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(chat.status)}`}>
                            {chat.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(chat.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedChat.subject || selectedChat.type.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedChat.admin?.name || 'Unassigned Admin'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedChat.status)}`}>
                    {selectedChat.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChat.messages && selectedChat.messages.length > 0 ? (
                  selectedChat.messages.map((message: any) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderType === 'USER'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.type === 'SYSTEM' && (
                          <div className="text-center text-sm text-gray-500 italic mb-2">
                            System Message
                          </div>
                        )}
                        
                        {message.type === 'TEXT' ? (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              {getFileIcon(message.type)}
                              <span className="text-sm font-medium">
                                {message.fileName || 'File'}
                              </span>
                            </div>
                            {message.fileSize && (
                              <p className="text-xs opacity-75">
                                {formatFileSize(message.fileSize)}
                              </p>
                            )}
                            {message.fileUrl && (
                              <a
                                href={message.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm underline hover:no-underline"
                              >
                                View File
                              </a>
                            )}
                          </div>
                        )}
                        
                        <p className={`text-xs mt-1 ${
                          message.senderType === 'USER' ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start the conversation by sending a message.
                    </p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <PaperAirplaneIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow h-[600px] flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a conversation</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a chat from the list to view messages.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

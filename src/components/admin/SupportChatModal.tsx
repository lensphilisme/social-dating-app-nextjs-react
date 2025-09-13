'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  PlayIcon,
  SpeakerWaveIcon,
  DocumentIcon,
  UserIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { getSupportChatMessages, sendSupportMessage, sendUserSupportMessage } from '@/app/actions/adminReportActions';
import { useSession } from 'next-auth/react';

interface SupportChatModalProps {
  chat: any;
  onClose: () => void;
}

export default function SupportChatModal({ chat, onClose }: SupportChatModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    loadMessages();
  }, [chat.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const chatMessages = await getSupportChatMessages(chat.id);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || isLoading || isUploading) return;

    setIsLoading(true);
    try {
      let result;
      const isAdmin = session?.user?.role === 'ADMIN';
      
      if (selectedFile) {
        // Upload file first
        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        uploadFormData.append('folder', 'support');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const uploadResult = await uploadResponse.json();
        
        // Send message with file
        if (isAdmin) {
          result = await sendSupportMessage(
            chat.id, 
            newMessage.trim() || `Sent a file: ${selectedFile.name}`,
            'FILE',
            uploadResult.data.secure_url,
            selectedFile.name,
            selectedFile.size
          );
        } else {
          result = await sendUserSupportMessage(
            chat.id, 
            newMessage.trim() || `Sent a file: ${selectedFile.name}`,
            'FILE',
            uploadResult.data.secure_url,
            selectedFile.name,
            selectedFile.size
          );
        }
        
        setSelectedFile(null);
        setIsUploading(false);
      } else {
        // Send text message
        if (isAdmin) {
          result = await sendSupportMessage(chat.id, newMessage.trim());
        } else {
          result = await sendUserSupportMessage(chat.id, newMessage.trim());
        }
      }
      
      if (result.success) {
        setNewMessage('');
        loadMessages(); // Reload messages to get the new one
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Support Chat
                  </h2>
                  <p className="text-sm text-gray-500">
                    {chat.user?.name || chat.user?.email || 'Unknown User'}
                    {chat.report && ` - Report: ${chat.report.type}`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(90vh-140px)]">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start the conversation by sending a message.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderType === 'ADMIN'
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
                        message.senderType === 'ADMIN' ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              {/* File Preview */}
              {selectedFile && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        📎
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={isLoading || isUploading}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.gif,.webp,.mp4,.avi,.mov,.wmv,.mp3,.wav,.ogg,.pdf,.doc,.docx,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  disabled={isLoading || isUploading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isUploading}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="Attach file"
                >
                  <PaperClipIcon className="w-5 h-5" />
                </button>
                
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    disabled={isLoading || isUploading}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !selectedFile) || isLoading || isUploading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading || isUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <PaperAirplaneIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>
                  {chat.status === 'WAITING_USER' && 'Waiting for user response'}
                  {chat.status === 'WAITING_ADMIN' && 'Waiting for admin response'}
                  {chat.status === 'OPEN' && 'Chat is open'}
                  {chat.status === 'CLOSED' && 'Chat is closed'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

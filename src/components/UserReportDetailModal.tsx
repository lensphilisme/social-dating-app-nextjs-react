'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  PaperClipIcon,
  PhotoIcon,
  PlayIcon,
  SpeakerWaveIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import SupportChatModal from './admin/SupportChatModal';

interface UserReportDetailModalProps {
  report: any;
  onClose: () => void;
  isReceived: boolean;
}

export default function UserReportDetailModal({ 
  report, 
  onClose, 
  isReceived 
}: UserReportDetailModalProps) {
  const [showSupportModal, setShowSupportModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'ASK_MORE_DETAILS':
        return 'bg-orange-100 text-orange-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'DISMISSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INAPPROPRIATE_BEHAVIOR':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'FAKE_PROFILE':
        return <UserIcon className="w-5 h-5 text-orange-500" />;
      case 'SPAM':
        return <DocumentTextIcon className="w-5 h-5 text-yellow-500" />;
      case 'HARASSMENT':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'INAPPROPRIATE_CONTENT':
        return <PhotoIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <PhotoIcon className="w-5 h-5 text-blue-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return <PlayIcon className="w-5 h-5 text-purple-500" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <SpeakerWaveIcon className="w-5 h-5 text-green-500" />;
      default:
        return <PaperClipIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusDescription = (status: string, isReceived: boolean) => {
    if (isReceived) {
      return 'This report has been resolved and action has been taken. This report is now on your record.';
    }
    
    switch (status) {
      case 'PENDING':
        return 'Your report is waiting for admin review';
      case 'UNDER_REVIEW':
        return 'Admin is currently reviewing your report';
      case 'ASK_MORE_DETAILS':
        return 'Admin has requested more information. Please provide additional details.';
      case 'ACCEPTED':
        return 'Your report has been accepted and action will be taken';
      case 'REJECTED':
        return 'Your report has been rejected as invalid or insufficient';
      case 'RESOLVED':
        return 'Your report has been resolved and closed';
      case 'DISMISSED':
        return 'Your report has been dismissed without action';
      default:
        return '';
    }
  };

  const handleOpenSupportChat = async () => {
    if (report.supportChat) {
      setShowSupportModal(true);
    }
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
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {getTypeIcon(report.type)}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Report Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    {report.type.replace(/_/g, ' ')}
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

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  {report.status.replace(/_/g, ' ')}
                </span>
                <span className="text-sm text-gray-500">
                  {report.priority || 'NORMAL'}
                </span>
              </div>

              {/* Users Involved */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Users Involved</h3>
                <div className="space-y-3">
                  {isReceived ? (
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Reported User</p>
                        <p className="text-sm text-gray-500">You</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Reported User</p>
                        <p className="text-sm text-gray-500">
                          {report.reported?.name || report.reported?.email || 'Unknown User'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Report Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Report Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                    {report.reason}
                  </p>
                </div>

                {report.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                      {report.description}
                    </p>
                  </div>
                )}

                {report.proof && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proof</label>
                    <div className="flex items-center space-x-2 text-sm text-blue-600 bg-gray-50 rounded-lg p-3">
                      {getFileIcon(report.proof)}
                      <span>Proof attached</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Status */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Current Status</h3>
                <p className="text-sm text-blue-800">
                  {getStatusDescription(report.status, isReceived)}
                </p>
              </div>

              {/* Admin Notes */}
              {report.adminNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                    {report.adminNotes}
                  </p>
                </div>
              )}

              {/* Support Chat Button */}
              {report.status === 'ASK_MORE_DETAILS' && !isReceived && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleOpenSupportChat}
                    className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                    Provide More Details
                  </button>
                </div>
              )}

              {/* Talk to us button for received reports */}
              {isReceived && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleOpenSupportChat}
                    className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                    Talk to us
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Support Chat Modal */}
      {showSupportModal && report.supportChat && (
        <SupportChatModal
          chat={report.supportChat}
          onClose={() => setShowSupportModal(false)}
        />
      )}
    </AnimatePresence>
  );
}

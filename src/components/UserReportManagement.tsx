'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  PaperClipIcon,
  PhotoIcon,
  PlayIcon,
  SpeakerWaveIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';
// import { ReportStatus } from '@prisma/client';
import UserReportDetailModal from './UserReportDetailModal';
import SupportChatModal from './admin/SupportChatModal';

interface UserReportManagementProps {
  sentReports: any[];
  receivedReports: any[];
}

export default function UserReportManagement({ sentReports, receivedReports }: UserReportManagementProps) {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [isLoading, setIsLoading] = useState(false);

  const tabs: Array<{ id: 'sent' | 'received'; name: string; count: number }> = [
    { id: 'sent', name: 'Reports Sent', count: sentReports.length },
    { id: 'received', name: 'Reports Received', count: receivedReports.length }
  ];

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

  const getStatusDescription = (status: string, isReceived: boolean = false): string => {
    if (isReceived) {
      // For received reports, they only see RESOLVED status
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

  const filteredReports = activeTab === 'sent' ? sentReports : receivedReports;

  const handleOpenSupportChat = async (report: any) => {
    if (report.supportChat) {
      setSelectedChat(report.supportChat);
    } else {
      // Create new support chat if needed
      try {
        // This would be handled by the backend
        console.log('Creating support chat for report:', report.id);
      } catch (error) {
        console.error('Error creating support chat:', error);
      }
    }
    setShowSupportModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'sent' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Reports You Sent</h3>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New Report
                </button>
              </div>

              {filteredReports.length === 0 ? (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reports sent</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven&apos;t sent any reports yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {getTypeIcon(report.type)}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {report.type.replace(/_/g, ' ')}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Reported: {report.reported.name || report.reported.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mb-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                              {report.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-gray-700 mb-3">{report.reason}</p>
                          
                          {report.description && (
                            <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                          )}

                          <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-700">{getStatusDescription(report.status, (activeTab as string) === 'received')}</p>
                          </div>

                          {report.proof && (
                            <div className="flex items-center space-x-2 text-sm text-blue-600">
                              {getFileIcon(report.proof)}
                              <span>Proof attached</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowReportModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="View Details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>

                          {report.status === 'ASK_MORE_DETAILS' && (
                            <button
                              onClick={() => handleOpenSupportChat(report)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                              title="Provide More Details"
                            >
                              <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'received' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Reports You Received</h3>

              {filteredReports.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reports received</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven&apos;t received any reports.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {getTypeIcon(report.type)}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {report.type.replace(/_/g, ' ')}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Reported by: {report.reporter.name || report.reporter.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mb-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                              {report.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-gray-700 mb-3">{report.reason}</p>
                          
                          {report.description && (
                            <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                          )}

                          <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-700">{getStatusDescription(report.status, (activeTab as string) === 'received')}</p>
                          </div>

                          {report.proof && (
                            <div className="flex items-center space-x-2 text-sm text-blue-600">
                              {getFileIcon(report.proof)}
                              <span>Proof attached</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowReportModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="View Details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showReportModal && selectedReport && (
          <UserReportDetailModal
            report={selectedReport}
            onClose={() => {
              setShowReportModal(false);
              setSelectedReport(null);
            }}
            isReceived={activeTab === 'received'}
          />
        )}

        {showSupportModal && selectedChat && (
          <SupportChatModal
            chat={selectedChat}
            onClose={() => {
              setShowSupportModal(false);
              setSelectedChat(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

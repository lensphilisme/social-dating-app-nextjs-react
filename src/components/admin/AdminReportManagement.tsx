'use client';

import { useState, useEffect } from 'react';
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
  PlayIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';
import { ReportStatus } from '@prisma/client';
import { 
  updateReportStatus, 
  assignReportToAdmin, 
  getAdminSupportChats,
  getSupportChatMessages,
  sendSupportMessage
} from '@/app/actions/adminReportActions';
import { useSession } from 'next-auth/react';
import ReportDetailModal from './ReportDetailModal';
import SupportChatModal from './SupportChatModal';

interface AdminReportManagementProps {
  reports: any[];
  statistics: any;
}

export default function AdminReportManagement({ reports, statistics }: AdminReportManagementProps) {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [supportChats, setSupportChats] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  
  const { data: session } = useSession();

  const tabs = [
    { id: 'reports', name: 'Reports', count: reports.length },
    { id: 'support', name: 'Support Center', count: supportChats.length },
    { id: 'statistics', name: 'Statistics', count: 0 }
  ];

  // Load support chats when support tab is active
  const loadSupportChats = async () => {
    if (activeTab === 'support' && supportChats.length === 0) {
      setIsLoadingChats(true);
      try {
        const chats = await getAdminSupportChats();
        setSupportChats(chats);
      } catch (error) {
        console.error('Error loading support chats:', error);
      } finally {
        setIsLoadingChats(false);
      }
    }
  };

  // Load support chats when tab changes
  useEffect(() => {
    loadSupportChats();
  }, [activeTab]);

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800';
      case 'LOW':
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

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || report.priority === filterPriority;
    const matchesSearch = searchQuery === '' || 
      report.reporter.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reported.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleStatusUpdate = async (reportId: string, status: ReportStatus, notes?: string) => {
    setIsLoading(true);
    try {
      const result = await updateReportStatus(reportId, status, notes, session?.user?.id);
      if (result.success) {
        // Refresh the page or update state
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating report status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignReport = async (reportId: string) => {
    setIsLoading(true);
    try {
      const result = await assignReportToAdmin(reportId, session?.user?.id || '');
      if (result.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error assigning report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSupportChat = async (report: any) => {
    if (report.supportChat) {
      setSelectedChat(report.supportChat);
    } else {
      // Create new support chat
      try {
        const result = await updateReportStatus(report.id, 'ASK_MORE_DETAILS', 'Requesting more details', session?.user?.id);
        if (result.success) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Error creating support chat:', error);
      }
    }
    setShowSupportModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics?.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Under Review</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics?.underReview || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics?.resolved || 0}</p>
            </div>
          </div>
        </div>
      </div>

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
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="ASK_MORE_DETAILS">Ask More Details</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="DISMISSED">Dismissed</option>
                  </select>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Priority</option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="NORMAL">Normal</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              {/* Reports List */}
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
                              Reported by {report.reporter.name || report.reporter.email} against {report.reported.name || report.reported.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status.replace(/_/g, ' ')}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                            {report.priority}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-gray-700 mb-3">{report.reason}</p>
                        
                        {report.description && (
                          <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                        )}

                        {report.proof && (
                          <div className="flex items-center space-x-2 text-sm text-blue-600">
                            <PaperClipIcon className="w-4 h-4" />
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

                        {report.status === 'PENDING' && (
                          <button
                            onClick={() => handleAssignReport(report.id)}
                            disabled={isLoading}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            Assign to Me
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenSupportChat(report)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Open Support Chat"
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredReports.length === 0 && (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                        ? 'Try adjusting your filters or search terms.'
                        : 'No reports have been submitted yet.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Support Chats</h3>
                <button
                  onClick={loadSupportChats}
                  className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Refresh
                </button>
              </div>

              {isLoadingChats ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : supportChats.length === 0 ? (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No support chats</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No support chats available at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {supportChats.map((chat) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedChat(chat);
                        setShowSupportModal(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-500" />
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {chat.user?.name || chat.user?.email || 'Unknown User'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {chat.type.replace(/_/g, ' ')} - {chat.subject || 'No subject'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mb-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              chat.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                              chat.status === 'WAITING_USER' ? 'bg-yellow-100 text-yellow-800' :
                              chat.status === 'WAITING_ADMIN' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {chat.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(chat.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {chat.report && (
                            <div className="bg-blue-50 rounded-lg p-3 mb-3">
                              <p className="text-sm text-blue-700">
                                Related to report: {chat.report.type.replace(/_/g, ' ')}
                              </p>
                            </div>
                          )}

                          {chat.messages && chat.messages.length > 0 && (
                            <div className="text-sm text-gray-600">
                              Last message: {chat.messages[0].content.substring(0, 100)}
                              {chat.messages[0].content.length > 100 && '...'}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChat(chat);
                              setShowSupportModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Open Chat"
                          >
                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Reports by Type</h3>
                  <div className="space-y-2">
                    {statistics?.byType?.map((item: any) => (
                      <div key={item.type} className="flex justify-between">
                        <span className="text-sm text-gray-600">{item.type.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-medium text-gray-900">{item._count.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Reports by Priority</h3>
                  <div className="space-y-2">
                    {statistics?.byPriority?.map((item: any) => (
                      <div key={item.priority} className="flex justify-between">
                        <span className="text-sm text-gray-600">{item.priority}</span>
                        <span className="text-sm font-medium text-gray-900">{item._count.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showReportModal && selectedReport && (
          <ReportDetailModal
            report={selectedReport}
            onClose={() => {
              setShowReportModal(false);
              setSelectedReport(null);
            }}
            onStatusUpdate={handleStatusUpdate}
            isLoading={isLoading}
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

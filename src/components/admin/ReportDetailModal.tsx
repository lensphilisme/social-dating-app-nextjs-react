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
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { ReportStatus } from '@prisma/client';
import ReportSupportFlow from './ReportSupportFlow';

interface ReportDetailModalProps {
  report: any;
  onClose: () => void;
  onStatusUpdate: (reportId: string, status: ReportStatus, notes?: string) => void;
  isLoading: boolean;
}

export default function ReportDetailModal({ 
  report, 
  onClose, 
  onStatusUpdate, 
  isLoading 
}: ReportDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>(report.status);
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || '');
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showReportSupportFlow, setShowReportSupportFlow] = useState(false);

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

  const handleStatusUpdate = () => {
    if (selectedStatus === 'ASK_MORE_DETAILS') {
      setShowReportSupportFlow(true);
    } else {
      onStatusUpdate(report.id, selectedStatus, adminNotes);
      setShowStatusUpdate(false);
    }
  };

  const getStatusDescription = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Report is waiting for admin review';
      case 'UNDER_REVIEW':
        return 'Admin is currently reviewing this report';
      case 'ASK_MORE_DETAILS':
        return 'Admin has requested more information from the reporter';
      case 'ACCEPTED':
        return 'Report has been accepted and action will be taken';
      case 'REJECTED':
        return 'Report has been rejected as invalid or insufficient';
      case 'RESOLVED':
        return 'Report has been resolved and closed';
      case 'DISMISSED':
        return 'Report has been dismissed without action';
      default:
        return '';
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
            className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Report Details
                </h2>
                <p className="text-sm text-gray-500">
                  {report.type.replace(/_/g, ' ')} - {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Report Info */}
                <div className="space-y-6">
                  {/* Status and Priority */}
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                      {report.status.replace(/_/g, ' ')}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                  </div>

                  {/* Users Involved */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Users Involved</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Reporter</p>
                          <p className="text-sm text-gray-500">
                            {report.reporter.name || report.reporter.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <UserIcon className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Reported User</p>
                          <p className="text-sm text-gray-500">
                            {report.reported.name || report.reported.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Report Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Report Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Reason</p>
                        <p className="text-sm text-gray-700 mt-1">{report.reason}</p>
                      </div>
                      {report.description && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Description</p>
                          <p className="text-sm text-gray-700 mt-1">{report.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proof/Evidence */}
                  {report.proof && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Proof/Evidence</h3>
                      <div className="flex items-center space-x-2">
                        {getFileIcon(report.proof)}
                        <a
                          href={report.proof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Evidence
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Admin Actions */}
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Current Status</h3>
                    <p className="text-sm text-blue-700">{getStatusDescription(report.status)}</p>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Add notes about this report..."
                    />
                  </div>

                  {/* Status Update */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Update Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as ReportStatus)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="ASK_MORE_DETAILS">Ask More Details</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="DISMISSED">Dismissed</option>
                    </select>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSelectedStatus('ACCEPTED');
                          handleStatusUpdate();
                        }}
                        disabled={isLoading}
                        className="flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStatus('REJECTED');
                          handleStatusUpdate();
                        }}
                        disabled={isLoading}
                        className="flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => setShowReportSupportFlow(true)}
                        disabled={isLoading}
                        className="flex items-center justify-center px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 disabled:opacity-50"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                        Ask Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStatus('RESOLVED');
                          handleStatusUpdate();
                        }}
                        disabled={isLoading}
                        className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Resolve
                      </button>
                    </div>
                  </div>

                  {/* Update Button */}
                  <button
                    onClick={handleStatusUpdate}
                    disabled={isLoading || selectedStatus === report.status}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Report Support Flow Modal */}
      {showReportSupportFlow && (
        <ReportSupportFlow
          report={report}
          onClose={() => setShowReportSupportFlow(false)}
          onSuccess={() => {
            setShowReportSupportFlow(false);
            onStatusUpdate(report.id, 'ASK_MORE_DETAILS', adminNotes);
          }}
        />
      )}
    </AnimatePresence>
  );
}

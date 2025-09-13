'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { assignModerationItem, resolveModerationItem } from '@/app/actions/adminSystemActions';
import { approvePhoto, rejectPhoto } from '@/app/actions/adminActions';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AdvancedModerationProps {
  moderationQueue: {
    items: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  unapprovedPhotos: any[];
}

export default function AdvancedModeration({ moderationQueue, unapprovedPhotos }: AdvancedModerationProps) {
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveAction, setResolveAction] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  const tabs = [
    { id: 'queue', name: 'Moderation Queue', count: moderationQueue.total },
    { id: 'photos', name: 'Photo Moderation', count: unapprovedPhotos.length },
    { id: 'reports', name: 'User Reports', count: 0 },
    { id: 'rules', name: 'Moderation Rules', count: 0 }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PHOTO':
        return <PhotoIcon className="w-5 h-5" />;
      case 'MESSAGE':
        return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
      case 'PROFILE':
        return <UserIcon className="w-5 h-5" />;
      default:
        return <DocumentTextIcon className="w-5 h-5" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssignItem = async (itemId: string) => {
    try {
      if (!session?.user?.id) {
        console.error('No admin session found');
        return;
      }
      await assignModerationItem(itemId, session.user.id);
      router.refresh();
    } catch (error) {
      console.error('Error assigning item:', error);
    }
  };

  const handleResolveItem = async () => {
    if (!selectedItem || !resolveAction) return;

    try {
      await resolveModerationItem(selectedItem.id, resolveAction, resolveNotes);
      setShowResolveModal(false);
      setSelectedItem(null);
      setResolveAction('');
      setResolveNotes('');
      router.refresh();
    } catch (error) {
      console.error('Error resolving item:', error);
    }
  };

  const handleApprovePhoto = async (photoId: string) => {
    try {
      await approvePhoto(photoId);
      router.refresh();
    } catch (error) {
      console.error('Error approving photo:', error);
    }
  };

  const handleRejectPhoto = async (photo: any) => {
    try {
      await rejectPhoto(photo);
      router.refresh();
    } catch (error) {
      console.error('Error rejecting photo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
              <p className="mt-1 text-sm text-gray-500">
                Review and moderate user-generated content
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Pending Items</p>
                <p className="text-2xl font-bold text-orange-600">{moderationQueue.total + unapprovedPhotos.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Moderation Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            {moderationQueue.items.length === 0 ? (
              <div className="text-center py-12">
                <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending items</h3>
                <p className="mt-1 text-sm text-gray-500">All content has been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {moderationQueue.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getTypeIcon(item.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {item.type} Moderation
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Target ID: {item.targetId} • Created: {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                          {item.reason && (
                            <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.status === 'PENDING' && (
                          <button
                            onClick={() => handleAssignItem(item.id)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Assign to Me
                          </button>
                        )}
                        {item.status === 'IN_REVIEW' && (
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowResolveModal(true);
                            }}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Photo Moderation */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            {unapprovedPhotos.length === 0 ? (
              <div className="text-center py-12">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No photos pending approval</h3>
                <p className="mt-1 text-sm text-gray-500">All photos have been reviewed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unapprovedPhotos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="aspect-square">
                      <img
                        src={photo.url}
                        alt="Photo for moderation"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Member: {photo.member?.name}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(photo.createdAt || '').toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprovePhoto(photo.id)}
                          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectPhoto(photo)}
                          className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                        >
                          <XCircleIcon className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">User Reports</h3>
              <p className="mt-1 text-sm text-gray-500">
                The comprehensive report management system is now available in the dedicated Reports section.
              </p>
              <div className="mt-4">
                <a
                  href="/admin/reports"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Go to Reports Management
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="text-center py-12">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Moderation Rules</h3>
            <p className="mt-1 text-sm text-gray-500">Feature coming soon.</p>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {showResolveModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Resolve Moderation Item</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <select
                  value={resolveAction}
                  onChange={(e) => setResolveAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select action</option>
                  <option value="APPROVE">Approve</option>
                  <option value="REJECT">Reject</option>
                  <option value="FLAG">Flag</option>
                  <option value="BAN_USER">Ban User</option>
                  <option value="DELETE_CONTENT">Delete Content</option>
                  <option value="WARN_USER">Warn User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add notes about this decision..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setSelectedItem(null);
                  setResolveAction('');
                  setResolveNotes('');
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveItem}
                disabled={!resolveAction}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

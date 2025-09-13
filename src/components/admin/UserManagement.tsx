'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  UserIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { banUser, unbanUser, bulkVerifyUsers, bulkBanUsers, bulkUnbanUsers } from '@/app/actions/adminSystemActions';
import { manuallyVerifyUser } from '@/app/actions/adminActions';
import { useRouter } from 'next/navigation';
import UserEditModal from './UserEditModal';
import UserMediaModal from './UserMediaModal';

interface UserManagementProps {
  usersData: {
    users: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  currentPage: number;
  searchQuery: string;
}

export default function UserManagement({ usersData, currentPage, searchQuery }: UserManagementProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [banModal, setBanModal] = useState<{ isOpen: boolean; userId: string; userName: string }>({
    isOpen: false,
    userId: '',
    userName: ''
  });
  const [bulkBanModal, setBulkBanModal] = useState<{ isOpen: boolean; userIds: string[] }>({
    isOpen: false,
    userIds: []
  });
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; user: any }>({
    isOpen: false,
    user: null
  });
  const [mediaModal, setMediaModal] = useState<{ isOpen: boolean; user: any }>({
    isOpen: false,
    user: null
  });
  const router = useRouter();

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === usersData.users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(usersData.users.map(user => user.id));
    }
  };

  const handleBanUser = async () => {
    try {
      await banUser(banModal.userId, banReason, banDuration || undefined);
      setBanModal({ isOpen: false, userId: '', userName: '' });
      setBanReason('');
      setBanDuration(null);
      router.refresh();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleUnbanUser = async (banId: string) => {
    try {
      await unbanUser(banId);
      router.refresh();
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      await manuallyVerifyUser(userId);
      router.refresh();
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const handleBulkVerify = async () => {
    if (selectedUsers.length === 0) return;
    
    setIsLoading(true);
    try {
      const result = await bulkVerifyUsers(selectedUsers);
      alert(result.message);
      setSelectedUsers([]);
      router.refresh();
    } catch (error) {
      console.error('Error bulk verifying users:', error);
      alert('Error verifying users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkBan = async () => {
    if (selectedUsers.length === 0) return;
    
    setBulkBanModal({ isOpen: true, userIds: selectedUsers });
  };

  const handleBulkBanConfirm = async () => {
    if (!banReason.trim()) {
      alert('Please enter a ban reason');
      return;
    }

    setIsLoading(true);
    try {
      const result = await bulkBanUsers(bulkBanModal.userIds, banReason, banDuration || undefined);
      alert(result.message);
      setBulkBanModal({ isOpen: false, userIds: [] });
      setBanReason('');
      setBanDuration(null);
      setSelectedUsers([]);
      router.refresh();
    } catch (error) {
      console.error('Error bulk banning users:', error);
      alert('Error banning users');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (user: any) => {
    if (user.bans.length > 0) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <NoSymbolIcon className="w-3 h-3 mr-1" />
            Banned
          </span>
        );
    }
    if (!user.emailVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Unverified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="w-3 h-3 mr-1" />
        Active
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    return role === 'ADMIN' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        <ShieldCheckIcon className="w-3 h-3 mr-1" />
        Admin
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <UserIcon className="w-3 h-3 mr-1" />
        Member
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage user accounts, permissions, and moderation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{usersData.total.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  defaultValue={searchQuery}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value;
                      router.push(`/admin/users?search=${encodeURIComponent(value)}`);
                    }
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleBulkVerify}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Verifying...' : 'Bulk Verify'}
                </button>
                <button 
                  onClick={handleBulkBan}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Bulk Ban
                </button>
                <button 
                  onClick={() => setSelectedUsers([])}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === usersData.users.length && usersData.users.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersData.users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.image || '/images/user.png'}
                            alt={user.name || 'User'}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'Unnamed User'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>Reports: {user._count.reportsReceived}</div>
                        <div>Media: {user._count.media}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/members/${user.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Profile"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditModal({ isOpen: true, user })}
                          className="text-purple-600 hover:text-purple-900"
                          title="Edit User"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMediaModal({ isOpen: true, user })}
                          className="text-orange-600 hover:text-orange-900"
                          title="Manage Media"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        {!user.emailVerified && (
                          <button
                            onClick={() => handleVerifyUser(user.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Verify Email"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        {user.bans.length === 0 ? (
                          <button
                            onClick={() => setBanModal({ isOpen: true, userId: user.id, userName: user.name || 'User' })}
                            className="text-red-600 hover:text-red-900"
                            title="Ban User"
                          >
                            <NoSymbolIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnbanUser(user.bans[0].id)}
                            className="text-green-600 hover:text-green-900"
                            title="Unban User"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {usersData.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * usersData.limit) + 1} to {Math.min(currentPage * usersData.limit, usersData.total)} of {usersData.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/admin/users?page=${currentPage - 1}${searchQuery ? `&search=${searchQuery}` : ''}`)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {usersData.totalPages}
              </span>
              <button
                onClick={() => router.push(`/admin/users?page=${currentPage + 1}${searchQuery ? `&search=${searchQuery}` : ''}`)}
                disabled={currentPage === usersData.totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {banModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ban User: {banModal.userName}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Ban
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter reason for banning this user..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days, leave empty for permanent)
                </label>
                <input
                  type="number"
                  value={banDuration || ''}
                  onChange={(e) => setBanDuration(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 7 for 7 days"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setBanModal({ isOpen: false, userId: '', userName: '' })}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                disabled={!banReason.trim()}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Ban Modal */}
      {bulkBanModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bulk Ban {bulkBanModal.userIds.length} Users
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Ban
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter reason for banning these users..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days, leave empty for permanent)
                </label>
                <input
                  type="number"
                  value={banDuration || ''}
                  onChange={(e) => setBanDuration(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 7 for 7 days"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setBulkBanModal({ isOpen: false, userIds: [] })}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkBanConfirm}
                disabled={!banReason.trim() || isLoading}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Banning...' : 'Ban Users'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      <UserEditModal
        user={editModal.user}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, user: null })}
        onSuccess={() => router.refresh()}
      />

      {/* User Media Modal */}
      <UserMediaModal
        user={mediaModal.user}
        isOpen={mediaModal.isOpen}
        onClose={() => setMediaModal({ isOpen: false, user: null })}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

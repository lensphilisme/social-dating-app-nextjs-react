'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  UsersIcon as UsersIconSolid,
  HeartIcon as HeartIconSolid,
  ChatBubbleLeftRightIcon as ChatIconSolid,
  PhotoIcon as PhotoIconSolid
} from '@heroicons/react/24/solid';

interface AdminDashboardProps {
  analytics: any;
  settings: any[];
  recentActivity: any[];
  systemStats: any;
}

export default function AdminDashboard({ analytics, settings, recentActivity, systemStats }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'users', name: 'Users', icon: UsersIcon },
    { id: 'moderation', name: 'Moderation', icon: ShieldCheckIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon }
  ];

  const stats = [
    {
      name: 'Total Users',
      value: systemStats.totalUsers,
      change: `+${systemStats.newUsersToday} today`,
      changeType: 'positive',
      icon: UsersIconSolid,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Matches',
      value: systemStats.totalMatches,
      change: `+${systemStats.newMatchesToday} today`,
      changeType: 'positive',
      icon: HeartIconSolid,
      color: 'bg-pink-500'
    },
    {
      name: 'Messages Sent',
      value: systemStats.totalMessages,
      change: `+${systemStats.newMessagesToday} today`,
      changeType: 'positive',
      icon: ChatIconSolid,
      color: 'bg-green-500'
    },
    {
      name: 'Photos Uploaded',
      value: analytics.overview.totalPhotos,
      change: `${systemStats.pendingPhotos} pending`,
      changeType: 'neutral',
      icon: PhotoIconSolid,
      color: 'bg-purple-500'
    }
  ];

  const quickActions = [
    {
      name: 'View All Users',
      description: 'Manage user accounts and permissions',
      icon: UserGroupIcon,
      href: '/admin/users',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Moderation Queue',
      description: 'Review pending content and reports',
      icon: ShieldCheckIcon,
      href: '/admin/moderation',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      name: 'System Settings',
      description: 'Configure site settings and preferences',
      icon: CogIcon,
      href: '/admin/settings',
      color: 'bg-gray-500 hover:bg-gray-600'
    },
    {
      name: 'Theme Management',
      description: 'Customize site appearance and branding',
      icon: EyeIcon,
      href: '/admin/themes',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const alerts = [
    ...(systemStats.pendingModeration > 0 ? [{
      id: 1,
      type: 'warning',
      title: 'Pending Moderation',
      message: `${systemStats.pendingModeration} items need attention`,
      action: 'Review Now',
      href: '/admin/moderation'
    }] : []),
    ...(systemStats.pendingPhotos > 0 ? [{
      id: 2,
      type: 'info',
      title: 'Photo Moderation',
      message: `${systemStats.pendingPhotos} photos awaiting approval`,
      action: 'Moderate',
      href: '/admin/moderation'
    }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to the admin dashboard. Monitor and manage your platform.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    alert.type === 'error' ? 'bg-red-50 border-red-400' :
                    'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                    <a
                      href={alert.href}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                        alert.type === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                        'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      } transition-colors`}
                    >
                      {alert.action}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.a
                key={action.name}
                href={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${action.color} transition-colors`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.name}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.color === 'green' ? 'bg-green-500' :
                      activity.color === 'blue' ? 'bg-blue-500' :
                      activity.color === 'yellow' ? 'bg-yellow-500' :
                      activity.color === 'purple' ? 'bg-purple-500' :
                      activity.color === 'pink' ? 'bg-pink-500' :
                      activity.color === 'orange' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

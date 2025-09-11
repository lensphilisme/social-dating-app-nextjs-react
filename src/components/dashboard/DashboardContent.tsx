'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon,
  EyeIcon,
  FireIcon,
  StarIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
  ChatBubbleLeftRightIcon as ChatIconSolid,
  UserGroupIcon as UserGroupIconSolid
} from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { calculateProfileCompletion } from '@/lib/profileCompletion';

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'like' | 'match' | 'message' | 'view';
  user: {
    name: string;
    image: string;
  };
  time: string;
  message?: string;
}



interface DashboardData {
  totalLikes: number;
  totalMatches: number;
  totalMessages: number;
  profileViews: number;
  todayLikes: number;
  todayMatches: number;
  todayMessages: number;
  profileCompletion: number;
  recentActivity: RecentActivity[];
}

export default function DashboardContent() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalLikes: 0,
    totalMatches: 0,
    totalMessages: 0,
    profileViews: 0,
    todayLikes: 0,
    todayMatches: 0,
    todayMessages: 0,
    profileCompletion: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session?.user?.id]);

  const stats: StatCard[] = [
    {
      title: 'Likes Received',
      value: loading ? '...' : dashboardData.todayLikes,
      change: dashboardData.todayLikes > 0 ? `+${dashboardData.todayLikes} today` : '0 today',
      changeType: 'positive',
      icon: HeartIconSolid,
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'New Matches',
      value: loading ? '...' : dashboardData.todayMatches,
      change: dashboardData.todayMatches > 0 ? `+${dashboardData.todayMatches} today` : '0 today',
      changeType: 'positive',
      icon: FireIcon,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Messages Sent',
      value: loading ? '...' : dashboardData.todayMessages,
      change: dashboardData.todayMessages > 0 ? `+${dashboardData.todayMessages} today` : '0 today',
      changeType: 'positive',
      icon: ChatIconSolid,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Profile Completion',
      value: loading ? '...' : `${dashboardData.profileCompletion}%`,
      change: dashboardData.profileCompletion === 100 ? 'Complete' : 'Incomplete',
      changeType: dashboardData.profileCompletion === 100 ? 'positive' : 'neutral',
      icon: EyeIcon,
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like': return HeartIconSolid;
      case 'match': return FireIcon;
      case 'message': return ChatIconSolid;
      case 'view': return EyeIcon;
      default: return StarIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'like': return 'text-pink-500';
      case 'match': return 'text-orange-500';
      case 'message': return 'text-blue-500';
      case 'view': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-neutral-900 mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-neutral-600 text-lg">
                Here's what's happening with your love life today
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-neutral-500">Current time</p>
                <p className="text-lg font-mono font-semibold text-neutral-900">
                  {currentTime.toLocaleTimeString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">JD</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-200/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' 
                      ? 'text-green-600 bg-green-50' 
                      : stat.changeType === 'negative'
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-600 bg-gray-50'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</h3>
                <p className="text-neutral-600 text-sm">{stat.title}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Recent Activity</h2>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type);
                  const iconColor = getActivityColor(activity.type);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={activity.user.image}
                          alt={activity.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-white`}>
                          <Icon className={`w-3 h-3 ${iconColor}`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900">{activity.user.name}</p>
                        <p className="text-sm text-neutral-600">{activity.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">{activity.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200/50">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/discover"
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 transition-all duration-200"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span className="font-medium">Discover People</span>
                </Link>
                <Link
                  href="/messages"
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  <span className="font-medium">View Messages</span>
                </Link>
                <Link
                  href="/members"
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  <UserGroupIcon className="w-5 h-5" />
                  <span className="font-medium">Browse Members</span>
                </Link>
              </div>
            </div>

            {/* Today's Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200/50">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Today's Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <HeartIcon className="w-4 h-4 text-pink-600" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">Likes received</span>
                  </div>
                  <span className="font-bold text-neutral-900">{loading ? '...' : dashboardData.todayLikes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FireIcon className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">New matches</span>
                  </div>
                  <span className="font-bold text-neutral-900">{loading ? '...' : dashboardData.todayMatches}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">Messages sent</span>
                  </div>
                  <span className="font-bold text-neutral-900">{loading ? '...' : dashboardData.todayMessages}</span>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-200/50">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Profile Completion</h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700">
                    {loading ? '...' : `${dashboardData.profileCompletion}% Complete`}
                  </span>
                  <span className="text-sm text-primary-600 font-medium">
                    {loading ? '...' : dashboardData.profileCompletion === 100 ? 'Complete!' : 'Keep going!'}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: loading ? '0%' : `${dashboardData.profileCompletion}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-neutral-600 mb-4">
                {loading ? 'Loading...' : 
                 dashboardData.profileCompletion === 100 ? 
                 'Your profile is complete! 🎉' : 
                 'Add more details to get more matches!'}
              </p>
              <Link 
                href="/profile"
                className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors block text-center"
              >
                {loading ? 'Loading...' : 'Complete Profile'}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

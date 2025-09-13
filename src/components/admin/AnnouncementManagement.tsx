'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  GiftIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { 
  getAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement,
  getAnnouncementStats 
} from '@/app/actions/announcementActions';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  showDelay: number;
  duration: number;
  maxViews?: number;
  targetUsers?: string;
  styling?: any;
  createdAt: string;
  creator: {
    name: string;
    email: string;
  };
  _count: {
    views: number;
  };
}

interface AnnouncementFormData {
  title: string;
  message: string;
  type: string;
  priority: string;
  startDate: string;
  endDate: string;
  showDelay: number;
  duration: number;
  maxViews: number;
  targetUsers: string;
  styling: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    borderStyle: string;
    fontSize: string;
    borderRadius: string;
    fontFamily: string;
  };
}

const typeOptions = [
  { value: 'INFO', label: 'Information', icon: InformationCircleIcon, color: 'text-blue-500' },
  { value: 'WARNING', label: 'Warning', icon: ExclamationTriangleIcon, color: 'text-yellow-500' },
  { value: 'SUCCESS', label: 'Success', icon: CheckCircleIcon, color: 'text-green-500' },
  { value: 'ERROR', label: 'Error', icon: XCircleIcon, color: 'text-red-500' },
  { value: 'PROMOTION', label: 'Promotion', icon: GiftIcon, color: 'text-purple-500' },
  { value: 'MAINTENANCE', label: 'Maintenance', icon: WrenchScrewdriverIcon, color: 'text-orange-500' }
];

const priorityOptions = [
  { value: 'LOW', label: 'Low', color: 'text-gray-500' },
  { value: 'NORMAL', label: 'Normal', color: 'text-blue-500' },
  { value: 'HIGH', label: 'High', color: 'text-orange-500' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-500' }
];

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    message: '',
    type: 'INFO',
    priority: 'NORMAL',
    startDate: '',
    endDate: '',
    showDelay: 0,
    duration: 10,
    maxViews: 0,
    targetUsers: 'all',
    styling: {
      backgroundColor: '',
      textColor: '',
      borderColor: '',
      borderStyle: 'solid',
      fontSize: '14px',
      borderRadius: '8px',
      fontFamily: ''
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [announcementsData, statsData] = await Promise.all([
        getAnnouncements(),
        getAnnouncementStats()
      ]);
      setAnnouncements(announcementsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        maxViews: formData.maxViews || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        styling: Object.values(formData.styling).some(v => v) ? formData.styling : undefined
      };

      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, data);
        toast.success('Announcement updated successfully');
      } else {
        await createAnnouncement(data);
        toast.success('Announcement created successfully');
      }

      setShowForm(false);
      setEditingAnnouncement(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      priority: announcement.priority,
      startDate: announcement.startDate ? announcement.startDate.split('T')[0] : '',
      endDate: announcement.endDate ? announcement.endDate.split('T')[0] : '',
      showDelay: announcement.showDelay,
      duration: announcement.duration,
      maxViews: announcement.maxViews || 0,
      targetUsers: announcement.targetUsers || 'all',
      styling: announcement.styling || {
        backgroundColor: '',
        textColor: '',
        borderColor: '',
        borderStyle: 'solid',
        fontSize: '14px',
        borderRadius: '8px'
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await deleteAnnouncement(id);
      toast.success('Announcement deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateAnnouncement(id, { isActive: !isActive });
      toast.success(`Announcement ${!isActive ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error toggling announcement:', error);
      toast.error('Failed to update announcement');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'INFO',
      priority: 'NORMAL',
      startDate: '',
      endDate: '',
      showDelay: 0,
      duration: 10,
      maxViews: 0,
      targetUsers: 'all',
      styling: {
        backgroundColor: '',
        textColor: '',
        borderColor: '',
        borderStyle: 'solid',
        fontSize: '14px',
        borderRadius: '8px',
        fontFamily: ''
      }
    });
  };

  const getTypeIcon = (type: string) => {
    const typeOption = typeOptions.find(t => t.value === type);
    return typeOption ? typeOption.icon : InformationCircleIcon;
  };

  const getTypeColor = (type: string) => {
    const typeOption = typeOptions.find(t => t.value === type);
    return typeOption ? typeOption.color : 'text-blue-500';
  };

  const getPriorityColor = (priority: string) => {
    const priorityOption = priorityOptions.find(p => p.value === priority);
    return priorityOption ? priorityOption.color : 'text-blue-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Announcement Management</h2>
          <p className="text-gray-600">Manage live announcements and notifications</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <InformationCircleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Announcements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAnnouncements}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <EyeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <EyeSlashIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dismissed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.dismissedViews}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.engagementRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Announcements</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {announcements.map((announcement) => {
            const TypeIcon = getTypeIcon(announcement.type);
            return (
              <div key={announcement.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${getTypeColor(announcement.type).replace('text-', 'bg-').replace('-500', '-100')}`}>
                      <TypeIcon className={`w-5 h-5 ${getTypeColor(announcement.type)}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{announcement.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(announcement.priority).replace('text-', 'bg-').replace('-500', '-100')} ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                        {announcement.isActive ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{announcement.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          Delay: {announcement.showDelay}s
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          Duration: {announcement.duration}s
                        </div>
                        <div className="flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          Views: {announcement._count.views}
                        </div>
                        <div className="flex items-center">
                          <UsersIcon className="w-4 h-4 mr-1" />
                          Target: {announcement.targetUsers}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(announcement.id, announcement.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        announcement.isActive 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={announcement.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {announcement.isActive ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingAnnouncement(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Announcement title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {typeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Announcement message"
                    />
                  </div>

                  {/* Timing Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Show Delay (seconds)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.showDelay}
                        onChange={(e) => setFormData({ ...formData, showDelay: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (seconds)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 10 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Views (0 = unlimited)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.maxViews}
                        onChange={(e) => setFormData({ ...formData, maxViews: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Target Users */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Users
                    </label>
                    <input
                      type="text"
                      value={formData.targetUsers}
                      onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="all or comma-separated user IDs"
                    />
                  </div>

                  {/* Styling Options */}
                  <div className="border-t pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Custom Styling (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Color
                        </label>
                        <input
                          type="color"
                          value={formData.styling.backgroundColor}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            styling: { ...formData.styling, backgroundColor: e.target.value }
                          })}
                          className="w-full h-10 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={formData.styling.textColor}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            styling: { ...formData.styling, textColor: e.target.value }
                          })}
                          className="w-full h-10 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Border Color
                        </label>
                        <input
                          type="color"
                          value={formData.styling.borderColor}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            styling: { ...formData.styling, borderColor: e.target.value }
                          })}
                          className="w-full h-10 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Font Size
                        </label>
                        <input
                          type="text"
                          value={formData.styling.fontSize}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            styling: { ...formData.styling, fontSize: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="14px"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Font Family
                        </label>
                        <select
                          value={formData.styling.fontFamily || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            styling: { ...formData.styling, fontFamily: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Default Font</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Nunito">Nunito</option>
                          <option value="Source Sans Pro">Source Sans Pro</option>
                          <option value="Raleway">Raleway</option>
                          <option value="Ubuntu">Ubuntu</option>
                          <option value="Playfair Display">Playfair Display</option>
                          <option value="Merriweather">Merriweather</option>
                          <option value="Lora">Lora</option>
                          <option value="Crimson Text">Crimson Text</option>
                          <option value="Libre Baskerville">Libre Baskerville</option>
                          <option value="Dancing Script">Dancing Script</option>
                          <option value="Pacifico">Pacifico</option>
                          <option value="Caveat">Caveat</option>
                          <option value="Kalam">Kalam</option>
                          <option value="Satisfy">Satisfy</option>
                          <option value="Fira Code">Fira Code</option>
                          <option value="Source Code Pro">Source Code Pro</option>
                          <option value="JetBrains Mono">JetBrains Mono</option>
                          <option value="Inconsolata">Inconsolata</option>
                          <option value="Inter">Inter</option>
                          <option value="Poppins">Poppins</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingAnnouncement(null);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingAnnouncement ? 'Update' : 'Create'} Announcement
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

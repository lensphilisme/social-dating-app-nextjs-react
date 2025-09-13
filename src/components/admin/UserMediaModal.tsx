'use client';

import { useState, useEffect } from 'react';
import { getUserMedia, deleteUserMedia } from '@/app/actions/adminSystemActions';
import { XMarkIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface UserMediaModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserMediaModal({ user, isOpen, onClose, onSuccess }: UserMediaModalProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      fetchMedia();
    }
  }, [user, isOpen]);

  const fetchMedia = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userMedia = await getUserMedia(user.id);
      setMedia(userMedia);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
      return;
    }

    setDeletingMedia(mediaId);
    try {
      await deleteUserMedia(mediaId);
      setMedia(media.filter(m => m.id !== mediaId));
      onSuccess();
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Error deleting media');
    } finally {
      setDeletingMedia(null);
    }
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return '🖼️';
      case 'VIDEO':
        return '🎥';
      case 'AUDIO':
        return '🎵';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Media Management: {user.name || user.email}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading media...</div>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No media found for this user.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {media.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getMediaTypeIcon(item.type)}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {item.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="View Media"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteMedia(item.id)}
                        disabled={deletingMedia === item.id}
                        className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Delete Media"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <strong>Filename:</strong> {item.filename || 'Unknown'}
                    </div>
                    {item.fileSize && (
                      <div className="text-sm text-gray-600">
                        <strong>Size:</strong> {formatFileSize(item.fileSize)}
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      <strong>Uploaded:</strong> {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    {item.description && (
                      <div className="text-sm text-gray-600">
                        <strong>Description:</strong> {item.description}
                      </div>
                    )}
                  </div>

                  {/* Media Preview */}
                  {item.url && (
                    <div className="mt-3">
                      {item.type === 'IMAGE' ? (
                        <img
                          src={item.url}
                          alt={item.filename || 'Media'}
                          className="w-full h-32 object-cover rounded border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : item.type === 'VIDEO' ? (
                        <video
                          src={item.url}
                          className="w-full h-32 object-cover rounded border"
                          controls
                        />
                      ) : item.type === 'AUDIO' ? (
                        <audio
                          src={item.url}
                          className="w-full"
                          controls
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 rounded border flex items-center justify-center">
                          <span className="text-gray-500">Preview not available</span>
                        </div>
                      )}
                    </div>
                  )}

                  {deletingMedia === item.id && (
                    <div className="mt-3 text-center">
                      <div className="text-sm text-red-600">Deleting...</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


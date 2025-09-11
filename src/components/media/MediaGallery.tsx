'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  MicrophoneIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/outline';
import AudioRecorder from './AudioRecorder';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';

interface MediaItem {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  url: string;
  title?: string;
  description?: string;
  isMain: boolean;
  createdAt: string;
}

interface MediaGalleryProps {
  userId?: string; // If provided, shows other user's media (read-only)
  onMediaUpdate?: () => void;
}

export default function MediaGallery({ userId, onMediaUpdate }: MediaGalleryProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [selectedType, setSelectedType] = useState<'IMAGE' | 'VIDEO' | 'AUDIO' | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isOwnProfile = !userId;

  useEffect(() => {
    fetchMedia();
  }, [userId]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const url = userId ? `/api/media?userId=${userId}` : '/api/media';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'IMAGE' | 'VIDEO' | 'AUDIO', title?: string) => {
    if (!isOwnProfile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (title) formData.append('title', title);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchMedia();
        onMediaUpdate?.();
      } else {
        alert('Failed to upload media');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Error uploading media');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAudioSave = async (audioBlob: Blob, title: string) => {
    const audioFile = new File([audioBlob], `${title}.wav`, { type: 'audio/wav' });
    await handleFileUpload(audioFile, 'AUDIO', title);
    setShowAudioRecorder(false);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!isOwnProfile) return;

    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const response = await fetch(`/api/media?id=${mediaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMedia();
        onMediaUpdate?.();
      } else {
        alert('Failed to delete media');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Error deleting media');
    }
  };

  const handleSetMain = async (mediaId: string) => {
    if (!isOwnProfile) return;

    try {
      const response = await fetch('/api/media', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: mediaId,
          isMain: true,
        }),
      });

      if (response.ok) {
        await fetchMedia();
        onMediaUpdate?.();
      }
    } catch (error) {
      console.error('Error setting main media:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = file.type.startsWith('image/') ? 'IMAGE' : 
                 file.type.startsWith('video/') ? 'VIDEO' : 'AUDIO';
    
    handleFileUpload(file, type, file.name);
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'IMAGE': return <PhotoIcon className="w-6 h-6" />;
      case 'VIDEO': return <VideoCameraIcon className="w-6 h-6" />;
      case 'AUDIO': return <MicrophoneIcon className="w-6 h-6" />;
      default: return <PhotoIcon className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading media...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">Media Gallery</h3>
        {isOwnProfile && (
          <div className="flex items-center space-x-2">
            <label className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer text-sm font-medium">
              <PlusIcon className="w-4 h-4 inline mr-1" />
              Add Photo/Video
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            <button
              onClick={() => setShowAudioRecorder(true)}
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center"
              disabled={isUploading}
            >
              <MicrophoneIcon className="w-4 h-4 mr-1" />
              Record Audio
            </button>
          </div>
        )}
      </div>

      {/* Audio Recorder Modal */}
      <AnimatePresence>
        {showAudioRecorder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAudioRecorder(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AudioRecorder
                onSave={handleAudioSave}
                onCancel={() => setShowAudioRecorder(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhotoIcon className="w-8 h-8 text-neutral-400" />
          </div>
          <h4 className="text-lg font-medium text-neutral-900 mb-2">No media yet</h4>
          <p className="text-neutral-600">
            {isOwnProfile 
              ? 'Add photos, videos, or record audio to showcase yourself'
              : 'This user hasn\'t added any media yet'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group bg-neutral-100 rounded-xl overflow-hidden aspect-square"
            >
              {/* Main Badge */}
              {item.isMain && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <StarIconSolid className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}

              {/* Media Content */}
              {item.type === 'IMAGE' ? (
                <img
                  src={item.url}
                  alt={item.title || 'Media'}
                  className="w-full h-full object-cover"
                />
              ) : item.type === 'VIDEO' ? (
                <VideoPlayer
                  src={item.url}
                  title={item.title}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                  <div className="text-center">
                    <MicrophoneIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-xs text-purple-600 font-medium">{item.title}</p>
                  </div>
                </div>
              )}

              {/* Overlay Actions */}
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handleSetMain(item.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      item.isMain 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <StarIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMedia(item.id)}
                    className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Audio Player Overlay */}
              {item.type === 'AUDIO' && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70">
                  <AudioPlayer
                    src={item.url}
                    title={item.title}
                    className="!bg-transparent !border-none !shadow-none !p-0"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-blue-700">Uploading media...</span>
          </div>
        </div>
      )}
    </div>
  );
}

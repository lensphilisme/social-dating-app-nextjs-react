'use client';

import { useState, useEffect } from 'react';
import ImageGallery from './ImageGallery';
import { getUserMedia } from '@/app/actions/mediaActions';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export default function GalleryModal({ isOpen, onClose, userId, userName }: GalleryModalProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen, userId]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const userMedia = await getUserMedia(userId);
      setMedia(userMedia);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{userName}&apos;s Gallery</h2>
            <p className="text-sm text-gray-600">Photos, videos, and audio</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : media.length > 0 ? (
            <ImageGallery media={media} userId={userId} />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No media yet</h3>
              <p className="text-gray-500">This user hasn&apos;t uploaded any photos, videos, or audio yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

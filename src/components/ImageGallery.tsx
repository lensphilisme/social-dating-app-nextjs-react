'use client';

import { useState } from 'react';
import { MediaType } from '@prisma/client';
import EnhancedVideoPlayer from './media/EnhancedVideoPlayer';

interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  isMain: boolean;
}

interface ImageGalleryProps {
  media: MediaItem[];
  userId?: string;
  isOwner?: boolean;
}

export default function ImageGallery({ media, userId, isOwner = false }: ImageGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = media.filter(item => item.type === 'IMAGE');
  const videos = media.filter(item => item.type === 'VIDEO');
  const audio = media.filter(item => item.type === 'AUDIO');

  const openModal = (item: MediaItem, index: number) => {
    setSelectedMedia(item);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setCurrentIndex(0);
  };

  const nextMedia = () => {
    const allMedia = [...images, ...videos];
    if (currentIndex < allMedia.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedMedia(allMedia[currentIndex + 1]);
    }
  };

  const prevMedia = () => {
    const allMedia = [...images, ...videos];
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedMedia(allMedia[currentIndex - 1]);
    }
  };

  const renderMediaGrid = (mediaItems: MediaItem[], title: string) => {
    if (mediaItems.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          {title === 'Images' && '📸'}
          {title === 'Videos' && '🎥'}
          {title === 'Audio' && '🎵'}
          {title} ({mediaItems.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((item, index) => (
            <div
              key={item.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => openModal(item, index)}
            >
              {item.type === 'IMAGE' ? (
                <img
                  src={item.url}
                  alt={item.title || 'Gallery image'}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : item.type === 'VIDEO' ? (
                <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 text-4xl">🎥</div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[8px] border-l-gray-800 border-y-[6px] border-y-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <div className="text-white text-4xl">🎵</div>
                </div>
              )}
              
              {item.isMain && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Main
                </div>
              )}
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.type === 'VIDEO' && (
                    <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[8px] border-l-gray-800 border-y-[6px] border-y-transparent ml-1"></div>
                    </div>
                  )}
                  {item.type === 'AUDIO' && (
                    <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <div className="text-gray-800 text-xl">🎵</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderMediaGrid(images, 'Images')}
      {renderMediaGrid(videos, 'Videos')}
      {renderMediaGrid(audio, 'Audio')}

      {/* Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
            >
              ✕
            </button>
            
            {selectedMedia.type === 'IMAGE' ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.title || 'Gallery image'}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            ) : selectedMedia.type === 'VIDEO' ? (
              <EnhancedVideoPlayer
                src={selectedMedia.url}
                title={selectedMedia.title}
                className="w-full h-auto max-h-[80vh] rounded-lg"
                showFullscreenButton={true}
                showCloseButton={false}
              />
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="text-xl font-semibold mb-2">{selectedMedia.title || 'Audio File'}</h3>
                <audio src={selectedMedia.url} controls className="w-full max-w-md mx-auto" />
              </div>
            )}

            {/* Navigation arrows */}
            {([...images, ...videos]).length > 1 && (
              <>
                {currentIndex > 0 && (
                  <button
                    onClick={prevMedia}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300"
                  >
                    ‹
                  </button>
                )}
                {currentIndex < ([...images, ...videos]).length - 1 && (
                  <button
                    onClick={nextMedia}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300"
                  >
                    ›
                  </button>
                )}
              </>
            )}

            {/* Media info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold">{selectedMedia.title || 'Untitled'}</h3>
              {selectedMedia.description && (
                <p className="text-sm text-gray-300 mt-1">{selectedMedia.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

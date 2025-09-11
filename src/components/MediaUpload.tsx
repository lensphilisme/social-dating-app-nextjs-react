'use client';

import { useState, useRef } from 'react';
import { addUserMedia } from '@/app/actions/mediaActions';
import { MediaType } from '@prisma/client';

interface MediaUploadProps {
  onUploadComplete?: () => void;
}

export default function MediaUpload({ onUploadComplete }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    setMessage('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Determine media type
        let mediaType: MediaType;
        if (file.type.startsWith('image/')) {
          mediaType = 'IMAGE';
        } else if (file.type.startsWith('video/')) {
          mediaType = 'VIDEO';
        } else if (file.type.startsWith('audio/')) {
          mediaType = 'AUDIO';
        } else {
          setMessage(`Unsupported file type: ${file.type}`);
          continue;
        }

        // In a real app, you'd upload to a file service like Cloudinary
        // For now, we'll create a mock URL
        const mockUrl = URL.createObjectURL(file);

        const result = await addUserMedia({
          type: mediaType,
          url: mockUrl,
          title: file.name,
          isPublic: true,
        });

        if (!result.success) {
          setMessage(result.message);
          break;
        }
      }

      if (message === '') {
        setMessage('Media uploaded successfully!');
        onUploadComplete?.();
      }
    } catch (error) {
      setMessage('Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-semibold text-gray-700">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports images, videos, and audio files
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Choose Files
          </button>
        </div>
      </div>

      {uploading && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-purple-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            Uploading...
          </div>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('successfully')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}

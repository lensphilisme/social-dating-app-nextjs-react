'use client';

import { useState } from 'react';
import { addUserMedia } from '@/app/actions/mediaActions';
// import { MediaType } from '@prisma/client';
import { CldUploadButton, CloudinaryUploadWidgetResults } from 'next-cloudinary';

interface MediaUploadProps {
  onUploadComplete?: () => void;
}

export default function MediaUpload({ onUploadComplete }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCloudinaryUpload = async (result: CloudinaryUploadWidgetResults) => {
    if (!result.info || typeof result.info === 'string') return;

    setUploading(true);
    setMessage('');

    try {
      const imageUrl = result.info.secure_url;
      const publicId = result.info.public_id;
      
      // Determine media type from the uploaded file
      let mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' = 'IMAGE'; // Default to image
      if (result.info.resource_type === 'video') {
        mediaType = 'VIDEO';
      } else if (result.info.resource_type === 'raw') {
        mediaType = 'AUDIO';
      }

      const uploadResult = await addUserMedia({
        type: mediaType,
        url: imageUrl,
        title: result.info.original_filename || 'Uploaded media',
        isPublic: true,
      });

      if (uploadResult.success) {
        setMessage('Media uploaded successfully!');
        onUploadComplete?.();
      } else {
        setMessage(uploadResult.message);
      }
    } catch (error) {
      setMessage('Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-semibold text-gray-700">
              Upload media files
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports images, videos, and audio files
            </p>
          </div>
          <CldUploadButton
  options={{ 
    maxFiles: 10,
    resourceType: 'auto',
    multiple: true
  }}
  onSuccess={handleCloudinaryUpload}
  signatureEndpoint='/api/sign-image'
  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
>
            Choose Files
          </CldUploadButton>
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

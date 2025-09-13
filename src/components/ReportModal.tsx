'use client';

import { useState } from 'react';
import { createReport } from '@/app/actions/reportActions';
// import { ReportType } from '@prisma/client';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
}

const REPORT_TYPES = [
  { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Inappropriate Behavior' },
  { value: 'FAKE_PROFILE', label: 'Fake Profile' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
  { value: 'OTHER', label: 'Other' },
];

export default function ReportModal({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName
}: ReportModalProps) {
  const [formData, setFormData] = useState({
    type: 'INAPPROPRIATE_BEHAVIOR' as string,
    reason: '',
    description: '',
    proof: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      // Handle file upload if proof is provided
      let proofUrl = '';
      if (formData.proof) {
        setUploading(true);
        setUploadProgress(0);
        
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', formData.proof);
          uploadFormData.append('folder', 'reports');

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
          }

          const uploadResult = await response.json();
          proofUrl = uploadResult.data.secure_url;
          setUploadProgress(100);
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          setMessage(`Upload failed: ${uploadError.message || 'Unknown error'}`);
          setLoading(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      const result = await createReport({
        reportedId: reportedUserId,
        type: formData.type,
        reason: formData.reason,
        description: formData.description || undefined,
        proof: proofUrl || undefined,
      });

      if (result.success) {
        setMessage('Report submitted successfully!');
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'INAPPROPRIATE_BEHAVIOR',
      reason: '',
      description: '',
      proof: null,
    });
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Report User</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            You are reporting <strong>{reportedUserName}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              {REPORT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
              placeholder="Provide more details about the incident..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proof (Optional)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.gif,.webp,.mp4,.avi,.mov,.wmv,.mp3,.wav,.ogg,.pdf,.doc,.docx,.txt"
                onChange={(e) => setFormData({ ...formData, proof: e.target.files?.[0] || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={uploading}
              />
              
              {formData.proof && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        📎
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formData.proof.name}</p>
                        <p className="text-xs text-gray-500">
                          {(formData.proof.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, proof: null })}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={uploading}
                    >
                      ✕
                    </button>
                  </div>
                  
                  {uploading && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Supported formats: Images (PNG, JPG, JPEG, GIF, WebP), Videos (MP4, AVI, MOV, WMV), 
                Audio (MP3, WAV, OGG), Documents (PDF, DOC, DOCX, TXT). Max size: 10MB
              </p>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading || !formData.reason.trim()}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading || uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{uploading ? 'Uploading...' : 'Submitting...'}</span>
                </>
              ) : (
                <span>Submit Report</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

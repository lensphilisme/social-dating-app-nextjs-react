'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  title?: string;
  className?: string;
}

export default function ProgressBar({ progress, title, className = '' }: ProgressBarProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-neutral-200 p-4 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-neutral-900">{title}</h4>
          <span className="text-sm text-neutral-600">{Math.round(progress)}%</span>
        </div>
      )}
      
      <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      
      {progress < 100 && (
        <div className="flex items-center mt-2 space-x-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
          <span className="text-xs text-neutral-600">Uploading...</span>
        </div>
      )}
      
      {progress === 100 && (
        <div className="flex items-center mt-2 space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-600">Upload complete!</span>
        </div>
      )}
    </div>
  );
}

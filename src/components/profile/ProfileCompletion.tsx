'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { calculateProfileCompletion, getCompletionMessage, getCompletionColor } from '@/lib/profileCompletion';

interface ProfileCompletionProps {
  member: any;
  onCompleteProfile?: () => void;
}

export default function ProfileCompletion({ member, onCompleteProfile }: ProfileCompletionProps) {
  const completion = calculateProfileCompletion(member);
  const { completionPercentage, missingFields } = completion;

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">Profile Completion</h3>
        <div className={`text-sm font-medium ${getCompletionColor(completionPercentage)}`}>
          {completionPercentage}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${getProgressColor(completionPercentage)} transition-colors duration-500`}
          />
        </div>
        <p className="text-sm text-neutral-600 mt-2">
          {getCompletionMessage(completionPercentage)}
        </p>
      </div>

      {/* Completion Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {completion.completedFields}
          </div>
          <div className="text-sm text-green-700">Completed</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {completion.totalFields - completion.completedFields}
          </div>
          <div className="text-sm text-red-700">Missing</div>
        </div>
      </div>

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-2 flex items-center">
            <ExclamationTriangleIcon className="w-4 h-4 mr-1 text-orange-500" />
            Missing Required Fields
          </h4>
          <div className="space-y-1">
            {missingFields.slice(0, 5).map((field, index) => (
              <motion.div
                key={field}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center text-sm text-neutral-600"
              >
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                {field}
              </motion.div>
            ))}
            {missingFields.length > 5 && (
              <p className="text-xs text-neutral-500 ml-3">
                +{missingFields.length - 5} more fields
              </p>
            )}
          </div>
        </div>
      )}

      {/* Complete Profile Button */}
      {completionPercentage < 100 && onCompleteProfile && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCompleteProfile}
          className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
        >
          <span>Complete Your Profile</span>
          <ArrowRightIcon className="w-4 h-4" />
        </motion.button>
      )}

      {/* Completion Badge */}
      {completionPercentage === 100 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center p-4 bg-green-50 rounded-lg border border-green-200"
        >
          <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-green-700 font-medium">Profile Complete!</p>
          <p className="text-green-600 text-sm">Your profile is 100% complete</p>
        </motion.div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { updateReportStatus, adminSendReportMessage } from '@/app/actions/adminReportActions';

interface ReportSupportFlowProps {
  report: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportSupportFlow({ report, onClose, onSuccess }: ReportSupportFlowProps) {
  const [step, setStep] = useState(1); // 1: Choose who to ask, 2: Compose message, 3: Success
  const [selectedUser, setSelectedUser] = useState<'reporter' | 'reported' | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChooseUser = (user: 'reporter' | 'reported') => {
    setSelectedUser(user);
    setStep(2);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    setIsLoading(true);
    try {
      // First update report status to ASK_MORE_DETAILS
      const statusResult = await updateReportStatus(
        report.id,
        'ASK_MORE_DETAILS',
        `Admin requested more details from ${selectedUser === 'reporter' ? 'reporter' : 'reported user'}`,
        report.assignedTo
      );

      if (statusResult.success) {
        // Then send the message
        const targetUserId = selectedUser === 'reporter' ? report.reporterId : report.reportedId;
        const messageResult = await adminSendReportMessage(
          report.id,
          message.trim(),
          'TEXT',
          undefined,
          undefined,
          undefined,
          targetUserId
        );

        if (messageResult.success) {
          setStep(3);
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        } else {
          console.error('Error sending message:', messageResult.error);
        }
      } else {
        console.error('Error updating report status:', statusResult.error);
      }
    } catch (error) {
      console.error('Error in support flow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedUserName = () => {
    if (selectedUser === 'reporter') {
      return report.reporter?.name || report.reporter?.email || 'Reporter';
    } else {
      return report.reported?.name || report.reported?.email || 'Reported User';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Request More Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Report: {report.type.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-orange-500" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      Who would you like to ask for more details?
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose the user you want to request additional information from.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reporter Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleChooseUser('reporter')}
                      className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Reporter</h4>
                          <p className="text-sm text-gray-500">The user who submitted the report</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">
                          {report.reporter?.name || report.reporter?.email || 'Unknown Reporter'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Reason: {report.reason}
                        </p>
                      </div>
                    </motion.button>

                    {/* Reported User Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleChooseUser('reported')}
                      className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <UserGroupIcon className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Reported User</h4>
                          <p className="text-sm text-gray-500">The user being reported</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">
                          {report.reported?.name || report.reported?.email || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Report Type: {report.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-primary-500" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      Compose Your Message
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Send a message to <span className="font-medium">{getSelectedUserName()}</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please provide more details about this report..."
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">
                        What happens next?
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Report status will be updated to "Ask More Details"</li>
                        <li>• A support chat will be created automatically</li>
                        <li>• The user will receive your message and can respond</li>
                        <li>• You can continue the conversation in the support center</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Message Sent Successfully!
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your message has been sent to {getSelectedUserName()}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      The report status has been updated and a support chat has been created. 
                      You can continue the conversation in the support center.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

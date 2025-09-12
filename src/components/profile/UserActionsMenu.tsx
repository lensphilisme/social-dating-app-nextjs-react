'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  FlagIcon,
  HeartIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import ReportModal from '@/components/ReportModal';
import GalleryModal from '@/components/GalleryModal';
import { sendMatchRequest, getUserQuestions } from '@/app/actions/discoverActions';
import { addToFavorites } from '@/app/actions/favoriteActions';
import { toast } from 'react-toastify';
import QuestionPromptModal from '@/app/discover/QuestionPromptModal';
import { Question } from '@prisma/client';
import { useSession } from 'next-auth/react';

interface UserActionsMenuProps {
  memberId: string;
  userId: string;
  userName: string;
  isLiked: boolean;
  onLikeChange: (liked: boolean) => void;
}

interface RelationshipStatus {
  isLiked: boolean;
  isMatched: boolean;
  hasMatchRequest: boolean;
  canChat: boolean;
}

export default function UserActionsMenu({ 
  memberId, 
  userId, 
  userName, 
  isLiked, 
  onLikeChange 
}: UserActionsMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [memberQuestions, setMemberQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus>({
    isLiked: false,
    isMatched: false,
    hasMatchRequest: false,
    canChat: false
  });
  const { data: session } = useSession();

  // Check relationship status
  useEffect(() => {
    const checkRelationshipStatus = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/relationship-status?userId=${userId}`);
        if (response.ok) {
          const status = await response.json();
          setRelationshipStatus(status);
          onLikeChange(status.isLiked);
        }
      } catch (error) {
        console.error('Error checking relationship status:', error);
      }
    };

    checkRelationshipStatus();
  }, [userId, session?.user?.id, onLikeChange]);

  const handleLike = async () => {
    try {
      setLoading(true);
      const result = await addToFavorites(userId);
      if (result.success) {
        toast.success('Added to favorites!');
        setRelationshipStatus(prev => ({ ...prev, isLiked: true }));
        onLikeChange(true);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error('Failed to add to favorites');
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const handleMatchRequest = async () => {
    try {
      setLoading(true);
      const questions = await getUserQuestions(userId);
      if (questions.length === 0) {
        // No questions, send direct match request
        const result = await sendMatchRequest(userId, []);
        if (result.success) {
          toast.success('Match request sent successfully!');
          setRelationshipStatus(prev => ({ ...prev, hasMatchRequest: true }));
        } else {
          toast.error(result.message);
        }
      } else {
        // Show question modal
        setMemberQuestions(questions);
        setShowQuestionModal(true);
      }
    } catch (error) {
      console.error('Error sending match request:', error);
      toast.error('Failed to send match request');
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const handleQuestionSubmit = async (answers: { questionId: string; answer: string }[]) => {
    try {
      setLoading(true);
      const result = await sendMatchRequest(userId, answers);
      if (result.success) {
        toast.success('Match request sent successfully!');
        setShowQuestionModal(false);
        setRelationshipStatus(prev => ({ ...prev, hasMatchRequest: true }));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error sending match request:', error);
      toast.error('Failed to send match request');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    window.location.href = `/messages?user=${userId}`;
    setShowMenu(false);
  };

  const handlePhotos = () => {
    setShowGallery(true);
    setShowMenu(false);
  };

  const handleReport = () => {
    setShowReportModal(true);
    setShowMenu(false);
  };

  const menuItems = [
    // Chat Button - Only show if matched
    ...(relationshipStatus.canChat ? [{
      id: 'chat',
      label: 'Chat',
      icon: ChatBubbleLeftRightIcon,
      action: handleChat,
      className: 'text-green-600 hover:bg-green-50'
    }] : []),

    // Like Button - Only show if not already liked
    ...(!relationshipStatus.isLiked ? [{
      id: 'like',
      label: 'Add to Favorites',
      icon: HeartIcon,
      action: handleLike,
      className: 'text-red-600 hover:bg-red-50'
    }] : []),

    // Match Request Button - Only show if not matched and no pending request
    ...(!relationshipStatus.isMatched && !relationshipStatus.hasMatchRequest ? [{
      id: 'match',
      label: 'Send Match Request',
      icon: FireIcon,
      action: handleMatchRequest,
      className: 'text-orange-600 hover:bg-orange-50'
    }] : []),

    // Photos Button - Always available
    {
      id: 'photos',
      label: 'View Photos',
      icon: PhotoIcon,
      action: handlePhotos,
      className: 'text-blue-600 hover:bg-blue-50'
    },

    // Report Button - Always available
    {
      id: 'report',
      label: 'Report User',
      icon: FlagIcon,
      action: handleReport,
      className: 'text-red-600 hover:bg-red-50'
    }
  ];

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <EllipsisVerticalIcon className="w-6 h-6 text-neutral-600" />
        </button>

        <AnimatePresence>
          {showMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMenu(false)}
              />
              
              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50"
              >
                <div className="py-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        disabled={loading}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${item.className} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={userId}
        reportedUserName={userName}
      />

      <GalleryModal
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        userId={userId}
        userName={userName}
      />

      <QuestionPromptModal
        member={{ userId: userId, name: userName } as any}
        questions={memberQuestions}
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        onSubmit={handleQuestionSubmit}
      />
    </>
  );
}

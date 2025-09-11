'use client';

import { useState, useEffect } from 'react';
import ReportModal from '@/components/ReportModal';
import GalleryModal from '@/components/GalleryModal';
import { sendMatchRequest, getUserQuestions } from '@/app/actions/discoverActions';
import { addToFavorites } from '@/app/actions/favoriteActions';
import { toast } from 'react-toastify';
import QuestionPromptModal from '@/app/discover/QuestionPromptModal';
import { Question } from '@prisma/client';
import { useSession } from 'next-auth/react';

interface MemberActionsProps {
  memberId: string;
  userId: string;
  isLiked: boolean;
  onLikeChange: (liked: boolean) => void;
}

interface RelationshipStatus {
  isLiked: boolean;
  isMatched: boolean;
  hasMatchRequest: boolean;
  canChat: boolean;
}

export default function MemberActions({ memberId, userId, isLiked, onLikeChange }: MemberActionsProps) {
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
    // Navigate to messages with this user
    window.location.href = `/messages?user=${userId}`;
  };

  return (
    <>
      <div className="flex gap-3 justify-center flex-wrap">
        {/* Chat Button - Only show if matched */}
        {relationshipStatus.canChat && (
          <button 
            onClick={handleChat}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg"
          >
            <span className="mr-2">💬</span>
            Chat
          </button>
        )}

        {/* Like Button - Only show if not already liked */}
        {!relationshipStatus.isLiked && (
          <button 
            onClick={handleLike}
            disabled={loading}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg disabled:opacity-50"
          >
            <span className="mr-2">❤️</span>
            {loading ? 'Adding...' : 'Like'}
          </button>
        )}

        {/* Match Request Button - Only show if not matched and no pending request */}
        {!relationshipStatus.isMatched && !relationshipStatus.hasMatchRequest && (
          <button 
            onClick={handleMatchRequest}
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg disabled:opacity-50"
          >
            <span className="mr-2">🔥</span>
            {loading ? 'Sending...' : 'Match Request'}
          </button>
        )}

        {/* Photos Button - Always available */}
        <button 
          onClick={() => setShowGallery(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg"
        >
          <span className="mr-2">📸</span>
          Photos
        </button>

        {/* Report Button - Always available */}
        <button 
          onClick={() => setShowReportModal(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg"
        >
          <span className="mr-2">⚠️</span>
          Report
        </button>
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={userId}
        reportedUserName="User"
      />

      <GalleryModal
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        userId={userId}
        userName="User"
      />

      <QuestionPromptModal
        member={{ userId: userId, name: "User" } as any}
        questions={memberQuestions}
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        onSubmit={handleQuestionSubmit}
      />
    </>
  );
}
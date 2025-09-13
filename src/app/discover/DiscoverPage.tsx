'use client';

import { useEffect, useState } from 'react';
import { getDiscoverMembers, sendMatchRequest, getUserQuestions } from '@/app/actions/discoverActions';
import { addToFavorites } from '@/app/actions/favoriteActions';
import SwipeCard from './SwipeCard';
import QuestionPromptModal from './QuestionPromptModal';
import HeartAnimation from '@/components/ui/HeartAnimation';
import { Member, Question } from '@prisma/client';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function DiscoverPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberQuestions, setMemberQuestions] = useState<Question[]>([]);
  const [swipedMembers, setSwipedMembers] = useState<Member[]>([]);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getDiscoverMembers();
      setMembers(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', member: Member) => {
    // Add to swiped members for undo functionality
    setSwipedMembers(prev => [...prev, member]);
    
    if (direction === 'right') {
      // Only add to favorites
      try {
        const favoriteResult = await addToFavorites(member.userId);
        if (favoriteResult.success) {
          console.log('Added to favorites');
        }
      } catch (error) {
        console.error('Error adding to favorites:', error);
      }
    } else {
      // Handle ignore
      console.log('Swipe left - Ignore:', member.name);
    }
    
    // Move to next card
    setCurrentIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (swipedMembers.length > 0 && currentIndex > 0) {
      // Remove the last swiped member
      setSwipedMembers(prev => prev.slice(0, -1));
      // Go back one index
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleMatchRequest = async (member: Member) => {
    // Get user's questions first
    try {
      const questions = await getUserQuestions(member.userId);
      if (questions.length === 0) {
        // No questions, send direct match request
        const result = await sendMatchRequest(member.userId, []);
        if (result.success) {
          console.log('Match request sent successfully');
        } else {
          console.error('Failed to send match request:', result.message);
        }
        setCurrentIndex(prev => prev + 1);
      } else {
        // Show question modal
        setSelectedMember(member);
        setMemberQuestions(questions);
        setShowQuestionModal(true);
      }
    } catch (error) {
      console.error('Error getting questions:', error);
    }
  };

  const handleQuestionSubmit = async (answers: { questionId: string; answer: string }[]) => {
    if (!selectedMember) return;

    try {
      const result = await sendMatchRequest(selectedMember.userId, answers);
      if (result.success) {
        console.log('Match request sent successfully');
        // Show success message or redirect
        alert('Match request sent successfully!');
      } else {
        console.error('Failed to send match request:', result.message);
        alert(result.message || 'Failed to send match request');
      }
    } catch (error) {
      console.error('Error sending match request:', error);
      alert('Error sending match request');
    }

    // Close modal and move to next card
    setShowQuestionModal(false);
    setSelectedMember(null);
    setMemberQuestions([]);
    setCurrentIndex(prev => prev + 1);
  };

  const handleReload = () => {
    loadMembers();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Finding your perfect match...</p>
        </div>
      </div>
    );
  }

  if (members.length === 0 || currentIndex >= members.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="mb-8">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-3xl font-bold mb-4">No more profiles!</h2>
            <p className="text-xl mb-8">You&apos;ve seen everyone in your area.</p>
          </div>
          <button
            onClick={handleReload}
            className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black overflow-hidden relative pb-16 lg:pb-0">
      {/* Undo Button - Top Left */}
      {swipedMembers.length > 0 && currentIndex > 0 && (
        <button
          onClick={handleUndo}
          className="absolute top-4 left-4 z-50 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Cards Stack - With margins to show next user behind */}
      <div className="relative h-full w-full">
        {members.slice(currentIndex, currentIndex + 3).map((member, index) => (
          <SwipeCard
            key={member.id}
            member={member}
            index={index}
            onSwipe={handleSwipe}
            onMatchRequest={handleMatchRequest}
            isTop={index === 0}
          />
        ))}
      </div>

      {/* Action Buttons - Fixed position above bottom nav */}
      <div className="absolute bottom-20 left-4 right-4 flex items-center justify-between lg:bottom-4 z-40">
        {/* Pass Button */}
        <button
          onClick={() => currentIndex < members.length && handleSwipe('left', members[currentIndex])}
          className="w-14 h-14 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 hover:bg-red-500/30 hover:border-red-400 hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Match Request Button (Heart) */}
        <button
          onClick={() => currentIndex < members.length && handleMatchRequest(members[currentIndex])}
          className="w-20 h-20 flex items-center justify-center hover:scale-110 transition-all duration-300"
        >
          {/* Heart animation */}
          <HeartAnimation className="w-12 h-12" />
        </button>

        {/* Like Button */}
        <button
          onClick={() => currentIndex < members.length && handleSwipe('right', members[currentIndex])}
          className="w-14 h-14 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 hover:bg-pink-500/30 hover:border-pink-400 hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      {/* Question Prompt Modal */}
      {selectedMember && (
        <QuestionPromptModal
          member={selectedMember}
          questions={memberQuestions}
          isOpen={showQuestionModal}
          onClose={() => {
            setShowQuestionModal(false);
            setSelectedMember(null);
            setMemberQuestions([]);
          }}
          onSubmit={handleQuestionSubmit}
          redirectAfterSubmit="/discover"
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Question } from '@prisma/client';

interface QuestionQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onSubmit: (answers: { questionId: string; answer: string }[]) => void;
  loading?: boolean;
  redirectAfterSubmit?: string;
}

export default function QuestionQuizModal({
  isOpen,
  onClose,
  questions,
  onSubmit,
  loading = false,
  redirectAfterSubmit
}: QuestionQuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isYesNoQuestion = currentQuestion?.responseType === 'YES_NO';

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isTimerActive && !isSubmitting) {
      // Auto-submit when timer expires
      if (isYesNoQuestion && currentAnswer === '') {
        handleAnswer('No'); // Default to No if no answer given
      } else if (!isYesNoQuestion && currentAnswer.trim()) {
        // Auto-submit open text if there's an answer
        handleSubmit();
      } else if (isLastQuestion) {
        // Auto-submit if it's the last question (even with no answers)
        setIsSubmitting(true);
        onSubmit(answers);
        // Close modal after submission
        setTimeout(() => {
          onClose();
        }, 500);
        if (redirectAfterSubmit) {
          setTimeout(() => {
            window.location.href = redirectAfterSubmit;
          }, 1000);
        }
      }
    }
  }, [timeLeft, isTimerActive, isYesNoQuestion, currentAnswer, answers, isLastQuestion, isSubmitting]);

  // Start timer when question changes
  useEffect(() => {
    if (currentQuestion && isOpen) {
      setTimeLeft(currentQuestion.timerSeconds);
      setIsTimerActive(true);
      setCurrentAnswer('');
    }
  }, [currentQuestion, isOpen]);

  const handleAnswer = (answer: string) => {
    setCurrentAnswer(answer);
    
    // For YES_NO questions, auto-advance after selection
    if (isYesNoQuestion) {
      const newAnswers = [...answers, { questionId: currentQuestion.id, answer }];
      setAnswers(newAnswers);
      
      if (isLastQuestion) {
        onSubmit(newAnswers);
        // Close modal after submission
        setTimeout(() => {
          onClose();
        }, 500);
        if (redirectAfterSubmit) {
          setTimeout(() => {
            window.location.href = redirectAfterSubmit;
          }, 1000);
        }
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  const handleSubmit = () => {
    if (currentAnswer.trim() && !isSubmitting) {
      const newAnswers = [...answers, { questionId: currentQuestion.id, answer: currentAnswer }];
      
      if (isLastQuestion) {
        setIsSubmitting(true);
        onSubmit(newAnswers);
        // Close modal after submission
        setTimeout(() => {
          onClose();
        }, 500);
        if (redirectAfterSubmit) {
          setTimeout(() => {
            window.location.href = redirectAfterSubmit;
          }, 1000);
        }
      } else {
        setAnswers(newAnswers);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this match request? This action cannot be undone.')) {
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setTimeLeft(0);
    setIsTimerActive(false);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen || !currentQuestion) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{currentQuestionIndex + 1}</span>
            </div>
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            timeLeft > 10 ? 'bg-green-100 text-green-800' : 
            timeLeft > 5 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            <span className="w-2 h-2 bg-current rounded-full animate-pulse"></span>
            {timeLeft}s remaining
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {currentQuestion.question}
          </h3>

          {/* Answer Input */}
          {isYesNoQuestion ? (
            <div className="flex gap-4">
              <button
                onClick={() => handleAnswer('Yes')}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                  currentAnswer === 'Yes'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleAnswer('No')}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                  currentAnswer === 'No'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                }`}
              >
                No
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
              />
              <button
                onClick={handleSubmit}
                disabled={!currentAnswer.trim() || loading || isSubmitting}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading || isSubmitting ? 'Submitting...' : isLastQuestion ? 'Complete Quiz' : 'Next Question'}
              </button>
            </div>
          )}
        </div>

        {/* Question Type Indicator */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
            {isYesNoQuestion ? '⚡ Quick Answer' : '✍️ Detailed Answer'}
          </span>
          <p className="text-xs text-gray-500 mt-2">
            You cannot go back to previous questions
          </p>
        </div>
      </div>
    </div>
  );
}

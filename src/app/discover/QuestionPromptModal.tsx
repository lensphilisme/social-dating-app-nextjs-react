'use client';

import { useState, useEffect, useCallback } from 'react';
import { Member, Question } from '@prisma/client';
import { transformImageUrl } from '@/lib/util';

type Props = {
  member: Member;
  questions: Question[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (answers: { questionId: string; answer: string }[]) => void;
  redirectAfterSubmit?: string;
};

export default function QuestionPromptModal({ member, questions, isOpen, onClose, onSubmit, redirectAfterSubmit }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isYesNoQuestion = currentQuestion?.responseType === 'YES_NO';

  // Start timer when question changes
  useEffect(() => {
    if (currentQuestion && isOpen) {
      setTimeLeft(currentQuestion.timerSeconds);
      setIsTimerActive(true);
      setCurrentAnswer('');
    }
  }, [currentQuestion, isOpen]);

  const handleAnswer = useCallback((answer: string) => {
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
  }, [isYesNoQuestion, answers, currentQuestion.id, isLastQuestion, onSubmit, onClose, redirectAfterSubmit, currentQuestionIndex]);

  const handleNext = useCallback(() => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer');
      return;
    }

    const newAnswers = [...answers, {
      questionId: currentQuestion.id,
      answer: currentAnswer.trim(),
    }];

    setAnswers(newAnswers);
    setCurrentAnswer('');

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
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentAnswer, answers, currentQuestion.id, isLastQuestion, onSubmit, onClose, redirectAfterSubmit]);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isTimerActive) {
      // Auto-submit when timer expires
      if (isYesNoQuestion && currentAnswer === '') {
        handleAnswer('No'); // Default to No if no answer given
      } else if (!isYesNoQuestion && currentAnswer.trim()) {
        // Auto-submit open text if there's an answer
        handleNext();
      } else if (isLastQuestion) {
        // Auto-submit if it's the last question (even with no answers)
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
  }, [timeLeft, isTimerActive, isYesNoQuestion, currentAnswer, answers, isLastQuestion, handleAnswer, handleNext, onClose, onSubmit, redirectAfterSubmit]);

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setCurrentAnswer(answers[currentQuestionIndex - 1]?.answer || '');
      setAnswers(prev => prev.slice(0, -1));
    }
  };

  const handleClose = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setTimeLeft(0);
    setIsTimerActive(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={transformImageUrl(member.image) || '/images/user.png'}
              alt={member.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white"
            />
            <div>
              <h2 className="text-xl font-bold">{member.name}</h2>
              <p className="text-white/80">Answer their questions to send a match request</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Timer */}
        <div className="text-center py-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            timeLeft > 10 ? 'bg-green-100 text-green-800' : 
            timeLeft > 5 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            <span className="w-2 h-2 bg-current rounded-full animate-pulse"></span>
            {timeLeft}s remaining
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentQuestion.question}
          </h3>

          {currentQuestion.responseType === 'YES_NO' ? (
            <div className="space-y-3">
              <button
                onClick={() => handleAnswer('Yes')}
                className={`w-full p-4 rounded-lg border-2 transition-colors ${
                  currentAnswer === 'Yes'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    currentAnswer === 'Yes' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                    {currentAnswer === 'Yes' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="font-medium">Yes</span>
                </div>
              </button>
              <button
                onClick={() => handleAnswer('No')}
                className={`w-full p-4 rounded-lg border-2 transition-colors ${
                  currentAnswer === 'No'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    currentAnswer === 'No' ? 'border-red-500 bg-red-500' : 'border-gray-300'
                  }`}>
                    {currentAnswer === 'No' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="font-medium">No</span>
                </div>
              </button>
            </div>
          ) : (
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={handleNext}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              {isLastQuestion ? 'Send Match Request' : 'Next'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            You cannot go back to previous questions
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Member, Question } from '@prisma/client';
import { transformImageUrl } from '@/lib/util';

type Props = {
  member: Member;
  questions: Question[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (answers: { questionId: string; answer: string }[]) => void;
};

export default function QuestionPromptModal({ member, questions, isOpen, onClose, onSubmit }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleNext = () => {
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
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

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

        {/* Question Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentQuestion.question}
          </h3>

          {currentQuestion.responseType === 'YES_NO' ? (
            <div className="space-y-3">
              <button
                onClick={() => setCurrentAnswer('Yes')}
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
                onClick={() => setCurrentAnswer('No')}
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
            {currentQuestionIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              {isLastQuestion ? 'Send Match Request' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

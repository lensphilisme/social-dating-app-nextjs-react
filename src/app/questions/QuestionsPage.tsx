'use client';

import { useEffect, useState } from 'react';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '@/app/actions/questionActions';
import { Question, QuestionType } from '@prisma/client';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    responseType: 'YES_NO' as QuestionType,
    timerSeconds: 10,
  });

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadQuestions();
  }, []);

  if (!mounted) {
    return <div className="love-gradient-bg min-h-screen flex items-center justify-center">
      <div className="love-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, formData);
      } else {
        await createQuestion(formData);
      }
      
      setFormData({ question: '', responseType: 'YES_NO', timerSeconds: 10 });
      setShowForm(false);
      setEditingQuestion(null);
      loadQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      responseType: question.responseType,
      timerSeconds: (question as any).timerSeconds || 10,
    });
    setShowForm(true);
  };

  const handleDelete = async (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(questionId);
        loadQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const handleToggleActive = async (questionId: string, isActive: boolean) => {
    try {
      await updateQuestion(questionId, { isActive: !isActive });
      loadQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 pt-16 lg:pt-16 pb-16 lg:pb-0">
      <div className="w-full px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header - Mobile Optimized */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Match Questions</h1>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Set questions that potential matches will answer when they request to match with you
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Question
                </span>
              </button>
            </div>
          </div>

          {/* Questions List - Mobile Optimized */}
          <div className="space-y-3 sm:space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl sm:text-6xl mb-4">❓</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No questions yet</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">Add questions to help potential matches get to know you better</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  Add Your First Question
                </button>
              </div>
            ) : (
              questions.map((question) => (
                <div key={question.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4 sm:p-6 hover:shadow-md transition-all duration-300">
                  <div className="space-y-3">
                    {/* Question Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight break-words">
                          {question.question}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Created {new Date(question.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        question.responseType === 'YES_NO' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {question.responseType === 'YES_NO' ? 'Yes/No' : 'Open Text'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        question.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {question.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {(question as any).timerSeconds || 10}s timer
                      </span>
                    </div>
                    
                    {/* Action Buttons - Mobile Optimized */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={() => handleToggleActive(question.id, question.isActive)}
                        className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          question.isActive
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {question.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEdit(question)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add/Edit Form Modal - Mobile Optimized */}
          {showForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {editingQuestion ? 'Edit Question' : 'Add New Question'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingQuestion(null);
                        setFormData({ question: '', responseType: 'YES_NO', timerSeconds: 10 });
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Question
                      </label>
                      <textarea
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="What would you like to ask potential matches?"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Response Type
                      </label>
                      <select
                        value={formData.responseType}
                        onChange={(e) => setFormData({ ...formData, responseType: e.target.value as QuestionType })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="YES_NO">Yes/No Question</option>
                        <option value="OPEN_TEXT">Open Text Question</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Timer (seconds)
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="60"
                        value={formData.timerSeconds}
                        onChange={(e) => setFormData({ ...formData, timerSeconds: parseInt(e.target.value) || 10 })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="10"
                      />
                      <p className="text-xs text-gray-500 mt-2 px-1">
                        {formData.responseType === 'YES_NO' ? '3-10 seconds recommended' : '10-60 seconds recommended'}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                      >
                        {editingQuestion ? 'Update' : 'Add'} Question
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingQuestion(null);
                          setFormData({ question: '', responseType: 'YES_NO', timerSeconds: 10 });
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


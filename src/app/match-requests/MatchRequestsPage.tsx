'use client';

import { useEffect, useState } from 'react';
import { getMatchRequests, getSentMatchRequests, respondToMatchRequest, completeMatchWithQuestions } from '@/app/actions/matchActions';
import { transformImageUrl } from '@/lib/util';
import RecipientQuestionModal from './RecipientQuestionModal';
import QuestionQuizModal from './QuestionQuizModal';
import { Question } from '@prisma/client';
import Image from 'next/image';

type MatchRequest = {
  id: string;
  status: string;
  createdAt: string;
  ignoreReason?: string;
  sender?: {
    name: string;
    user: {
      name: string;
      image: string;
    };
  };
  recipient?: {
    name: string;
    user: {
      name: string;
      image: string;
    };
  };
  responses: Array<{
    answer: string;
    question: {
      question: string;
      responseType: string;
    };
  }>;
};

export default function MatchRequestsPage() {
  const [receivedRequests, setReceivedRequests] = useState<MatchRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<MatchRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<MatchRequest | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showRecipientQuestionModal, setShowRecipientQuestionModal] = useState(false);
  const [showQuestionQuizModal, setShowQuestionQuizModal] = useState(false);
  const [recipientQuestions, setRecipientQuestions] = useState<Question[]>([]);
  const [pendingAcceptRequest, setPendingAcceptRequest] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [received, sent] = await Promise.all([
        getMatchRequests(),
        getSentMatchRequests(),
      ]);
      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (error) {
      console.error('Error loading match requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, action: 'accept' | 'ignore', reason?: string) => {
    try {
      const result = await respondToMatchRequest(requestId, action, reason);
      
      if (action === 'accept' && result.needsQuestions && result.questions) {
        // Show quiz modal
        setRecipientQuestions(result.questions);
        setPendingAcceptRequest(requestId);
        setShowQuestionQuizModal(true);
        return;
      }
      
      if (action === 'accept') {
        // Direct accept without questions
        loadRequests();
        return;
      }
      
      // Direct accept/ignore without questions or after questions
      loadRequests();
      setShowResponseModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error responding to match request:', error);
    }
  };

  const handleQuizSubmit = async (answers: { questionId: string; answer: string }[]) => {
    if (!pendingAcceptRequest) return;

    try {
      const result = await completeMatchWithQuestions(pendingAcceptRequest, answers);
      if (result.success) {
        loadRequests();
        setShowQuestionQuizModal(false);
        setPendingAcceptRequest(null);
        setRecipientQuestions([]);
        setShowResponseModal(false);
        setSelectedRequest(null);
      } else {
        console.error('Failed to complete match request:', result.message);
      }
    } catch (error) {
      console.error('Error completing match request with questions:', error);
    }
  };

  const handleViewResponses = (request: MatchRequest) => {
    setSelectedRequest(request);
    setShowResponseModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Match Requests</h1>
            <p className="text-gray-600 mt-2">Manage your match requests and responses</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'received'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Received ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'sent'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sent ({sentRequests.length})
            </button>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {activeTab === 'received' ? (
              receivedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💌</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No match requests</h3>
                  <p className="text-gray-600">You haven&apos;t received any match requests yet</p>
                </div>
              ) : (
                receivedRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Image
                          src={transformImageUrl(request.sender?.user.image) || '/images/user.png'}
                          alt={request.sender?.name || 'User'}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.sender?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                          {request.responses.length > 0 && (
                            <p className="text-sm text-purple-600">
                              Answered {request.responses.length} question(s)
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {request.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleViewResponses(request)}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              View Responses
                            </button>
                            <button
                              onClick={() => handleRespond(request.id, 'accept')}
                              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Optional reason for ignoring:');
                                handleRespond(request.id, 'ignore', reason || undefined);
                              }}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              Ignore
                            </button>
                          </>
                        )}
                        {request.status === 'ACCEPTED' && (
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                            Accepted
                          </span>
                        )}
                        {request.status === 'IGNORED' && (
                          <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg">
                            Ignored
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              sentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📤</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No sent requests</h3>
                  <p className="text-gray-600">You haven&apos;t sent any match requests yet</p>
                </div>
              ) : (
                sentRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Image
                          src={transformImageUrl(request.recipient?.user.image) || '/images/user.png'}
                          alt={request.recipient?.name || 'User'}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.recipient?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Sent {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                          {request.ignoreReason && (
                            <p className="text-sm text-red-600">
                              Reason: {request.ignoreReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {request.status === 'PENDING' && (
                          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
                            Pending
                          </span>
                        )}
                        {request.status === 'ACCEPTED' && (
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                            Accepted
                          </span>
                        )}
                        {request.status === 'IGNORED' && (
                          <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg">
                            Ignored
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>

          {/* Response Modal */}
          {showResponseModal && selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Responses from {selectedRequest.sender?.name}
                  </h2>
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  {selectedRequest.responses.map((response, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {response.question.question}
                      </h3>
                      <p className="text-gray-700">
                        {response.question.responseType === 'YES_NO' ? (
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                            response.answer.toLowerCase() === 'yes' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {response.answer}
                          </span>
                        ) : (
                          response.answer
                        )}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleRespond(selectedRequest.id, 'accept')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Accept Match
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Optional reason for ignoring:');
                      handleRespond(selectedRequest.id, 'ignore', reason || undefined);
                    }}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Ignore
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recipient Question Modal */}
          <RecipientQuestionModal
            questions={recipientQuestions}
            isOpen={showRecipientQuestionModal}
            onClose={() => {
              setShowRecipientQuestionModal(false);
              setPendingAcceptRequest(null);
              setRecipientQuestions([]);
            }}
            onSubmit={handleQuizSubmit}
          />

          {/* Question Quiz Modal */}
          <QuestionQuizModal
            questions={recipientQuestions}
            isOpen={showQuestionQuizModal}
            onClose={() => {
              setShowQuestionQuizModal(false);
              setPendingAcceptRequest(null);
              setRecipientQuestions([]);
            }}
            onSubmit={handleQuizSubmit}
            redirectAfterSubmit="/discover"
          />
        </div>
      </div>
    </div>
  );
}

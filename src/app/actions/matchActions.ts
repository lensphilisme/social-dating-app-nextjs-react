'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions';
import { notifyMatchRequest, notifyMatchAccepted } from './notificationActions';

export async function respondToMatchRequest(
  requestId: string, 
  action: 'accept' | 'ignore', 
  reason?: string
): Promise<{ success: boolean; message: string; needsQuestions?: boolean; questions?: any[] }> {
  const userId = await getAuthUserId();

  try {
    // Get the match request
    const matchRequest = await prisma.matchRequest.findFirst({
      where: {
        id: requestId,
        recipientId: userId,
        status: 'PENDING',
      },
      include: {
        responses: {
          include: {
            question: true,
          }
        }
      }
    });

    if (!matchRequest) {
      return { success: false, message: 'Match request not found' };
    }

    if (action === 'accept') {
      // Check if the sender has questions for the recipient to answer
      const senderQuestions = await prisma.question.findMany({
        where: {
          userId: matchRequest.senderId,
          isActive: true,
        }
      });

      if (senderQuestions.length > 0) {
        // Sender has questions, recipient needs to answer them
        // Return the questions so the UI can prompt the recipient
        return { 
          success: true, 
          message: 'Please answer the questions to complete the match',
          needsQuestions: true,
          questions: senderQuestions
        };
      } else {
        // No questions, create mutual match directly
        await prisma.$transaction(async (tx) => {
          // Update match request status
          await tx.matchRequest.update({
            where: { id: requestId },
            data: { 
              status: 'ACCEPTED',
              updatedAt: new Date(),
            }
          });

          // Create match record
          await tx.match.create({
            data: {
              user1Id: matchRequest.senderId,
              user2Id: matchRequest.recipientId,
            }
          });
        });

        return { success: true, message: 'Match accepted! You can now chat.' };
      }
    } else {
      // Ignore the request
      await prisma.matchRequest.update({
        where: { id: requestId },
        data: { 
          status: 'IGNORED',
          ignoreReason: reason,
          updatedAt: new Date(),
        }
      });

      return { success: true, message: 'Match request ignored' };
    }
  } catch (error) {
    console.error('Error responding to match request:', error);
    return { success: false, message: 'Failed to respond to match request' };
  }
}

export async function getMatchRequests(): Promise<any[]> {
  const userId = await getAuthUserId();

  const requests = await prisma.matchRequest.findMany({
    where: {
      recipientId: userId,
      status: 'PENDING',
    },
    include: {
      sender: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            }
          }
        }
      },
      responses: {
        include: {
          question: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  return requests;
}

export async function getSentMatchRequests(): Promise<any[]> {
  const userId = await getAuthUserId();

  const requests = await prisma.matchRequest.findMany({
    where: {
      senderId: userId,
    },
    include: {
      recipient: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            }
          }
        }
      },
      responses: {
        include: {
          question: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  return requests;
}

export async function completeMatchWithQuestions(
  requestId: string,
  responses: { questionId: string; answer: string }[]
): Promise<{ success: boolean; message: string }> {
  const userId = await getAuthUserId();

  try {
    // Get the match request
    const matchRequest = await prisma.matchRequest.findFirst({
      where: {
        id: requestId,
        recipientId: userId,
        status: 'PENDING',
      }
    });

    if (!matchRequest) {
      return { success: false, message: 'Match request not found' };
    }

    // Check if the original sender (User 1) has questions for User 2 to answer
    const senderQuestions = await prisma.question.findMany({
      where: {
        userId: matchRequest.senderId,
        isActive: true,
      }
    });

    await prisma.$transaction(async (tx) => {
      // Update match request status
      await tx.matchRequest.update({
        where: { id: requestId },
        data: { 
          status: 'ACCEPTED',
          updatedAt: new Date(),
        }
      });

      if (senderQuestions.length === 0) {
        // No questions from sender, create match directly
        const existingMatch = await tx.match.findFirst({
          where: {
            OR: [
              { user1Id: matchRequest.senderId, user2Id: matchRequest.recipientId },
              { user1Id: matchRequest.recipientId, user2Id: matchRequest.senderId }
            ]
          }
        });

        if (!existingMatch) {
          await tx.match.create({
            data: {
              user1Id: matchRequest.senderId,
              user2Id: matchRequest.recipientId,
            }
          });
        }
        
        // Send notification to the original sender
        const recipientMember = await prisma.member.findUnique({
          where: { userId: matchRequest.recipientId }
        });
        
        if (recipientMember) {
          await notifyMatchAccepted(
            matchRequest.recipientId,
            matchRequest.senderId,
            recipientMember.name
          );
        }
      } else {
        // Sender has questions, create a new match request from User 2 to User 1
        const newRequest = await tx.matchRequest.create({
          data: {
            senderId: matchRequest.recipientId, // User 2 sends to User 1
            recipientId: matchRequest.senderId, // User 1 receives from User 2
            status: 'PENDING', // User 1 needs to answer User 2's questions
          }
        });
        
        // Send notification to User 1 about the new request
        const senderMember = await prisma.member.findUnique({
          where: { userId: matchRequest.recipientId }
        });
        
        if (senderMember) {
          await notifyMatchRequest(
            matchRequest.recipientId,
            matchRequest.senderId,
            senderMember.name,
            newRequest.id
          );
        }
      }

      // Add responses to the match request (check for existing first)
      if (responses.length > 0) {
        // Get existing responses for this match request
        const existingResponses = await tx.matchResponse.findMany({
          where: { matchRequestId: requestId }
        });
        
        const existingQuestionIds = existingResponses.map(r => r.questionId);
        
        // Only create responses for questions that don't already have responses
        const newResponses = responses.filter(response => 
          !existingQuestionIds.includes(response.questionId)
        );
        
        if (newResponses.length > 0) {
          await tx.matchResponse.createMany({
            data: newResponses.map(response => ({
              matchRequestId: requestId,
              questionId: response.questionId,
              answer: response.answer,
            }))
          });
        }
      }
    });

    if (senderQuestions.length === 0) {
      return { success: true, message: 'Match completed! You can now chat.' };
    } else {
      return { success: true, message: 'Your answers have been sent! Now waiting for them to answer your questions.' };
    }
  } catch (error) {
    console.error('Error completing match with questions:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed')) {
        return { success: false, message: 'This match request has already been processed' };
      }
      return { success: false, message: error.message };
    }
    
    return { success: false, message: 'Failed to complete match' };
  }
}

export async function getMatches(): Promise<any[]> {
  const userId = await getAuthUserId();

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId },
      ]
    },
    include: {
      user1: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            }
          }
        }
      },
      user2: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  // Transform to show the other user
  return matches.map(match => ({
    ...match,
    otherUser: match.user1Id === userId ? match.user2 : match.user1,
  }));
}

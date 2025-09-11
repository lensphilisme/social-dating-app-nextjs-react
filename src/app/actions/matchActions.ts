'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions';

export async function respondToMatchRequest(
  requestId: string, 
  action: 'accept' | 'ignore', 
  reason?: string
): Promise<{ success: boolean; message: string }> {
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
      // Check if the recipient has questions for the sender
      const recipientQuestions = await prisma.question.findMany({
        where: {
          userId: matchRequest.recipientId,
          isActive: true,
        }
      });

      if (recipientQuestions.length > 0) {
        // Recipient has questions, need to get responses first
        // Return the questions so the UI can prompt the recipient
        return { 
          success: true, 
          message: 'Please answer the questions to complete the match',
          needsQuestions: true,
          questions: recipientQuestions
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

    // Create mutual match with responses
    await prisma.$transaction(async (tx) => {
      // Update match request status
      await tx.matchRequest.update({
        where: { id: requestId },
        data: { 
          status: 'ACCEPTED',
          updatedAt: new Date(),
        }
      });

      // Create match record (check if already exists)
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

        // Create a reverse match request to count as "sent" for the recipient
        await tx.matchRequest.create({
          data: {
            senderId: matchRequest.recipientId,
            recipientId: matchRequest.senderId,
            status: 'ACCEPTED', // Auto-accept since it's mutual
          }
        });
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

    return { success: true, message: 'Match completed! You can now chat.' };
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

'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions';

export async function acceptMatchRequestWithQuestions(
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

      // Create match record
      await tx.match.create({
        data: {
          user1Id: matchRequest.senderId,
          user2Id: matchRequest.recipientId,
        }
      });

      // Add responses to the match request
      if (responses.length > 0) {
        await tx.matchResponse.createMany({
          data: responses.map(response => ({
            matchRequestId: requestId,
            questionId: response.questionId,
            answer: response.answer,
          }))
        });
      }
    });

    return { success: true, message: 'Match accepted! You can now chat.' };
  } catch (error) {
    console.error('Error accepting match request:', error);
    return { success: false, message: 'Failed to accept match request' };
  }
}

export async function getRecipientQuestionsForMatch(requestId: string): Promise<any[]> {
  const userId = await getAuthUserId();

  // Verify the user is the recipient of this request
  const matchRequest = await prisma.matchRequest.findFirst({
    where: {
      id: requestId,
      recipientId: userId,
      status: 'PENDING',
    }
  });

  if (!matchRequest) {
    throw new Error('Match request not found or access denied');
  }

  // Get recipient's questions
  const questions = await prisma.question.findMany({
    where: {
      userId: matchRequest.recipientId,
      isActive: true,
    },
    orderBy: {
      createdAt: 'asc',
    }
  });

  return questions;
}

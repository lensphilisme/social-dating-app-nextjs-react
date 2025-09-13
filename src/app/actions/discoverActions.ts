'use server';

import { prisma } from '@/lib/prisma';
import { Member } from '@prisma/client';
import { getAuthUserId } from './authActions';
import { notifyMatchRequest } from './notificationActions';
import { addYears } from 'date-fns';

export async function getDiscoverMembers(): Promise<Member[]> {
  const userId = await getAuthUserId();
  
  // Get current user's member profile
  const currentUser = await prisma.member.findUnique({
    where: { userId },
    include: {
      sentMatchRequests: true,
      receivedMatchRequests: true,
      matchesAsUser1: true,
      matchesAsUser2: true,
    }
  });

  if (!currentUser) {
    throw new Error('User profile not found');
  }

  // Get users that the current user hasn't interacted with
  const interactedUserIds = [
    ...currentUser.sentMatchRequests.map(req => req.recipientId),
    ...currentUser.receivedMatchRequests.map(req => req.senderId),
    ...currentUser.matchesAsUser1.map(match => match.user2Id),
    ...currentUser.matchesAsUser2.map(match => match.user1Id),
  ];

  // Get members to discover (excluding current user and already interacted users)
  const members = await prisma.member.findMany({
    where: {
      userId: {
        not: userId,
        notIn: interactedUserIds,
      },
      image: {
        not: null,
      },
      // Add age filter (18-100)
      dateOfBirth: {
        gte: addYears(new Date(), -100),
        lte: addYears(new Date(), -18),
      },
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        }
      }
    },
    orderBy: {
      updated: 'desc',
    },
    take: 20,
  });

  return members;
}

export async function sendMatchRequest(
  recipientId: string, 
  responses: { questionId: string; answer: string }[]
): Promise<{ success: boolean; message: string }> {
  const senderId = await getAuthUserId();

  try {
    // Check if users are already matched
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: recipientId },
          { user1Id: recipientId, user2Id: senderId }
        ]
      }
    });

    if (existingMatch) {
      return { success: false, message: 'You are already matched with this user' };
    }

    // Check if there's already a pending request (to avoid spam)
    const pendingRequest = await prisma.matchRequest.findFirst({
      where: {
        senderId,
        recipientId,
        status: 'PENDING'
      }
    });

    if (pendingRequest) {
      return { success: false, message: 'You already have a pending request with this user' };
    }

    // Create match request with responses
    let matchRequestId: string = '';
    await prisma.$transaction(async (tx) => {
      const matchRequest = await tx.matchRequest.create({
        data: {
          senderId,
          recipientId,
          status: 'PENDING',
        }
      });
      
      matchRequestId = matchRequest.id;

      // Create responses
      await tx.matchResponse.createMany({
        data: responses.map(response => ({
          matchRequestId: matchRequest.id,
          questionId: response.questionId,
          answer: response.answer,
        }))
      });
    });

    // Send notification to recipient
    const senderMember = await prisma.member.findUnique({
      where: { userId: senderId }
    });
    
    if (senderMember) {
      await notifyMatchRequest(
        senderId,
        recipientId,
        senderMember.name,
        matchRequestId
      );
    }

    return { success: true, message: 'Match request sent successfully' };
  } catch (error) {
    console.error('Error sending match request:', error);
    return { success: false, message: 'Failed to send match request' };
  }
}

export async function getUserQuestions(userId: string): Promise<any[]> {
  const questions = await prisma.question.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      createdAt: 'asc',
    }
  });

  return questions;
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

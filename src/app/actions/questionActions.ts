'use server';

import { prisma } from '@/lib/prisma';
import { Question, QuestionType } from '@prisma/client';
import { getAuthUserId } from './authActions';

export async function getQuestions(): Promise<Question[]> {
  const userId = await getAuthUserId();
  
  const questions = await prisma.question.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  return questions;
}

export async function createQuestion(data: {
  question: string;
  responseType: QuestionType;
  timerSeconds?: number;
}): Promise<Question> {
  const userId = await getAuthUserId();
  
  // Ensure the user has a Member record
  const member = await prisma.member.findUnique({
    where: { userId }
  });
  
  if (!member) {
    throw new Error('Member profile not found. Please complete your profile first.');
  }
  
  const question = await prisma.question.create({
    data: {
      userId,
      question: data.question,
      responseType: data.responseType,
      timerSeconds: data.timerSeconds || 10,
    }
  });

  return question;
}

export async function updateQuestion(questionId: string, data: {
  question?: string;
  responseType?: QuestionType;
  isActive?: boolean;
  timerSeconds?: number;
}): Promise<Question> {
  const userId = await getAuthUserId();
  
  // Verify ownership
  const existingQuestion = await prisma.question.findFirst({
    where: {
      id: questionId,
      userId,
    }
  });

  if (!existingQuestion) {
    throw new Error('Question not found or access denied');
  }

  const question = await prisma.question.update({
    where: {
      id: questionId,
    },
    data: {
      question: data.question,
      responseType: data.responseType,
      isActive: data.isActive,
      timerSeconds: data.timerSeconds,
      updatedAt: new Date(),
    }
  });

  return question;
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const userId = await getAuthUserId();
  
  // Verify ownership
  const existingQuestion = await prisma.question.findFirst({
    where: {
      id: questionId,
      userId,
    }
  });

  if (!existingQuestion) {
    throw new Error('Question not found or access denied');
  }

  await prisma.question.delete({
    where: {
      id: questionId,
    }
  });
}


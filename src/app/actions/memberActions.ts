'use server';

import { prisma } from '@/lib/prisma';
import { GetMemberParams, PaginatedResponse } from '@/types';
import { Member, Photo } from '@prisma/client';
import { addYears } from 'date-fns';
import { getAuthUserId } from './authActions';

export async function getMembers(searchParams: GetMemberParams): Promise<PaginatedResponse<Member>> {
  const {
    ageRange = '18,100',
    gender = 'male,female',
    orderBy = 'updated',
    pageNumber = '1',
    pageSize = '12',
    withPhoto = 'true',
  } = searchParams;
  const userId = await getAuthUserId();

  const [minAge, maxAge] = ageRange.split(',');
  const currentDate = new Date();
  const minDob = addYears(currentDate, -maxAge - 1);
  const maxDob = addYears(currentDate, -minAge);

  const selectedGender = gender.split(',').map(g => g.toUpperCase());

  const page = parseInt(pageNumber);
  const limit = parseInt(pageSize);

  const skip = (page - 1) * limit;

  try {
    const count = await prisma.member.count({
      where: {
        AND: [
          { dateOfBirth: { gte: minDob } },
          { dateOfBirth: { lte: maxDob } },
          { gender: { in: selectedGender } },
          ...(withPhoto === 'true' ? [{ image: { not: null } }] : []),
        ],
        NOT: {
          userId,
        },
      },
    });

    const members = await prisma.member.findMany({
      where: {
        AND: [
          { dateOfBirth: { gte: minDob } },
          { dateOfBirth: { lte: maxDob } },
          { gender: { in: selectedGender } },
          ...(withPhoto === 'true' ? [{ image: { not: null } }] : []),
        ],
        NOT: {
          userId,
        },
      },
      include: {
        user: {
          select: {
            emailVerified: true
          }
        }
      },
      orderBy: { [orderBy]: 'desc' },
      skip,
      take: limit,
    });

    return {
      items: members,
      totalCount: count,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getMemberByUserId(userId: string) {
  try {
    return prisma.member.findUnique({ 
      where: { userId },
      include: {
        user: {
          include: {
            User: {
              include: {
                member: true
              }
            },
            other_User: {
              include: {
                member: true
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
}

export async function getMemberPhotosByUserId(userId: string) {
  const currentUserId = await getAuthUserId();

  const member = await prisma.member.findUnique({
    where: { userId },
    select: {
      photos: {
        where: currentUserId === userId ? {} : { isApproved: true },
      },
    },
  });

  if (!member) return null;

  return member.photos as Photo[];
}

export async function updateLastActive() {
  const userId = await getAuthUserId();

  try {
    // Check if member exists first
    const existingMember = await prisma.member.findUnique({
      where: { userId },
    });

    if (!existingMember) {
      // Member doesn't exist, don't try to update
      return null;
    }

    return prisma.member.update({
      where: { userId },
      data: { updated: new Date() },
    });
  } catch (error) {
    console.log(error);
    // Don't throw error, just log it to prevent breaking the page
    return null;
  }
}

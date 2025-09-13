'use server';

import { cloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { MemberEditSchema, memberEditSchema } from '@/lib/schemas/memberEditSchema';
import { ActionResult } from '@/types';
import { Member, Photo } from '@prisma/client';
import { getAuthUserId } from './authActions';

export async function updateMemberProfile(
  data: MemberEditSchema,
  nameUpdated: boolean
): Promise<ActionResult<Member>> {
  try {
    const userId = await getAuthUserId();

    const validated = memberEditSchema.safeParse(data);

    if (!validated.success) return { status: 'error', error: validated.error.errors };

    const { 
      name, 
      description, 
      city, 
      country,
      state,
      countryOfBirth,
      baptismDate,
      gender,
      dateOfBirth,
      firstName,
      lastName,
      congregation,
      baptismStatus,
      meetingAttendance,
      fieldService,
      spiritualStatement,
      moralIntegrity,
      maritalGoals,
      spiritualExpectations,
      childrenPreference,
      hobbies,
      education,
      profession,
      languages,
      favoriteScripture,
      spiritualAchievements,
      spiritualGoals
    } = validated.data;

    if (nameUpdated) {
      await prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    // Use upsert to handle both create and update
    const member = await prisma.member.upsert({
      where: { userId },
      update: {
        name,
        description,
        city,
        country,
        state,
        countryOfBirth,
        baptismDate: baptismDate ? new Date(baptismDate) : null,
        gender: gender || 'MALE',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1990-01-01'),
        firstName,
        lastName,
        congregation,
        baptismStatus,
        meetingAttendance,
        fieldService,
        spiritualStatement,
        moralIntegrity,
        maritalGoals,
        spiritualExpectations,
        childrenPreference,
        hobbies,
        education,
        profession,
        languages,
        favoriteScripture,
        spiritualAchievements,
        spiritualGoals,
        updated: new Date(),
      },
      create: {
        userId,
        name,
        description,
        city,
        country,
        state,
        countryOfBirth,
        baptismDate: baptismDate ? new Date(baptismDate) : null,
        gender: gender || 'MALE',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1990-01-01'),
        firstName,
        lastName,
        congregation,
        baptismStatus,
        meetingAttendance,
        fieldService,
        spiritualStatement,
        moralIntegrity,
        maritalGoals,
        spiritualExpectations,
        childrenPreference,
        hobbies,
        education,
        profession,
        languages,
        favoriteScripture,
        spiritualAchievements,
        spiritualGoals,
      },
    });
    return { status: 'success', data: member };
  } catch (error) {
    console.log(error);

    return { status: 'error', error: 'Something went wrong' };
  }
}

export async function addImage(url: string, publicId: string) {
  try {
    const userId = await getAuthUserId();

    // Check if member exists first
    const existingMember = await prisma.member.findUnique({
      where: { userId },
    });

    if (!existingMember) {
      throw new Error('Member profile not found. Please complete your profile first.');
    }

    return prisma.member.update({
      where: { userId },
      data: {
        photos: {
          create: [
            {
              url,
              publicId,
            },
          ],
        },
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function setMainImage(photo: Photo) {
  if (!photo.isApproved) throw new Error('Only approved photos can be set to main image');
  try {
    const userId = await getAuthUserId();

    // Check if member exists first
    const existingMember = await prisma.member.findUnique({
      where: { userId },
    });

    if (!existingMember) {
      throw new Error('Member profile not found. Please complete your profile first.');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { image: photo.url },
    });

    return prisma.member.update({
      where: { userId },
      data: { image: photo.url },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteImage(photo: Photo) {
  try {
    const userId = await getAuthUserId();

    // Check if member exists first
    const existingMember = await prisma.member.findUnique({
      where: { userId },
    });

    if (!existingMember) {
      throw new Error('Member profile not found. Please complete your profile first.');
    }

    if (photo.publicId) {
      await cloudinary.uploader.destroy(photo.publicId);
    }

    return prisma.member.update({
      where: { userId },
      data: {
        photos: {
          delete: { id: photo.id },
        },
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserInfoForNav() {
  try {
    const userId = await getAuthUserId();
    return prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, image: true },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

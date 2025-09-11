import { Suspense } from 'react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileDetailContent from '@/components/profile/ProfileDetailContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { createReferralCode } from '@/lib/referralUtils';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  try {
    const member = await prisma.member.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            referralCode: true,
            referralCount: true,
            referredBy: true
          }
        },
      }
    });

    if (!member) {
      redirect('/profile/edit');
    }

    // Ensure user has a referral code
    if (!member.user.referralCode) {
      await createReferralCode(session.user.id);
      // Refetch the member data with the new referral code
      const updatedMember = await prisma.member.findUnique({
        where: { userId: session.user.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              referralCode: true,
              referralCount: true,
              referredBy: true
            }
          }
        }
      });
      if (updatedMember) {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfileDetailContent member={updatedMember as any} />
          </Suspense>
        );
      }
    }

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ProfileDetailContent member={member as any} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching profile:', error);
    redirect('/profile/edit');
  }
}

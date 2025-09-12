import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;

    // Get the member data with all fields
    const member = await prisma.member.findUnique({
      where: {
        userId: userId
      },
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

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Get referrer info if this user was referred by someone
    let referrerInfo = null;
    if (member.user.referredBy) {
      const referrer = await prisma.user.findUnique({
        where: { id: member.user.referredBy },
        include: {
          member: true
        }
      });
      
      if (referrer) {
        referrerInfo = {
          id: referrer.id,
          name: referrer.member?.name || referrer.name || 'Unknown',
          referralCode: referrer.referralCode
        };
      }
    }

    // Get people referred by this user
    const referredUsers = await prisma.user.findMany({
      where: { referredBy: userId },
      include: {
        member: true
      }
    });

    const referredUsersData = referredUsers.map((referredUser: any) => ({
      id: referredUser.id,
      name: referredUser.member?.name || referredUser.name || 'Unknown',
      email: referredUser.email,
      joinedAt: referredUser.member?.created || new Date()
    }));

    return NextResponse.json({
      ...member,
      referralNetwork: {
        referralCode: member.user.referralCode,
        referralCount: referredUsersData.length, // Use actual count from database
        referredBy: referrerInfo,
        referredUsers: referredUsersData
      }
    });

  } catch (error) {
    console.error('Error fetching member data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

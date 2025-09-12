import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user's referral data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        member: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get referrer info (who referred this user)
    let referrerInfo = null;
    if (user.referredBy) {
      const referrer = await prisma.user.findUnique({
        where: { id: user.referredBy },
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
      where: { referredBy: user.id },
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
      success: true,
      data: {
        referralCode: user.referralCode,
        referralCount: referredUsersData.length, // Use actual count from database
        referredBy: referrerInfo,
        referredUsers: referredUsersData
      }
    });

  } catch (error) {
    console.error('Error fetching referral network:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

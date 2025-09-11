import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { regenerateReferralCode } from '@/lib/referralUtils';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newReferralCode = await regenerateReferralCode(session.user.id);

    return NextResponse.json({
      success: true,
      referralCode: newReferralCode
    });

  } catch (error) {
    console.error('Error regenerating referral code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

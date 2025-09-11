'use server';

import { validateReferralCode } from '@/lib/referralUtils';
import { ActionResult } from '@/types';

export async function validateReferralCodeAction(referralCode: string): Promise<ActionResult<{ valid: boolean; referrerName?: string }>> {
  try {
    const result = await validateReferralCode(referralCode);
    return { status: 'success', data: result };
  } catch (error) {
    console.log(error);
    return { status: 'error', error: 'Failed to validate referral code' };
  }
}


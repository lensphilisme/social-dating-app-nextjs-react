import { prisma } from './prisma';

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZqwertyuiopasdfghjklzxcvbnm!@#$%&0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createReferralCode(userId: string): Promise<string> {
  let referralCode: string;
  let isUnique = false;
  
  while (!isUnique) {
    referralCode = generateReferralCode();
    const existing = await prisma.user.findUnique({
      where: { referralCode }
    });
    if (!existing) {
      isUnique = true;
    }
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode }
  });
  
  return referralCode!;
}

export async function regenerateReferralCode(userId: string): Promise<string> {
  // Reset referral count and generate new code
  const newCode = await createReferralCode(userId);
  
  await prisma.user.update({
    where: { id: userId },
    data: { referralCount: 0 }
  });
  
  return newCode;
}

export async function validateReferralCode(referralCode: string): Promise<{ valid: boolean; referrerName?: string }> {
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
    include: { member: true }
  });
  
  if (!referrer) {
    return { valid: false };
  }
  
  return { 
    valid: true, 
    referrerName: referrer.member?.name || referrer.name || 'Unknown' 
  };
}

export async function useReferralCode(referralCode: string, newUserId: string): Promise<boolean> {
  const referrer = await prisma.user.findUnique({
    where: { referralCode }
  });
  
  if (!referrer) {
    return false;
  }
  
  // Update referral count
  const newCount = referrer.referralCount + 1;
  
  await prisma.user.update({
    where: { id: referrer.id },
    data: { referralCount: newCount }
  });
  
  // Link the new user to the referrer
  await prisma.user.update({
    where: { id: newUserId },
    data: { referredBy: referrer.id }
  });
  
  // If referral count reaches 5, regenerate the code
  if (newCount >= 5) {
    await regenerateReferralCode(referrer.id);
  }
  
  return true;
}

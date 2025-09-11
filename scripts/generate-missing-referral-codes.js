const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZqwertyuiopasdfghjklzxcvbnm!@#$%&0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateMissingReferralCodes() {
  try {
    console.log('🔄 Generating referral codes for users without them...');
    
    // Get all users without referral codes
    const usersWithoutCodes = await prisma.user.findMany({
      where: {
        referralCode: null
      }
    });
    
    console.log(`📊 Found ${usersWithoutCodes.length} users without referral codes`);
    
    for (const user of usersWithoutCodes) {
      let referralCode;
      let isUnique = false;
      
      // Generate unique referral code
      while (!isUnique) {
        referralCode = generateReferralCode();
        const existing = await prisma.user.findUnique({
          where: { referralCode }
        });
        if (!existing) {
          isUnique = true;
        }
      }
      
      // Update user with referral code
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode }
      });
      
      console.log(`✅ Generated code ${referralCode} for user ${user.name || user.email}`);
    }
    
    console.log('🎉 All missing referral codes generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating referral codes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateMissingReferralCodes();

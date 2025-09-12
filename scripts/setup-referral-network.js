const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupReferralNetwork() {
  try {
    console.log('Setting up referral network...');

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        member: true
      }
    });

    if (users.length < 2) {
      console.log('Need at least 2 users to create referral network');
      return;
    }

    console.log(`Found ${users.length} users`);

    // Create referral relationships
    const referralRelationships = [];

    // User 1 refers User 2
    if (users[0] && users[1]) {
      referralRelationships.push({
        referrerId: users[0].id,
        referredId: users[1].id
      });
    }

    // User 1 refers User 3 (if exists)
    if (users[0] && users[2]) {
      referralRelationships.push({
        referrerId: users[0].id,
        referredId: users[2].id
      });
    }

    // User 2 refers User 4 (if exists)
    if (users[1] && users[3]) {
      referralRelationships.push({
        referrerId: users[1].id,
        referredId: users[3].id
      });
    }

    // User 2 refers User 5 (if exists)
    if (users[1] && users[4]) {
      referralRelationships.push({
        referrerId: users[1].id,
        referredId: users[4].id
      });
    }

    // User 3 refers User 6 (if exists)
    if (users[2] && users[5]) {
      referralRelationships.push({
        referrerId: users[2].id,
        referredId: users[5].id
      });
    }

    console.log(`Creating ${referralRelationships.length} referral relationships...`);

    // Update referral relationships
    for (const relationship of referralRelationships) {
      // Update the referred user to point to the referrer
      await prisma.user.update({
        where: { id: relationship.referredId },
        data: { referredBy: relationship.referrerId }
      });

      // Update the referrer's referral count
      const referrer = await prisma.user.findUnique({
        where: { id: relationship.referrerId }
      });

      if (referrer) {
        await prisma.user.update({
          where: { id: relationship.referrerId },
          data: { referralCount: referrer.referralCount + 1 }
        });
      }

      console.log(`✓ ${users.find(u => u.id === relationship.referrerId)?.member?.name || 'User'} referred ${users.find(u => u.id === relationship.referredId)?.member?.name || 'User'}`);
    }

    // Generate referral codes for all users who don't have them
    console.log('Generating referral codes...');
    for (const user of users) {
      if (!user.referralCode) {
        const referralCode = generateReferralCode();
        await prisma.user.update({
          where: { id: user.id },
          data: { referralCode }
        });
        console.log(`✓ Generated referral code for ${user.member?.name || 'User'}: ${referralCode}`);
      }
    }

    console.log('Referral network setup complete!');
    
    // Display summary
    console.log('\n=== REFERRAL NETWORK SUMMARY ===');
    for (const user of users) {
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          member: true,
          other_User: {
            include: {
              member: true
            }
          }
        }
      });

      if (updatedUser) {
        console.log(`\n${updatedUser.member?.name || 'User'}:`);
        console.log(`  Referral Code: ${updatedUser.referralCode}`);
        console.log(`  Referral Count: ${updatedUser.referralCount}`);
        
        if (updatedUser.referredBy) {
          const referrer = await prisma.user.findUnique({
            where: { id: updatedUser.referredBy },
            include: { member: true }
          });
          console.log(`  Referred By: ${referrer?.member?.name || 'Unknown'}`);
        }
        
        if (updatedUser.other_User.length > 0) {
          console.log(`  Referred Users: ${updatedUser.other_User.map(u => u.member?.name || 'User').join(', ')}`);
        }
      }
    }

  } catch (error) {
    console.error('Error setting up referral network:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZqwertyuiopasdfghjklzxcvbnm!@#$%&0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

setupReferralNetwork();

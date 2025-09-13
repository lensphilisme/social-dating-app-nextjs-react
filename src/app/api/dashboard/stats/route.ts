import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { calculateProfileCompletion } from '@/lib/profileCompletion';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get user's member data for profile completion
    const member = await prisma.member.findUnique({
      where: { userId }
    });

    // Get dashboard stats from database
    const [
      totalLikes,
      totalMatches,
      totalMessages,
      profileViews,
      todayLikes,
      todayMatches,
      todayMessages,
      recentActivity
    ] = await Promise.all([
      // Count total likes received
      (prisma as any).favorite.count({
        where: {
          targetId: userId
        }
      }),
      
      // Count total matches
      prisma.match.count({
        where: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      }),
      
      // Count total messages sent and received
      prisma.message.count({
        where: {
          OR: [
            { senderId: userId },
            { recipientId: userId }
          ]
        }
      }),
      
      // Profile views - get today's views
      (prisma as any).profileView.count({
        where: {
          viewedId: userId,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // Today's likes received
      (prisma as any).favorite.count({
        where: {
          targetId: userId,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // Today's matches
      prisma.match.count({
        where: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ],
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // Today's messages sent
      prisma.message.count({
        where: {
          senderId: userId,
          created: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // Recent activity from real data
      Promise.all([
        // Recent matches
        prisma.match.findMany({
          where: {
            OR: [
              { user1Id: userId },
              { user2Id: userId }
            ]
          },
          include: {
            user1: true,
            user2: true
          },
          orderBy: { createdAt: 'desc' },
          take: 2
        }),
        // Recent likes
        (prisma as any).favorite.findMany({
          where: { targetId: userId },
          include: {
            user: true
          },
          orderBy: { createdAt: 'desc' },
          take: 2
        }),
        // Recent messages
        prisma.message.findMany({
          where: { recipientId: userId },
          include: {
            sender: true
          },
          orderBy: { created: 'desc' },
          take: 2
        })
      ]).then(([matches, likes, messages]) => {
        const activities: any[] = [];
        
        matches.forEach((match: any) => {
          const otherUser = match.user1Id === userId ? match.user2 : match.user1;
          activities.push({
            id: `match-${match.id}`,
            type: 'match',
            user: {
              name: otherUser.name || 'Unknown',
              image: otherUser.image || '/images/user.png'
            },
            time: formatTimeAgo(match.createdAt),
            message: 'matched with you'
          });
        });
        
        likes.forEach((like: any) => {
          activities.push({
            id: `like-${like.id}`,
            type: 'like',
            user: {
              name: like.user.name || 'Unknown',
              image: like.user.image || '/images/user.png'
            },
            time: formatTimeAgo(like.createdAt),
            message: 'liked your profile'
          });
        });
        
        messages.forEach((message: any) => {
          activities.push({
            id: `message-${message.id}`,
            type: 'message',
            user: {
              name: message.sender.name || 'Unknown',
              image: message.sender.image || '/images/user.png'
            },
            time: formatTimeAgo(message.created),
            message: 'sent you a message'
          });
        });
        
        return activities.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
      })
    ]);

    // Calculate profile completion
    const profileCompletion = member ? calculateProfileCompletion(member).completionPercentage : 0;

    return NextResponse.json({
      totalLikes,
      totalMatches,
      totalMessages,
      profileViews,
      todayLikes,
      todayMatches,
      todayMessages,
      profileCompletion,
      recentActivity
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

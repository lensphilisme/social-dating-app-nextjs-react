'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions';

// Get user's reports (both sent and received)
export async function getUserReports() {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Get sent reports (reports user submitted)
    const sentReports = await prisma.report.findMany({
      where: { reporterId: userId },
      include: {
        reported: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            member: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        supportChat: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get received reports (reports where user was reported - only resolved ones)
    const receivedReports = await prisma.report.findMany({
      where: { 
        reportedId: userId,
        status: 'RESOLVED' // Only show resolved reports (which includes accepted ones)
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            member: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        supportChat: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      sent: sentReports,
      received: receivedReports
    };
  } catch (error) {
    console.error('Error fetching user reports:', error);
    return [];
  }
}

// Get user's sent reports
export async function getUserSentReports() {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const reports = await prisma.report.findMany({
      where: { reporterId: userId },
      include: {
        reported: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            member: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        supportChat: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reports;
  } catch (error) {
    console.error('Error fetching user sent reports:', error);
    return [];
  }
}

// Get user's received reports (only if accepted/resolved)
export async function getUserReceivedReports() {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const reports = await prisma.report.findMany({
      where: { 
        reportedId: userId,
        status: 'RESOLVED' // Only show resolved reports (which includes accepted ones)
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            member: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        supportChat: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reports;
  } catch (error) {
    console.error('Error fetching user received reports:', error);
    return [];
  }
}

// Get report by ID (for user view)
export async function getUserReportById(reportId: string) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        OR: [
          { reporterId: userId },
          { reportedId: userId }
        ]
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            member: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        reported: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            member: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        supportChat: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    });

    return report;
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
}

// Get user's report statistics
export async function getUserReportStats() {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const [
      totalSent,
      pendingSent,
      underReviewSent,
      askMoreDetailsSent,
      acceptedSent,
      rejectedSent,
      resolvedSent,
      dismissedSent,
      totalReceived,
      acceptedReceived,
      resolvedReceived
    ] = await Promise.all([
      prisma.report.count({ where: { reporterId: userId } }),
      prisma.report.count({ where: { reporterId: userId, status: 'PENDING' } }),
      prisma.report.count({ where: { reporterId: userId, status: 'UNDER_REVIEW' } }),
      prisma.report.count({ where: { reporterId: userId, status: 'ASK_MORE_DETAILS' } }),
      prisma.report.count({ where: { reporterId: userId, status: 'ACCEPTED' } }),
      prisma.report.count({ where: { reporterId: userId, status: 'REJECTED' } }),
      prisma.report.count({ where: { reporterId: userId, status: 'RESOLVED' } }),
      prisma.report.count({ where: { reporterId: userId, status: 'DISMISSED' } }),
      prisma.report.count({ where: { reportedId: userId } }),
      prisma.report.count({ where: { reportedId: userId, status: 'ACCEPTED' } }),
      prisma.report.count({ where: { reportedId: userId, status: 'RESOLVED' } })
    ]);

    return {
      sent: {
        total: totalSent,
        pending: pendingSent,
        underReview: underReviewSent,
        askMoreDetails: askMoreDetailsSent,
        accepted: acceptedSent,
        rejected: rejectedSent,
        resolved: resolvedSent,
        dismissed: dismissedSent
      },
      received: {
        total: totalReceived,
        accepted: acceptedReceived,
        resolved: resolvedReceived
      }
    };
  } catch (error) {
    console.error('Error fetching user report stats:', error);
    return null;
  }
}

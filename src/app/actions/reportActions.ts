'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions';
import { ReportType, ReportStatus } from '@prisma/client';

export async function createReport(data: {
  reportedId: string;
  type: ReportType;
  reason: string;
  description?: string;
  proof?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const reporterId = await getAuthUserId();
    
    if (reporterId === data.reportedId) {
      return { success: false, message: 'You cannot report yourself' };
    }

    // Check if user already reported this person
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId,
        reportedId: data.reportedId,
        status: { in: ['PENDING', 'UNDER_REVIEW'] }
      }
    });

    if (existingReport) {
      return { success: false, message: 'You have already reported this user' };
    }

    await prisma.report.create({
      data: {
        reporterId,
        reportedId: data.reportedId,
        type: data.type,
        reason: data.reason,
        description: data.description,
        proof: data.proof,
      }
    });

    return { success: true, message: 'Report submitted successfully' };
  } catch (error) {
    console.error('Error creating report:', error);
    return { success: false, message: 'Failed to submit report' };
  }
}

export async function getReports(): Promise<any[]> {
  try {
    const userId = await getAuthUserId();
    
    const reports = await prisma.report.findMany({
      where: { reporterId: userId },
      include: {
        reported: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

export async function getReportCount(): Promise<number> {
  try {
    const userId = await getAuthUserId();
    
    const count = await prisma.report.count({
      where: { reporterId: userId }
    });

    return count;
  } catch (error) {
    console.error('Error fetching report count:', error);
    return 0;
  }
}

// Admin functions
export async function getAllReports(): Promise<any[]> {
  try {
    const userId = await getAuthUserId();
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        reported: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reports;
  } catch (error) {
    console.error('Error fetching all reports:', error);
    return [];
  }
}

export async function updateReportStatus(
  reportId: string, 
  status: ReportStatus, 
  adminNotes?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getAuthUserId();
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        adminNotes,
        updatedAt: new Date(),
      }
    });

    return { success: true, message: 'Report status updated' };
  } catch (error) {
    console.error('Error updating report status:', error);
    return { success: false, message: 'Failed to update report status' };
  }
}

export async function banUser(
  userId: string,
  reason: string,
  duration?: number
): Promise<{ success: boolean; message: string }> {
  try {
    const adminId = await getAuthUserId();
    
    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true }
    });

    if (admin?.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' };
    }

    const expiresAt = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;

    await prisma.userBan.create({
      data: {
        userId,
        reason,
        duration,
        expiresAt,
      }
    });

    return { success: true, message: 'User banned successfully' };
  } catch (error) {
    console.error('Error banning user:', error);
    return { success: false, message: 'Failed to ban user' };
  }
}

export async function checkUserBan(userId: string): Promise<boolean> {
  try {
    const activeBan = await prisma.userBan.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [
          { expiresAt: null }, // Permanent ban
          { expiresAt: { gt: new Date() } } // Not expired
        ]
      }
    });

    return !!activeBan;
  } catch (error) {
    console.error('Error checking user ban:', error);
    return false;
  }
}

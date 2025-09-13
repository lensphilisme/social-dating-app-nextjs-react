'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions';
import { ReportStatus, SupportChatType, SupportChatStatus, SupportMessageType } from '@prisma/client';

// Get all reports with enhanced data
export async function getAllReportsWithDetails() {
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
        assignedAdmin: {
          select: {
            id: true,
            name: true,
            email: true
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
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

// Update report status
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  adminNotes?: string,
  assignedTo?: string
) {
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

    // Get the current report to check the reported user
    const currentReport = await prisma.report.findUnique({
      where: { id: reportId },
      select: { reportedId: true }
    });

    if (!currentReport) {
      throw new Error('Report not found');
    }

    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        adminNotes,
        assignedTo,
        updatedAt: new Date()
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reported: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create support chat if status is ASK_MORE_DETAILS
    if (status === 'ASK_MORE_DETAILS') {
      await createSupportChatForReport(reportId, userId);
    }

    // Both ACCEPTED and REJECTED resolve the report
    if (status === 'ACCEPTED' || status === 'REJECTED') {
      await prisma.report.update({
        where: { id: reportId },
        data: { status: 'RESOLVED' }
      });
    }

    // Note: ACCEPTED reports will show on user's record (handled in user queries)
    // REJECTED reports will be hidden from user's received reports view

    return { success: true, report };
  } catch (error) {
    console.error('Error updating report status:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Create support chat for report
export async function createSupportChatForReport(reportId: string, adminId: string) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: true
      }
    });

    if (!report) {
      throw new Error('Report not found');
    }

    // Check if support chat already exists
    const existingChat = await prisma.supportChat.findUnique({
      where: { reportId }
    });

    if (existingChat) {
      return existingChat;
    }

    const supportChat = await prisma.supportChat.create({
      data: {
        reportId,
        userId: report.reporterId,
        adminId,
        type: 'REPORT_SUPPORT',
        status: 'WAITING_USER',
        subject: `Report Support - ${report.type}`
      }
    });

    // Send initial system message
    await prisma.supportMessage.create({
      data: {
        chatId: supportChat.id,
        senderId: adminId,
        senderType: 'ADMIN',
        type: 'SYSTEM',
        content: 'Admin has requested more details about your report. Please provide additional information.'
      }
    });

    return supportChat;
  } catch (error) {
    console.error('Error creating support chat:', error);
    throw error;
  }
}

// Get support chats for admin
export async function getAdminSupportChats() {
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

    const chats = await prisma.supportChat.findMany({
      where: {
        OR: [
          { adminId: userId },
          { adminId: null }
        ]
      },
      include: {
        user: {
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
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        report: {
          select: {
            id: true,
            type: true,
            status: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderType: 'USER'
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { updatedAt: 'desc' }
      ]
    });

    return chats;
  } catch (error) {
    console.error('Error fetching support chats:', error);
    return [];
  }
}

// Get support chat messages
export async function getSupportChatMessages(chatId: string) {
  try {
    const userId = await getAuthUserId();
    
    // Check if user is admin or the owner of the support chat
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    // Get the support chat to check ownership
    const supportChat = await prisma.supportChat.findUnique({
      where: { id: chatId },
      select: { userId: true, adminId: true }
    });

    if (!supportChat) {
      throw new Error('Support chat not found');
    }

    // Allow access if user is admin, or if user is the owner of the chat, or if user is the admin assigned to the chat
    const isAuthorized = user?.role === 'ADMIN' || 
                        supportChat.userId === userId || 
                        supportChat.adminId === userId;

    if (!isAuthorized) {
      throw new Error('Unauthorized');
    }

    const messages = await prisma.supportMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read
    await prisma.supportMessage.updateMany({
      where: {
        chatId,
        senderType: 'USER',
        isRead: false
      },
      data: { isRead: true }
    });

    return messages;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
}

// Send support message
export async function sendSupportMessage(
  chatId: string,
  content: string,
  type: SupportMessageType = 'TEXT',
  fileUrl?: string,
  fileName?: string,
  fileSize?: number
) {
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

    const message = await prisma.supportMessage.create({
      data: {
        chatId,
        senderId: userId,
        senderType: 'ADMIN',
        type,
        content,
        fileUrl,
        fileName,
        fileSize
      }
    });

    // Update chat status and timestamp
    await prisma.supportChat.update({
      where: { id: chatId },
      data: {
        status: 'WAITING_USER',
        updatedAt: new Date()
      }
    });

    return { success: true, message };
  } catch (error) {
    console.error('Error sending support message:', error);
    return { success: false, error: error.message };
  }
}

// Assign report to admin
export async function assignReportToAdmin(reportId: string, adminId: string) {
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

    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        assignedTo: adminId,
        status: 'UNDER_REVIEW',
        updatedAt: new Date()
      }
    });

    return { success: true, report };
  } catch (error) {
    console.error('Error assigning report:', error);
    return { success: false, error: error.message };
  }
}

// Get report statistics
export async function getReportStatistics() {
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

    const [
      totalReports,
      pendingReports,
      underReviewReports,
      askMoreDetailsReports,
      acceptedReports,
      rejectedReports,
      resolvedReports,
      dismissedReports
    ] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.report.count({ where: { status: 'ASK_MORE_DETAILS' } }),
      prisma.report.count({ where: { status: 'ACCEPTED' } }),
      prisma.report.count({ where: { status: 'REJECTED' } }),
      prisma.report.count({ where: { status: 'RESOLVED' } }),
      prisma.report.count({ where: { status: 'DISMISSED' } })
    ]);

    const reportTypes = await prisma.report.groupBy({
      by: ['type'],
      _count: { type: true }
    });

    const reportPriorities = await prisma.report.groupBy({
      by: ['priority'],
      _count: { priority: true }
    });

    return {
      total: totalReports,
      pending: pendingReports,
      underReview: underReviewReports,
      askMoreDetails: askMoreDetailsReports,
      accepted: acceptedReports,
      rejected: rejectedReports,
      resolved: resolvedReports,
      dismissed: dismissedReports,
      byType: reportTypes,
      byPriority: reportPriorities
    };
  } catch (error) {
    console.error('Error fetching report statistics:', error);
    return null;
  }
}

// Get user's support chats (for user side)
export async function getUserSupportChats() {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const chats = await prisma.supportChat.findMany({
      where: { userId },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        report: {
          select: {
            id: true,
            type: true,
            status: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderType: 'ADMIN'
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { updatedAt: 'desc' }
      ]
    });

    return chats;
  } catch (error) {
    console.error('Error fetching user support chats:', error);
    return [];
  }
}

// Send user support message
export async function sendUserSupportMessage(
  chatId: string,
  content: string,
  type: SupportMessageType = 'TEXT',
  fileUrl?: string,
  fileName?: string,
  fileSize?: number
) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Verify user owns this chat
    const chat = await prisma.supportChat.findFirst({
      where: {
        id: chatId,
        userId
      }
    });

    if (!chat) {
      throw new Error('Chat not found or unauthorized');
    }

    const message = await prisma.supportMessage.create({
      data: {
        chatId,
        senderId: userId,
        senderType: 'USER',
        type,
        content,
        fileUrl,
        fileName,
        fileSize
      }
    });

    // Update chat status and timestamp
    await prisma.supportChat.update({
      where: { id: chatId },
      data: {
        status: 'WAITING_ADMIN',
        updatedAt: new Date()
      }
    });

    return { success: true, message };
  } catch (error) {
    console.error('Error sending user support message:', error);
    return { success: false, error: error.message };
  }
}

// Admin send message to both users about a report
export async function adminSendReportMessage(
  reportId: string,
  content: string,
  type: SupportMessageType = 'TEXT',
  fileUrl?: string,
  fileName?: string,
  fileSize?: number,
  targetUserId?: string
) {
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

    // Get the report
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: true,
        reported: true
      }
    });

    if (!report) {
      throw new Error('Report not found');
    }

    // Create or get support chat for the report
    let supportChat = await prisma.supportChat.findUnique({
      where: { reportId }
    });

    if (!supportChat) {
      // Use targetUserId if provided, otherwise default to reporterId
      const chatUserId = targetUserId || report.reporterId;
      
      supportChat = await prisma.supportChat.create({
        data: {
          reportId,
          userId: chatUserId,
          adminId: userId,
          type: 'REPORT_SUPPORT',
          status: 'WAITING_USER',
          subject: `Report Support - ${report.type}`
        }
      });
    }

    // Send message to the support chat
    const message = await prisma.supportMessage.create({
      data: {
        chatId: supportChat.id,
        senderId: userId,
        senderType: 'ADMIN',
        type,
        content,
        fileUrl,
        fileName,
        fileSize
      }
    });

    // Update chat status and timestamp
    await prisma.supportChat.update({
      where: { id: supportChat.id },
      data: {
        status: 'WAITING_USER',
        updatedAt: new Date()
      }
    });

    return { success: true, message, supportChat };
  } catch (error) {
    console.error('Error sending admin report message:', error);
    return { success: false, error: error.message };
  }
}

// Create user support chat
export async function createUserSupportChat(
  type: SupportChatType,
  subject: string,
  initialMessage: string
) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Create the support chat
    const chat = await prisma.supportChat.create({
      data: {
        userId,
        type,
        status: 'WAITING_ADMIN',
        subject
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create the initial message
    const message = await prisma.supportMessage.create({
      data: {
        chatId: chat.id,
        senderId: userId,
        senderType: 'USER',
        type: 'TEXT',
        content: initialMessage
      }
    });

    return { success: true, chat, message };
  } catch (error) {
    console.error('Error creating user support chat:', error);
    return { success: false, error: error.message };
  }
}

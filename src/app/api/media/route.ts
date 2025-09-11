import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch user's media
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'IMAGE', 'VIDEO', 'AUDIO'
    const userId = searchParams.get('userId') || session.user.id;

    const where: any = {
      userId: userId,
      isPublic: true
    };

    if (type) {
      where.type = type;
    }

    const media = await prisma.userMedia.findMany({
      where,
      orderBy: [
        { isMain: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(media);

  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete media
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 });
    }

    // Check if user owns this media
    const media = await prisma.userMedia.findFirst({
      where: {
        id: mediaId,
        userId: session.user.id
      }
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete file from filesystem
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', media.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
    }

    // Delete from database
    await prisma.userMedia.delete({
      where: {
        id: mediaId
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update media (set as main, update order, etc.)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, isMain, order, title, description } = data;

    if (!id) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 });
    }

    // Check if user owns this media
    const media = await prisma.userMedia.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // If setting as main, unset other main media of the same type
    if (isMain) {
      await prisma.userMedia.updateMany({
        where: {
          userId: session.user.id,
          type: media.type,
          isMain: true,
          id: { not: id }
        },
        data: {
          isMain: false
        }
      });
    }

    // Update media
    const updatedMedia = await prisma.userMedia.update({
      where: { id },
      data: {
        isMain: isMain !== undefined ? isMain : media.isMain,
        order: order !== undefined ? order : media.order,
        title: title !== undefined ? title : media.title,
        description: description !== undefined ? description : media.description
      }
    });

    return NextResponse.json({
      success: true,
      media: updatedMedia
    });

  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'IMAGE', 'VIDEO', 'AUDIO'
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isMain = formData.get('isMain') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // For now, we'll store files in the public directory
    // In production, you'd upload to cloud storage (AWS S3, Cloudinary, etc.)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `/uploads/${fileName}`;
    
    // Save file to public/uploads directory
    const fs = require('fs');
    const path = require('path');
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(uploadDir, fileName), buffer);

    // If this is set as main, unset other main media of the same type
    if (isMain) {
      await prisma.userMedia.updateMany({
        where: {
          userId: session.user.id,
          type: type as any,
          isMain: true
        },
        data: {
          isMain: false
        }
      });
    }

    // Create media record in database
    const media = await prisma.userMedia.create({
      data: {
        userId: session.user.id,
        type: type as any,
        url: filePath,
        title: title || file.name,
        description: description || '',
        isMain: isMain,
        order: 0
      }
    });

    return NextResponse.json({
      success: true,
      media: {
        id: media.id,
        url: media.url,
        type: media.type,
        title: media.title,
        description: media.description,
        isMain: media.isMain,
        createdAt: media.createdAt
      }
    });

  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

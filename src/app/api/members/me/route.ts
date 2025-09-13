import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = await prisma.member.findUnique({
      where: {
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching member data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Update member profile
    const updatedMember = await prisma.member.update({
      where: {
        userId: session.user.id
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        city: data.city,
        country: data.country,
        state: data.state,
        countryOfBirth: data.countryOfBirth,
        description: data.description,
        hobbies: data.hobbies,
        education: data.education,
        profession: data.profession,
        languages: data.languages,
        baptismStatus: data.baptismStatus,
        baptismDate: data.baptismDate ? new Date(data.baptismDate) : undefined,
        congregation: data.congregation,
        meetingAttendance: data.meetingAttendance,
        fieldService: data.fieldService,
        moralIntegrity: data.moralIntegrity,
        maritalGoals: data.maritalGoals,
        childrenPreference: data.childrenPreference,
        spiritualExpectations: data.spiritualExpectations,
        spiritualStatement: data.spiritualStatement,
        favoriteScripture: data.favoriteScripture,
        spiritualAchievements: data.spiritualAchievements,
        spiritualGoals: data.spiritualGoals,
        image: data.image,
        updated: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating member data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

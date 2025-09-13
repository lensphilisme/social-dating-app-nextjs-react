import { NextResponse } from 'next/server';
import { getPublicNavigationSettings } from '@/app/actions/adminSystemActions';

export async function GET() {
  try {
    const settings = await getPublicNavigationSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching navigation settings:', error);
    return NextResponse.json({ error: 'Failed to fetch navigation settings' }, { status: 500 });
  }
}


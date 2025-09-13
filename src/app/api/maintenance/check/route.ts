import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const maintenanceSetting = await (prisma as any).adminSettings.findUnique({
      where: { key: 'maintenance_mode' }
    });

    const maintenanceMode = maintenanceSetting?.value === 'true';

    return NextResponse.json({ 
      maintenanceMode,
      message: maintenanceMode ? 'Maintenance mode is enabled' : 'Maintenance mode is disabled'
    });
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return NextResponse.json({ 
      maintenanceMode: false,
      message: 'Error checking maintenance mode'
    }, { status: 500 });
  }
}


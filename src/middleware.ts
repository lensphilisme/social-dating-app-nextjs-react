import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Skip middleware for auth pages
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Skip middleware for maintenance page itself
  if (pathname === '/maintenance') {
    return NextResponse.next();
  }

  try {
    // Check if maintenance mode is enabled
    const maintenanceResponse = await fetch(`${request.nextUrl.origin}/api/maintenance/check`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (maintenanceResponse.ok) {
      const { maintenanceMode } = await maintenanceResponse.json();
      
      if (maintenanceMode) {
        // Check if user is admin
        const token = await getToken({ 
          req: request, 
          secret: process.env.NEXTAUTH_SECRET 
        });

        const isAdmin = token?.role === 'ADMIN';
        
        // Allow admin access to admin routes even during maintenance
        if (isAdmin && pathname.startsWith('/admin')) {
          return NextResponse.next();
        }
        
        // Allow admin access to login page during maintenance
        if (isAdmin && pathname === '/auth/signin') {
          return NextResponse.next();
        }
        
        // Redirect all other users to maintenance page
        if (!isAdmin) {
          return NextResponse.redirect(new URL('/maintenance', request.url));
        }
      }
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // Continue if there's an error checking maintenance mode
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
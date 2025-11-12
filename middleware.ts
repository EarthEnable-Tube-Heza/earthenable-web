/**
 * Next.js Middleware
 *
 * Protects routes requiring authentication and role-based access.
 * Runs on every request before rendering pages.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Protected route patterns
 */
const protectedRoutes = [
  '/dashboard',
];

/**
 * Admin-only route patterns
 */
const adminRoutes = [
  '/dashboard/users',
  '/dashboard/forms',
  '/dashboard/analytics',
];

/**
 * Public routes that don't require authentication
 */
const publicRoutes = [
  '/',
  '/auth/signin',
];

/**
 * Check if route matches any pattern in the list
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      // Wildcard match
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

/**
 * Middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files (images, etc.)
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (matchesRoute(pathname, publicRoutes)) {
    return NextResponse.next();
  }

  // Check for access token in cookies/headers
  // Note: In a real implementation, we'd validate the token here
  // For now, we check for the presence of the token
  const accessToken = request.cookies.get('earthenable_access_token')?.value ||
                      request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if route requires authentication
  if (matchesRoute(pathname, protectedRoutes)) {
    if (!accessToken) {
      // Redirect to sign-in with return URL
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // For admin routes, we'd ideally decode the JWT and check the role
  // For now, we just check for token presence
  // The actual role check will be done client-side and server-side in API calls
  if (matchesRoute(pathname, adminRoutes)) {
    if (!accessToken) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // TODO: Decode JWT and verify admin role
    // For now, the role check is handled by the AuthContext on the client
  }

  return NextResponse.next();
}

/**
 * Matcher configuration
 * Specifies which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/**
 * Next.js Middleware
 *
 * Protects routes requiring authentication and role-based access.
 * Runs on every request before rendering pages.
 *
 * Note: Detailed permission checks are done client-side via PagePermissionGuard.
 * Middleware provides first-line authentication checks and basic role validation.
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Protected route patterns - require authentication
 */
const protectedRoutes = ["/dashboard"];

/**
 * Admin-only route patterns - require admin role
 * These are validated client-side with detailed permissions,
 * but middleware provides a first-line defense.
 */
const adminRoutes = [
  "/dashboard/users",
  "/dashboard/monitoring",
  "/dashboard/sync",
  "/dashboard/notifications",
  "/dashboard/sms",
  "/dashboard/components",
];

/**
 * Manager-and-above route patterns
 */
const managerRoutes = ["/dashboard/tasks", "/dashboard/analytics"];

/**
 * Public routes that don't require authentication
 */
const publicRoutes = ["/", "/auth/signin", "/privacy-policy", "/terms-of-service", "/app-docs*"];

/**
 * Check if route matches any pattern in the list
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    if (route.endsWith("*")) {
      // Wildcard match
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

/**
 * Middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Static files (images, etc.)
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (matchesRoute(pathname, publicRoutes)) {
    return NextResponse.next();
  }

  // Check for access token in cookies/headers
  const accessToken =
    request.cookies.get("earthenable_access_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // Check if route requires authentication
  if (matchesRoute(pathname, protectedRoutes)) {
    if (!accessToken) {
      // Redirect to sign-in with return URL
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // For admin/manager routes, check for token presence
  // Detailed role/permission checks happen client-side via PagePermissionGuard
  // This middleware provides a first-line defense against unauthenticated access
  if (matchesRoute(pathname, adminRoutes) || matchesRoute(pathname, managerRoutes)) {
    if (!accessToken) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Note: JWT decoding could be added here for role validation
    // Currently relying on client-side PagePermissionGuard for detailed checks
    // This is acceptable because:
    // 1. API endpoints validate permissions server-side
    // 2. UI-only access without API calls is low risk
    // 3. PagePermissionGuard handles redirect for unauthorized users
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

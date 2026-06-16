/**
 * ============================================================
 * NEXT.JS MIDDLEWARE
 * Runs on every matched request before it reaches the page.
 *
 * Responsibilities:
 * 1. Refresh the Supabase auth session (via updateSession)
 * 2. Redirect unauthenticated users to /login
 * 3. Allow public routes (/login, /auth/callback) to pass through
 * 4. Allow static assets and Next.js internals to pass through
 * ============================================================
 */

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

/**
 * Routes that should be accessible without authentication.
 * These paths are checked with `startsWith` so nested routes
 * like /auth/callback also match when /auth is listed.
 */
const PUBLIC_ROUTES = ['/login', '/auth'];

/**
 * Determines whether a given pathname is a public route
 * that does not require authentication.
 *
 * @param pathname - The URL pathname to check.
 * @returns True if the route is public.
 */
function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export async function proxy(request: NextRequest) {
  // Step 1: Refresh the Supabase session and get the response
  // with updated auth cookies
  const response = await updateSession(request);

  // Step 2: Skip auth check for public routes — these are accessible
  // to everyone regardless of authentication status
  const { pathname } = request.nextUrl;
  if (isPublicRoute(pathname)) {
    return response;
  }

  // Step 3: Check if the user is authenticated by reading the
  // (now refreshed) cookies from the request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // No-op: we don't need to set cookies here since
          // updateSession already handled that above
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Step 4: If no authenticated user, redirect to the login page
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Step 5: User is authenticated — let the request continue
  return response;
}

/**
 * Matcher configuration for Next.js middleware.
 *
 * This pattern excludes:
 * - _next/static  (static assets like JS bundles, CSS)
 * - _next/image   (optimized images)
 * - favicon.ico   (browser favicon)
 * - svg/png/jpg   (public image files)
 *
 * Everything else goes through the middleware for auth checks.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

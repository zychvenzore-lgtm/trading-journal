/**
 * ============================================================
 * SUPABASE MIDDLEWARE HELPER
 * Refreshes the Supabase auth session on every request.
 *
 * This function is called from the Next.js middleware. It creates
 * a Supabase client that reads cookies from the incoming request
 * and writes updated cookies to the outgoing response. The key
 * purpose is to keep the user's session alive by refreshing
 * expired tokens automatically on each navigation.
 *
 * The cookie handling follows the official Supabase SSR pattern:
 * 1. Read cookies from the incoming request
 * 2. If tokens are refreshed, update cookies on both the request
 *    (so downstream server code sees fresh tokens) and the
 *    response (so the browser receives fresh cookies)
 * 3. Call `getUser()` to trigger the refresh check
 * ============================================================
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session by reading/writing cookies
 * on the request and response objects.
 *
 * @param request - The incoming Next.js middleware request.
 * @returns The Next.js response with updated auth cookies.
 */
export async function updateSession(request: NextRequest) {
  // Start with a fresh response that forwards the original request
  let supabaseResponse = NextResponse.next({ request });

  // Create a Supabase client wired to the middleware cookie flow
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Read all cookies from the incoming request so Supabase
         * can reconstruct the current session.
         */
        getAll() {
          return request.cookies.getAll();
        },

        /**
         * When Supabase refreshes tokens it calls setAll with the
         * new cookie values. We must:
         * 1. Update the request cookies (for downstream server code)
         * 2. Recreate the response (to carry the updated request)
         * 3. Set cookies on the response (for the browser)
         */
        setAll(cookiesToSet) {
          // Update request cookies so any server-side code that runs
          // after the middleware sees the fresh tokens
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // Recreate the response with the updated request
          supabaseResponse = NextResponse.next({ request });

          // Propagate the cookies to the response so the browser
          // receives the refreshed tokens
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Trigger the session refresh — this is what actually checks
  // if the access token has expired and refreshes it if needed.
  // IMPORTANT: Do NOT use getSession() here as it doesn't validate
  // the token with the Supabase Auth server.
  await supabase.auth.getUser();

  return supabaseResponse;
}

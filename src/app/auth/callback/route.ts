/**
 * ============================================================
 * OAUTH CALLBACK ROUTE HANDLER
 * Handles the redirect from Google OAuth after the user
 * authenticates. Extracts the authorization code from the
 * URL query parameters and exchanges it for a Supabase session.
 *
 * Flow:
 * 1. User clicks "Sign in with Google"
 * 2. Browser redirects to Google's OAuth consent screen
 * 3. Google redirects back to /auth/callback?code=<auth_code>
 * 4. This handler exchanges the code for a session
 * 5. User is redirected to /dashboard
 * ============================================================
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /auth/callback
 *
 * Processes the OAuth callback by exchanging the authorization
 * code for a full Supabase session (access + refresh tokens).
 * The session is stored in HTTP-only cookies via the server client.
 *
 * @param request - The incoming request with the `code` query parameter.
 * @returns A redirect response to /dashboard on success, or /login on failure.
 */
export async function GET(request: Request) {
  // Parse the callback URL to extract the authorization code
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // If we received a valid authorization code, exchange it
  // for a Supabase session (access token + refresh token)
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Session established successfully — redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', origin));
    }

    // Log the error for debugging — the user will be redirected
    // to login where they can try again
    console.error('[auth/callback] Session exchange failed:', error.message);
  }

  // If no code was provided or the exchange failed,
  // redirect back to the login page
  return NextResponse.redirect(new URL('/login', request.url));
}

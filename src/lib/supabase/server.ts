/**
 * ============================================================
 * SUPABASE SERVER CLIENT
 * Creates a Supabase client for use in Server Components,
 * Server Actions, and Route Handlers.
 *
 * Uses the Next.js `cookies()` API to read and write auth
 * tokens stored in HTTP-only cookies. The `setAll` callback
 * is wrapped in a try/catch because Server Components cannot
 * set cookies — only Route Handlers and Server Actions can.
 * ============================================================
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates and returns a Supabase client configured for server-side usage.
 *
 * This is an async function because `cookies()` in Next.js 15 returns
 * a Promise. The client delegates cookie get/set operations to the
 * Next.js cookie store so that the Supabase auth session is maintained
 * across server-side requests.
 *
 * @returns A configured Supabase server client instance.
 */
export async function createClient() {
  // Await the Next.js cookie store (async in App Router)
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Returns all cookies from the request. Supabase uses these
         * to reconstruct the user session on the server.
         */
        getAll() {
          return cookieStore.getAll();
        },

        /**
         * Sets cookies on the response. This only works in Route Handlers
         * and Server Actions — in Server Components the try/catch silently
         * swallows the error, which is the expected Supabase SSR pattern.
         */
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Silently ignore when called from a Server Component.
            // Supabase refreshes the session by calling setAll, but
            // Server Components cannot modify cookies. The middleware
            // handles the actual cookie refresh instead.
          }
        },
      },
    }
  );
}

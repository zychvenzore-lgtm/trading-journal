/**
 * ============================================================
 * SUPABASE BROWSER CLIENT
 * Creates a Supabase client for use in Client Components.
 *
 * Uses `createBrowserClient` from @supabase/ssr which
 * automatically manages auth tokens via browser cookies.
 * ============================================================
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates and returns a Supabase client configured for browser-side usage.
 *
 * This client reads the NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables which must be
 * set in `.env.local`. The client automatically handles cookie-based
 * session management in the browser.
 *
 * @returns A configured Supabase browser client instance.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

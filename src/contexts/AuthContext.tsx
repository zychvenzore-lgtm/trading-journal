'use client';

/**
 * ============================================================
 * AUTH CONTEXT
 * Provides authentication state and methods to all client
 * components in the application.
 *
 * Responsibilities:
 * - Listen for Supabase auth state changes (login, logout, refresh)
 * - Fetch/upsert the user's profile from the 'profiles' table
 * - Expose signInWithGoogle and signOut methods
 * - Provide a loading state for auth initialization
 *
 * Usage:
 *   Wrap the app with <AuthProvider> in the root layout.
 *   Access auth state with const { user, profile } = useAuth();
 * ============================================================
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

// ─── Types ──────────────────────────────────────────────────

/** Shape of the value provided by AuthContext */
interface AuthContextValue {
  /** The currently authenticated Supabase user, or null */
  user: User | null;
  /** The user's profile from the profiles table, or null */
  profile: Profile | null;
  /** True while the initial auth state is being determined */
  loading: boolean;
  /** Initiates Email/Password sign-in flow */
  signInWithEmail: (email: string, pass: string) => Promise<{ error: Error | null }>;
  /** Initiates Email/Password sign-up flow */
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<{ data: any, error: Error | null }>;
  /** Signs the user out and redirects to /login */
  signOut: () => Promise<void>;
}

// ─── Context ────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Helper: Determine site URL for OAuth redirect ──────────

/**
 * Resolves the site URL for the OAuth redirect callback.
 * Checks NEXT_PUBLIC_SITE_URL first (for production), then
 * NEXT_PUBLIC_VERCEL_URL (for Vercel preview deployments),
 * and finally falls back to localhost for development.
 */
function getSiteUrl(): string {
  // Production: explicit site URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Vercel preview deployments
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Local development fallback
  return 'http://localhost:3000';
}

// ─── Provider ───────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Create the Supabase client once per component lifecycle
  const supabase = createClient();

  /**
   * Fetches (or upserts) the user's profile from the 'profiles' table.
   *
   * On first login, the profile may not exist yet (it's created by a
   * database trigger), so we attempt to fetch first. If not found,
   * we upsert with the user's metadata from the OAuth provider.
   */
  const fetchProfile = useCallback(
    async (authUser: User) => {
      // Try fetching the existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existingProfile && !fetchError) {
        setProfile(existingProfile as Profile);
        return;
      }

      // Profile doesn't exist yet — upsert it with OAuth metadata.
      // This handles the race condition where the DB trigger hasn't
      // fired yet or the profile was somehow deleted.
      const { data: upsertedProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: authUser.id,
            email: authUser.email || '',
            display_name:
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.name ||
              authUser.email ||
              '',
            avatar_url: authUser.user_metadata?.avatar_url || null,
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (upsertedProfile && !upsertError) {
        setProfile(upsertedProfile as Profile);
      } else {
        console.error('[AuthContext] Failed to upsert profile:', upsertError?.message);
        setProfile(null);
      }
    },
    [supabase]
  );

  /**
   * Initialize auth state and subscribe to changes.
   *
   * On mount, we check the current session. Then we subscribe to
   * auth state changes so that login, logout, and token refresh
   * events are reflected immediately in the UI.
   */
  useEffect(() => {
    // Get the current session on mount
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    };

    initializeAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);

        // Fetch profile on sign-in or token refresh
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchProfile(session.user);
        }
      } else {
        // User signed out or session expired
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  /**
   * Initiates Email/Password sign-in.
   */
  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) {
      console.error('[AuthContext] Email sign-in failed:', JSON.stringify(error, null, 2));
    }
    return { error };
  }, [supabase]);

  /**
   * Initiates Email/Password sign-up.
   */
  const signUpWithEmail = useCallback(async (email: string, pass: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: displayName || '',
        },
      },
    });
    if (error) {
      console.error('[AuthContext] Email sign-up failed:', JSON.stringify(error, null, 2));
    }
    return { data, error };
  }, [supabase]);

  /**
   * Signs the user out and redirects to the login page.
   *
   * Clears the local auth state first for immediate UI feedback,
   * then calls the Supabase sign-out API which invalidates the
   * session server-side and clears cookies.
   */
  const signOut = useCallback(async () => {
    // Clear local state immediately for responsive UI
    setUser(null);
    setProfile(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[AuthContext] Sign-out failed:', error.message);
    }

    // Redirect to login page
    window.location.href = '/login';
  }, [supabase]);

  // ─── Render ─────────────────────────────────────────────────

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────

/**
 * Hook to access the auth context from any client component.
 *
 * @throws Error if used outside of an <AuthProvider>.
 * @returns The auth context value with user, profile, loading, and actions.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }

  return context;
}

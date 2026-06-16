'use client';

/**
 * ============================================================
 * ACCOUNT CONTEXT
 * Manages trading accounts for the current user.
 *
 * Responsibilities:
 * - Fetch all accounts belonging to the authenticated user
 * - Track the currently active account (from profile or first)
 * - Create new trading accounts
 * - Switch between accounts (updates profile.active_account_id)
 *
 * Dependencies:
 * - AuthContext: requires user and profile to be available
 *
 * Usage:
 *   Wrap the app with <AccountProvider> inside <AuthProvider>.
 *   Access with const { accounts, activeAccount } = useAccounts();
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
import { useAuth } from '@/contexts/AuthContext';
import type { Account } from '@/types';

// ─── Types ──────────────────────────────────────────────────

/** Shape of the value provided by AccountContext */
interface AccountContextValue {
  /** All accounts owned by the current user */
  accounts: Account[];
  /** The currently active account, or null if none */
  activeAccount: Account | null;
  /** True while accounts are being loaded */
  loading: boolean;
  /** Creates a new trading account */
  createAccount: (
    name: string,
    startingBalance: number,
    currency: string,
    accountType: 'PERSONAL' | 'PROP_FIRM' | 'DEMO'
  ) => Promise<Account | null>;
  /** Switches the active account and updates the profile */
  switchAccount: (accountId: string) => Promise<void>;
  /** Deletes an account and all its trades */
  deleteAccount: (accountId: string) => Promise<boolean>;
}

// ─── Context ────────────────────────────────────────────────

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────

interface AccountProviderProps {
  children: ReactNode;
}

export function AccountProvider({ children }: AccountProviderProps) {
  const { user, profile } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  // Create the Supabase client once per component lifecycle
  const supabase = createClient();

  /**
   * Fetches all accounts for the current user from the database.
   * Sorted by creation date so the oldest account comes first.
   */
  const fetchAccounts = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setActiveAccount(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[AccountContext] Failed to fetch accounts:', error.message);
      setAccounts([]);
      setActiveAccount(null);
      setLoading(false);
      return;
    }

    const fetchedAccounts = (data || []) as Account[];
    setAccounts(fetchedAccounts);

    // Determine which account should be active:
    // 1. If the profile has an active_account_id, use that
    // 2. Otherwise, default to the first account
    if (fetchedAccounts.length > 0) {
      const preferred = profile?.active_account_id
        ? fetchedAccounts.find((a) => a.id === profile.active_account_id)
        : null;

      setActiveAccount(preferred || fetchedAccounts[0]);
    } else {
      setActiveAccount(null);
    }

    setLoading(false);
  }, [user, profile?.active_account_id, supabase]);

  /**
   * Fetch accounts whenever the user or profile changes.
   */
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  /**
   * Creates a new trading account in the database.
   *
   * After inserting, the account list is refreshed to include the
   * new account. If this is the user's first account, it automatically
   * becomes the active account.
   *
   * @param name            - Display name for the account (e.g. "Prop Firm")
   * @param startingBalance - Initial capital in the account
   * @param currency        - ISO 4217 currency code (e.g. "USD")
   * @returns The created Account or null on failure.
   */
  const createAccount = useCallback(
    async (
      name: string,
      startingBalance: number,
      currency: string,
      accountType: 'PERSONAL' | 'PROP_FIRM' | 'DEMO'
    ): Promise<Account | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name,
          starting_balance: startingBalance,
          currency,
          account_type: accountType
        })
        .select()
        .single();

      if (error) {
        console.error('[AccountContext] Failed to create account:', error.message);
        return null;
      }

      const newAccount = data as Account;

      // Refresh accounts list to include the newly created one
      await fetchAccounts();

      // Always switch to the newly created account
      await switchAccount(newAccount.id);

      return newAccount;
    },
    [user, supabase, fetchAccounts, accounts.length]
  );

  /**
   * Switches the active account.
   *
   * Updates the profile's active_account_id in the database
   * and sets the local state to reflect the change immediately.
   *
   * @param accountId - The UUID of the account to switch to.
   */
  const switchAccount = useCallback(
    async (accountId: string) => {
      if (!user) return;

      // Update the profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({ active_account_id: accountId })
        .eq('id', user.id);

      if (error) {
        console.error('[AccountContext] Failed to switch account:', error.message);
        return;
      }

      // Update local state immediately for responsive UI
      const targetAccount = accounts.find((a) => a.id === accountId);
      if (targetAccount) {
        setActiveAccount(targetAccount);
      }
    },
    [user, supabase, accounts]
  );

  /**
   * Deletes an account and all its associated trades from the database.
   * Supabase foreign key cascading handles the trades automatically.
   */
  const deleteAccount = useCallback(
    async (accountId: string): Promise<boolean> => {
      if (!user) return false;

      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user.id); // Extra safety

      if (error) {
        console.error('[AccountContext] Failed to delete account:', error.message);
        return false;
      }

      // If we deleted the currently active account, we need to clear it or pick another
      if (activeAccount?.id === accountId) {
        const remainingAccounts = accounts.filter(a => a.id !== accountId);
        if (remainingAccounts.length > 0) {
          await switchAccount(remainingAccounts[0].id);
        } else {
          setActiveAccount(null);
          // Update profile to clear active_account_id
          await supabase
            .from('profiles')
            .update({ active_account_id: null })
            .eq('id', user.id);
        }
      }

      await fetchAccounts();
      return true;
    },
    [user, supabase, activeAccount, accounts, switchAccount, fetchAccounts]
  );

  // ─── Render ─────────────────────────────────────────────────

  const value: AccountContextValue = {
    accounts,
    activeAccount,
    loading,
    createAccount,
    switchAccount,
    deleteAccount,
  };

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────

/**
 * Hook to access the account context from any client component.
 *
 * @throws Error if used outside of an <AccountProvider>.
 * @returns The account context value with accounts, active account, and actions.
 */
export function useAccounts(): AccountContextValue {
  const context = useContext(AccountContext);

  if (context === undefined) {
    throw new Error('useAccounts must be used within an <AccountProvider>');
  }

  return context;
}

'use client';

/**
 * ============================================================
 * TRADE CONTEXT
 * Manages trades for the currently active trading account.
 *
 * Responsibilities:
 * - Fetch all trades belonging to the active account
 * - Add new trades to the database
 * - Update existing trades
 * - Delete trades
 * - Automatically refetch trades after any mutation
 *
 * Dependencies:
 * - AuthContext: requires user to be authenticated
 * - AccountContext: requires activeAccount to know which trades to fetch
 *
 * Usage:
 *   Wrap the app with <TradeProvider> inside <AccountProvider>.
 *   Access with const { trades, addTrade } = useTrades();
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
import { useAccounts } from '@/contexts/AccountContext';
import type { Trade } from '@/types';

// ─── Types ──────────────────────────────────────────────────

/**
 * Data required to create a new trade.
 * Omits auto-generated fields (id, created_at, updated_at).
 */
type NewTradeData = Omit<Trade, 'id' | 'created_at' | 'updated_at'>;

/**
 * Partial trade data for updates.
 * Any field of Trade can be updated except the ID.
 */
type TradeUpdates = Partial<Omit<Trade, 'id' | 'created_at' | 'updated_at'>>;

/** Shape of the value provided by TradeContext */
interface TradeContextValue {
  /** All trades for the active account */
  trades: Trade[];
  /** True while trades are being loaded */
  loading: boolean;
  /** Adds a new trade to the active account */
  addTrade: (data: NewTradeData) => Promise<Trade | null>;
  /** Bulk adds multiple trades at once */
  bulkAddTrades: (tradesData: NewTradeData[]) => Promise<boolean>;
  /** Updates an existing trade by ID */
  updateTrade: (id: string, updates: TradeUpdates) => Promise<Trade | null>;
  /** Deletes a trade by ID */
  deleteTrade: (id: string) => Promise<boolean>;
}

// ─── Context ────────────────────────────────────────────────

const TradeContext = createContext<TradeContextValue | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────

interface TradeProviderProps {
  children: ReactNode;
}

export function TradeProvider({ children }: TradeProviderProps) {
  const { user } = useAuth();
  const { activeAccount } = useAccounts();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  // Create the Supabase client once per component lifecycle
  const supabase = createClient();

  /**
   * Fetches all trades for the active account from the database.
   * Trades are sorted by entry_time in descending order so the
   * most recent trades appear first.
   */
  const fetchTrades = useCallback(async () => {
    if (!user || !activeAccount) {
      setTrades([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('account_id', activeAccount.id)
      .order('entry_time', { ascending: false });

    if (error) {
      console.error('[TradeContext] Failed to fetch trades:', error.message);
      setTrades([]);
      setLoading(false);
      return;
    }

    setTrades((data || []) as Trade[]);
    setLoading(false);
  }, [user, activeAccount, supabase]);

  /**
   * Fetch trades whenever the user or active account changes.
   * This ensures we always show the correct trades after switching accounts.
   */
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  /**
   * Adds a new trade to the database and refetches the trade list.
   *
   * @param data - The trade data (without id, created_at, updated_at).
   * @returns The created Trade or null on failure.
   */
  const addTrade = useCallback(
    async (data: NewTradeData): Promise<Trade | null> => {
      if (!user || !activeAccount) return null;

      const { data: created, error } = await supabase
        .from('trades')
        .insert({
          ...data,
          account_id: activeAccount.id,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('[TradeContext] Failed to add trade:', error.message);
        return null;
      }

      // Refetch all trades to ensure consistent state
      await fetchTrades();

      return created as Trade;
    },
    [user, activeAccount, supabase, fetchTrades]
  );

  /**
   * Bulk adds multiple trades to the database and refetches the trade list.
   */
  const bulkAddTrades = useCallback(
    async (tradesData: NewTradeData[]): Promise<boolean> => {
      if (!user || !activeAccount || tradesData.length === 0) return false;

      const payload = tradesData.map(data => ({
        ...data,
        account_id: activeAccount.id,
        user_id: user.id,
      }));

      const { error } = await supabase
        .from('trades')
        .insert(payload);

      if (error) {
        console.error('[TradeContext] Failed to bulk add trades:', error.message);
        return false;
      }

      await fetchTrades();
      return true;
    },
    [user, activeAccount, supabase, fetchTrades]
  );

  /**
   * Updates an existing trade in the database and refetches the trade list.
   *
   * The updated_at timestamp is handled by a database trigger.
   *
   * @param id      - The UUID of the trade to update.
   * @param updates - A partial object with the fields to update.
   * @returns The updated Trade or null on failure.
   */
  const updateTrade = useCallback(
    async (id: string, updates: TradeUpdates): Promise<Trade | null> => {
      if (!user) return null;

      const { data: updated, error } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Extra safety: ensure user owns this trade
        .select()
        .single();

      if (error) {
        console.error('[TradeContext] Failed to update trade:', error.message);
        return null;
      }

      // Refetch all trades to ensure consistent state
      await fetchTrades();

      return updated as Trade;
    },
    [user, supabase, fetchTrades]
  );

  /**
   * Deletes a trade from the database and refetches the trade list.
   *
   * @param id - The UUID of the trade to delete.
   * @returns True if deletion succeeded, false otherwise.
   */
  const deleteTrade = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Extra safety: ensure user owns this trade

      if (error) {
        console.error('[TradeContext] Failed to delete trade:', error.message);
        return false;
      }

      // Refetch all trades to ensure consistent state
      await fetchTrades();

      return true;
    },
    [user, supabase, fetchTrades]
  );

  // ─── Render ─────────────────────────────────────────────────

  const value: TradeContextValue = {
    trades,
    loading,
    addTrade,
    bulkAddTrades,
    updateTrade,
    deleteTrade,
  };

  return <TradeContext.Provider value={value}>{children}</TradeContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────

/**
 * Hook to access the trade context from any client component.
 *
 * @throws Error if used outside of a <TradeProvider>.
 * @returns The trade context value with trades array, loading state, and CRUD methods.
 */
export function useTrades(): TradeContextValue {
  const context = useContext(TradeContext);

  if (context === undefined) {
    throw new Error('useTrades must be used within a <TradeProvider>');
  }

  return context;
}

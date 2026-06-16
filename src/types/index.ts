/**
 * ============================================================
 * TRADING JOURNAL — TypeScript Type Definitions
 * Central type definitions shared across the entire application.
 * ============================================================
 */

/** Direction of a trade position */
export type TradeDirection = 'LONG' | 'SHORT';

/** Outcome status of a trade */
export type TradeOutcome = 'WIN' | 'LOSS' | 'BREAKEVEN' | 'OPEN';

/** Type of position sizing */
export type PositionType = 'QUANTITY' | 'MARGIN' | 'LOTS';

/** Strategy tags are now dynamic strings */
export type Strategy = string;

/**
 * Represents a custom strategy defined by the user.
 */
export interface CustomStrategy {
  id: string;
  user_id: string;
  account_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

/** Legacy default strategy options for reference if needed */
export const STRATEGY_OPTIONS: string[] = [
  'Breakout',
  'Scalp',
  'Mean Reversion',
  'SMC',
  'Wyckoff',
  'OBV',
  'Other',
];

/**
 * Represents a single trade journal entry.
 * PnL and outcome are computed client-side from raw data.
 */
export interface Trade {
  id: string;
  account_id: string;
  user_id: string;
  ticker: string;
  direction: TradeDirection;
  position_type: PositionType;
  entry_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  position_size: number;
  leverage: number;
  entry_time: string; // ISO 8601 timestamp
  close_time: string | null; // null = open trade
  exit_price: number | null; // null = open trade
  fees: number;
  strategy: Strategy | null;
  reason: string | null;
  chart_link: string | null;
  realized_pnl: number | null; // Manual override
  created_at: string;
  updated_at: string;
}

/**
 * Represents a trading account / portfolio.
 * Users can have multiple accounts (e.g., "Prop Firm", "Personal").
 */
export interface Account {
  id: string;
  user_id: string;
  name: string;
  starting_balance: number;
  currency: string;
  account_type: 'PERSONAL' | 'PROP_FIRM' | 'DEMO';
  is_public: boolean;
  public_slug: string | null;
  created_at: string;
}

/**
 * User profile, auto-created on first Google OAuth login.
 * References the Supabase auth.users table.
 */
export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  active_account_id: string | null;
  created_at: string;
}

/**
 * Form data structure for creating/editing a trade.
 * Uses strings for numeric fields to handle form input states.
 */
export interface TradeFormData {
  ticker: string;
  direction: TradeDirection;
  position_type: PositionType;
  entry_price: string;
  stop_loss: string;
  take_profit: string;
  position_size: string;
  leverage: string;
  entry_time: string;
  close_time: string;
  exit_price: string;
  fees: string;
  strategy: Strategy | '';
  reason: string;
  chart_link: string;
  realized_pnl: string;
}

/**
 * Shape of an equity curve data point (for Recharts).
 */
export interface EquityPoint {
  date: string;
  equity: number;
  drawdown: number;
}

/**
 * Aggregated statistics for the analytics dashboard.
 */
export interface TradeStats {
  totalTrades: number;
  winCount: number;
  lossCount: number;
  breakevenCount: number;
  openCount: number;
  winRate: number; // 0–100
  netPnl: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number; // grossProfit / |grossLoss|
  maxDrawdown: number; // peak-to-trough %
  avgDuration: number; // in milliseconds
  consistencyRate: number; // 0–100
  totalFees: number;
  totalEquity: number; // starting_balance + netPnl
}

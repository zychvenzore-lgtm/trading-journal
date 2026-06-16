-- ============================================================
-- TRADING JOURNAL — Initial Database Schema
-- Migration: 001_initial_schema.sql
--
-- Creates the core tables, indexes, RLS policies, and triggers
-- for the Trading Journal application.
--
-- Tables:
--   profiles  — user profile data (linked to auth.users)
--   accounts  — trading accounts / portfolios
--   trades    — individual trade journal entries
--
-- Security:
--   Row Level Security (RLS) is enabled on all tables.
--   Users can only access their own data.
--
-- Automation:
--   - updated_at trigger on trades
--   - Auto-create profile + default account on new user signup
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- TABLE: profiles
-- Stores user profile data. The primary key references
-- auth.users(id) so each Supabase user has exactly one profile.
-- ────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id               uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            text,
  display_name     text,
  avatar_url       text,
  active_account_id uuid,      -- references accounts(id), added as FK after accounts table
  created_at       timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (for the signup trigger)
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);


-- ────────────────────────────────────────────────────────────
-- TABLE: accounts
-- Trading accounts / portfolios. A user can have multiple
-- accounts (e.g., "Personal", "Prop Firm", "Paper Trading").
-- ────────────────────────────────────────────────────────────

CREATE TABLE accounts (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             text        NOT NULL,
  starting_balance numeric     DEFAULT 0,
  currency         text        DEFAULT 'USD',
  created_at       timestamptz DEFAULT now()
);

-- Add foreign key from profiles.active_account_id -> accounts.id
-- This is done after accounts is created to avoid circular dependency.
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_active_account
  FOREIGN KEY (active_account_id) REFERENCES accounts(id)
  ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own accounts
CREATE POLICY "Users can view their own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create accounts for themselves
CREATE POLICY "Users can insert their own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own accounts
CREATE POLICY "Users can update their own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own accounts
CREATE POLICY "Users can delete their own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Index: fast lookups by user_id
CREATE INDEX idx_accounts_user_id ON accounts(user_id);


-- ────────────────────────────────────────────────────────────
-- TABLE: trades
-- Individual trade journal entries. Each trade belongs to
-- one account and one user. Open trades have null close_time
-- and exit_price.
-- ────────────────────────────────────────────────────────────

CREATE TABLE trades (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    uuid        NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ticker        text        NOT NULL,
  direction     text        NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
  entry_price   numeric     NOT NULL,
  stop_loss     numeric,
  take_profit   numeric,
  position_size numeric     NOT NULL,
  leverage      numeric     DEFAULT 1,
  entry_time    timestamptz NOT NULL,
  close_time    timestamptz,
  exit_price    numeric,
  fees          numeric     DEFAULT 0,
  strategy      text,
  reason        text,
  chart_link    text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own trades
CREATE POLICY "Users can view their own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create trades for themselves
CREATE POLICY "Users can insert their own trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own trades
CREATE POLICY "Users can update their own trades"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own trades
CREATE POLICY "Users can delete their own trades"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);

-- Index: fast lookups by account_id (used when loading trades for an account)
CREATE INDEX idx_trades_account_id ON trades(account_id);

-- Index: fast lookups by user_id (used by RLS policies)
CREATE INDEX idx_trades_user_id ON trades(user_id);


-- ────────────────────────────────────────────────────────────
-- TRIGGER: Auto-update updated_at on trades
-- Automatically sets updated_at to now() whenever a row in
-- the trades table is modified.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the updated_at timestamp to the current time
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ────────────────────────────────────────────────────────────
-- TRIGGER: Auto-create profile and default account on signup
-- When a new user is inserted into auth.users (via Supabase
-- Auth), this trigger creates:
--   1. A profile row with data from the auth metadata
--   2. A default trading account named "My Account"
--   3. Sets the new account as the user's active account
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_account_id uuid;
BEGIN
  -- Step 1: Create the user's profile from auth metadata
  INSERT INTO profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.email
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Step 2: Create a default trading account
  INSERT INTO accounts (user_id, name, starting_balance, currency)
  VALUES (NEW.id, 'My Account', 0, 'USD')
  RETURNING id INTO new_account_id;

  -- Step 3: Set the new account as the user's active account
  UPDATE profiles
  SET active_account_id = new_account_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to auth.users INSERT events
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

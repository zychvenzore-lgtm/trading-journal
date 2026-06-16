-- ============================================================
-- TRADING JOURNAL — Strategy Gallery
-- Migration: 003_custom_strategies.sql
--
-- Creates the table for user-defined custom strategies.
-- ============================================================

CREATE TABLE strategies (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id    uuid        REFERENCES accounts(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  description   text,
  image_url     text,
  created_at    timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own strategies
CREATE POLICY "Users can view their own strategies"
  ON strategies FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own strategies
CREATE POLICY "Users can insert their own strategies"
  ON strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own strategies
CREATE POLICY "Users can update their own strategies"
  ON strategies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own strategies
CREATE POLICY "Users can delete their own strategies"
  ON strategies FOR DELETE
  USING (auth.uid() = user_id);

-- Index: fast lookups by user_id
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
-- Index: fast lookups by account_id
CREATE INDEX idx_strategies_account_id ON strategies(account_id);

-- ============================================================
-- TRADING JOURNAL — Position Types
-- Migration: 004_position_type.sql
--
-- Adds support for different position sizing types to ensure
-- accurate PnL calculations across asset classes.
-- ============================================================

-- Create ENUM type for position sizing
CREATE TYPE position_size_type AS ENUM ('QUANTITY', 'MARGIN', 'LOTS');

-- Add the column to trades table with a default of MARGIN
-- to preserve the math for all previously logged crypto trades.
ALTER TABLE public.trades
ADD COLUMN position_type position_size_type NOT NULL DEFAULT 'MARGIN'::position_size_type;

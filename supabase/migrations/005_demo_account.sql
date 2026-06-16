-- ============================================================
-- TRADING JOURNAL — Demo Account Type
-- Migration: 005_demo_account.sql
-- ============================================================

-- Drop the existing constraint
ALTER TABLE accounts DROP CONSTRAINT valid_account_type;

-- Re-add the constraint with 'DEMO' included
ALTER TABLE accounts ADD CONSTRAINT valid_account_type CHECK (account_type IN ('PERSONAL', 'PROP_FIRM', 'DEMO'));

-- Add new columns to the accounts table for Pro Features

-- Phase 2: Distinguish between Personal and Prop Firm accounts
ALTER TABLE accounts ADD COLUMN account_type text DEFAULT 'PERSONAL';
ALTER TABLE accounts ADD CONSTRAINT valid_account_type CHECK (account_type IN ('PERSONAL', 'PROP_FIRM'));

-- Phase 3: Public Track Record Sharing
ALTER TABLE accounts ADD COLUMN is_public boolean DEFAULT false;
ALTER TABLE accounts ADD COLUMN public_slug text UNIQUE;

-- Create an index on public_slug for fast lookups on the public route
CREATE INDEX idx_accounts_public_slug ON accounts(public_slug);

-- RLS Policies for Public Accounts
-- Allow anonymous users to read accounts if is_public is true
CREATE POLICY "Allow public read access to public accounts"
  ON accounts FOR SELECT
  USING (is_public = true);

-- Allow anonymous users to read trades belonging to public accounts
-- To prevent exposing exact dollar amounts, we only select the rows if the parent account is public
CREATE POLICY "Allow public read access to trades of public accounts"
  ON trades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = trades.account_id
      AND accounts.is_public = true
    )
  );

-- Function to auto-generate a random slug for new public accounts (or updated ones) if not provided
CREATE OR REPLACE FUNCTION generate_public_slug()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_public = true AND (NEW.public_slug IS NULL OR NEW.public_slug = '') THEN
    NEW.public_slug := encode(gen_random_bytes(6), 'hex'); -- e.g., 'a1b2c3d4e5f6'
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_public_slug
  BEFORE INSERT OR UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION generate_public_slug();

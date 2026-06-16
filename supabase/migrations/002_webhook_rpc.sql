-- 002_webhook_rpc.sql
-- Function to securely insert trades via Webhook using the Account ID as a token

CREATE OR REPLACE FUNCTION insert_webhook_trade(
  p_account_id uuid,
  p_ticker text,
  p_direction text,
  p_entry_price numeric,
  p_stop_loss numeric,
  p_take_profit numeric,
  p_position_size numeric,
  p_entry_time timestamptz,
  p_close_time timestamptz,
  p_exit_price numeric,
  p_fees numeric,
  p_realized_pnl numeric
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_trade_id uuid;
BEGIN
  -- Verify the account exists and fetch the user_id
  SELECT user_id INTO v_user_id FROM accounts WHERE id = p_account_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid account ID or account does not exist';
  END IF;

  -- Insert the trade into the database
  INSERT INTO trades (
    account_id, user_id, ticker, direction, entry_price, 
    stop_loss, take_profit, position_size, entry_time, 
    close_time, exit_price, fees, realized_pnl
  )
  VALUES (
    p_account_id, v_user_id, p_ticker, p_direction, p_entry_price,
    p_stop_loss, p_take_profit, p_position_size, p_entry_time,
    p_close_time, p_exit_price, p_fees, p_realized_pnl
  )
  RETURNING id INTO v_trade_id;

  RETURN v_trade_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

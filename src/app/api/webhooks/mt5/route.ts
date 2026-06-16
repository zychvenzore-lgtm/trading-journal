import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a standard Supabase client (no cookies needed for a webhook)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      token, // The account ID used as the secure webhook token
      ticker, 
      direction, 
      entry_price, 
      exit_price, 
      position_size, 
      profit, 
      entry_time, 
      close_time,
      commission = 0,
      swap = 0
    } = data;

    if (!token || !ticker || !direction || !entry_price || !exit_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call the secure RPC function to insert the trade using the Account ID as token
    const { data: tradeId, error } = await supabase.rpc('insert_webhook_trade', {
      p_account_id: token,
      p_ticker: ticker,
      p_direction: direction,
      p_entry_price: Number(entry_price),
      p_stop_loss: null,
      p_take_profit: null,
      p_position_size: Number(position_size),
      p_entry_time: entry_time,
      p_close_time: close_time,
      p_exit_price: Number(exit_price),
      p_fees: Number(commission) + Number(swap),
      p_realized_pnl: Number(profit)
    });

    if (error) {
      console.error('Webhook insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, tradeId }, { status: 200 });

  } catch (err: any) {
    console.error('Webhook payload parsing error:', err);
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}

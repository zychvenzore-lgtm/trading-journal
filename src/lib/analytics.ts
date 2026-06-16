/**
 * ============================================================
 * ANALYTICS — Pure Calculation Functions
 *
 * All statistical and analytical computations for the trading
 * journal. Every function is a pure function: no side effects,
 * no database calls, no React hooks. This makes them easy to
 * test and safe to call from both server and client code.
 *
 * Functions operate on the Trade, EquityPoint, and TradeStats
 * types defined in @/types.
 * ============================================================
 */

import type { Trade, TradeOutcome, EquityPoint, TradeStats } from '@/types';

/**
 * Computes the Profit and Loss (PnL) for a single trade.
 *
 * For LONG positions: PnL = (exit_price - entry_price) × position_size × leverage - fees
 * For SHORT positions: PnL = (entry_price - exit_price) × position_size × leverage - fees
 *
 * Returns 0 for open trades (no exit_price).
 *
 * @param trade - The trade to compute PnL for.
 * @returns The net PnL in the account's currency.
 */
export function calcPnL(trade: Trade): number {
  // Open trades have no realized PnL
  if (trade.exit_price === null || trade.exit_price === undefined) {
    // If they manually set a realized PnL even for an open trade (unlikely but possible), return it
    if (trade.realized_pnl !== null && trade.realized_pnl !== undefined) {
      return trade.realized_pnl;
    }
    return 0;
  }

  // If a manual override is provided, use it directly
  if (trade.realized_pnl !== null && trade.realized_pnl !== undefined) {
    return trade.realized_pnl;
  }

  const { direction, position_type, entry_price, exit_price, position_size, leverage, fees } = trade;

  let rawPnL: number;
  
  // Branch PnL calculation based on position type
  if (position_type === 'QUANTITY') {
    // Spot / Shares / Coins
    // position_size = quantity of asset
    if (direction === 'LONG') {
      rawPnL = position_size * (exit_price - entry_price);
    } else {
      rawPnL = position_size * (entry_price - exit_price);
    }
  } else if (position_type === 'LOTS') {
    // Forex / Commodities
    // position_size = number of standard lots
    // Assume standard lot size of 100,000 for simplicity and USD quote currency
    if (direction === 'LONG') {
      rawPnL = position_size * 100000 * (exit_price - entry_price);
    } else {
      rawPnL = position_size * 100000 * (entry_price - exit_price);
    }
  } else {
    // Default to 'MARGIN' (Crypto Futures)
    // position_size = margin in USD
    const notionalSize = position_size * (leverage || 1);
    if (direction === 'LONG') {
      rawPnL = notionalSize * ((exit_price - entry_price) / entry_price);
    } else {
      rawPnL = notionalSize * ((entry_price - exit_price) / entry_price);
    }
  }

  // Subtract trading fees to get net PnL
  return rawPnL - (fees || 0);
}

/**
 * Determines the outcome of a trade based on its state and PnL.
 *
 * @param trade - The trade to evaluate.
 * @returns The trade outcome: OPEN, WIN, LOSS, or BREAKEVEN.
 */
export function getOutcome(trade: Trade): TradeOutcome {
  // A trade is considered open if it has no close time or exit price
  if (!trade.close_time || trade.exit_price === null || trade.exit_price === undefined) {
    return 'OPEN';
  }

  const pnl = calcPnL(trade);

  if (pnl > 0) return 'WIN';
  if (pnl < 0) return 'LOSS';
  return 'BREAKEVEN';
}

/**
 * Calculates the win rate as a percentage of closed trades.
 *
 * Only considers trades that have been closed (not OPEN).
 * Win rate = (winning trades / total closed trades) × 100
 *
 * @param trades - Array of trades to analyze.
 * @returns Win rate percentage (0–100). Returns 0 if no closed trades.
 */
export function calcWinRate(trades: Trade[]): number {
  // Filter to only closed trades
  const closedTrades = trades.filter(
    (t) => t.close_time && t.exit_price !== null && t.exit_price !== undefined
  );

  if (closedTrades.length === 0) return 0;

  // Count trades where PnL is positive
  const wins = closedTrades.filter((t) => calcPnL(t) > 0).length;

  return (wins / closedTrades.length) * 100;
}

/**
 * Calculates the profit factor: gross profit divided by gross loss.
 *
 * A profit factor > 1 indicates a profitable system.
 * If there are no losing trades, returns Infinity.
 * If there are no winning trades, returns 0.
 *
 * @param trades - Array of trades to analyze.
 * @returns The profit factor ratio.
 */
export function calcProfitFactor(trades: Trade[]): number {
  let grossProfit = 0;
  let grossLoss = 0;

  for (const trade of trades) {
    const pnl = calcPnL(trade);
    if (pnl > 0) {
      grossProfit += pnl;
    } else if (pnl < 0) {
      grossLoss += Math.abs(pnl);
    }
  }

  // No losses means infinite profit factor
  if (grossLoss === 0) {
    return grossProfit > 0 ? Infinity : 0;
  }

  return grossProfit / grossLoss;
}

/**
 * Calculates the maximum drawdown from an equity curve.
 *
 * Maximum drawdown measures the largest peak-to-trough decline
 * as a percentage of the peak value. It represents the worst-case
 * loss an account experienced.
 *
 * @param equityCurve - Array of equity points with date, equity, drawdown.
 * @returns Maximum drawdown as a positive percentage (e.g. 15.5 for 15.5%).
 */
export function calcMaxDrawdown(equityCurve: EquityPoint[]): number {
  if (equityCurve.length === 0) return 0;

  let peak = equityCurve[0].equity;
  let maxDrawdown = 0;

  for (const point of equityCurve) {
    // Track the highest equity value seen so far
    if (point.equity > peak) {
      peak = point.equity;
    }

    // Calculate percentage decline from peak
    if (peak > 0) {
      const drawdown = ((peak - point.equity) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  }

  return maxDrawdown;
}

/**
 * Calculates the average trade duration for closed trades.
 *
 * Only considers trades that have both entry_time and close_time.
 *
 * @param trades - Array of trades to analyze.
 * @returns Average duration in milliseconds. Returns 0 if no closed trades.
 */
export function calcAvgDuration(trades: Trade[]): number {
  // Filter to only trades with both entry and close times
  const closedTrades = trades.filter((t) => t.close_time && t.entry_time);

  if (closedTrades.length === 0) return 0;

  // Sum up all trade durations
  const totalDuration = closedTrades.reduce((sum, trade) => {
    const entryMs = new Date(trade.entry_time).getTime();
    const closeMs = new Date(trade.close_time!).getTime();
    return sum + Math.abs(closeMs - entryMs);
  }, 0);

  return totalDuration / closedTrades.length;
}

/**
 * Calculates the consistency rate based on the coefficient of
 * variation of daily PnL values.
 *
 * Consistency = 100 - (standard deviation of daily PnLs / mean × 100)
 * The result is clamped to [0, 100].
 *
 * A high consistency rate means daily PnLs are predictable.
 * A low consistency rate means returns are volatile.
 *
 * @param trades - Array of trades to analyze.
 * @returns Consistency rate percentage (0–100).
 */
export function calcConsistencyRate(trades: Trade[]): number {
  // Filter to closed trades with a close_time
  const closedTrades = trades.filter(
    (t) => t.close_time && t.exit_price !== null && t.exit_price !== undefined
  );

  if (closedTrades.length === 0) return 0;

  // Group trades by calendar date (YYYY-MM-DD) and sum daily PnL
  const dailyPnLMap = new Map<string, number>();

  for (const trade of closedTrades) {
    // Extract date portion of the close timestamp
    const dateKey = trade.close_time!.slice(0, 10);
    const pnl = calcPnL(trade);
    dailyPnLMap.set(dateKey, (dailyPnLMap.get(dateKey) || 0) + pnl);
  }

  const dailyPnLs = Array.from(dailyPnLMap.values());

  // Need at least 2 data points for standard deviation
  if (dailyPnLs.length < 2) return 100;

  // Calculate mean of daily PnLs
  const mean = dailyPnLs.reduce((sum, val) => sum + val, 0) / dailyPnLs.length;

  // If mean is zero, can't compute coefficient of variation
  if (mean === 0) return 0;

  // Calculate standard deviation
  const squaredDiffs = dailyPnLs.map((val) => (val - mean) ** 2);
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / dailyPnLs.length;
  const stdDev = Math.sqrt(variance);

  // Consistency = 100 - coefficient of variation (as percentage)
  const coefficientOfVariation = (stdDev / Math.abs(mean)) * 100;
  const consistency = 100 - coefficientOfVariation;

  // Clamp to [0, 100] range
  return Math.max(0, Math.min(100, consistency));
}

/**
 * Builds an equity curve from a series of closed trades.
 *
 * Starting from the initial balance, each closed trade's PnL is
 * accumulated to form the equity line. Drawdown from the peak
 * equity is tracked at each point.
 *
 * Trades are sorted by close_time. Open trades are excluded.
 *
 * @param trades          - Array of trades to build the curve from.
 * @param startingBalance - The account's starting balance.
 * @returns An array of EquityPoint objects for charting.
 */
export function buildEquityCurve(
  trades: Trade[],
  startingBalance: number
): EquityPoint[] {
  // Filter to only closed trades and sort by close time (ascending)
  const closedTrades = trades
    .filter(
      (t) => t.close_time && t.exit_price !== null && t.exit_price !== undefined
    )
    .sort(
      (a, b) =>
        new Date(a.close_time!).getTime() - new Date(b.close_time!).getTime()
    );

  // Start with the initial balance point
  const curve: EquityPoint[] = [];
  let runningEquity = startingBalance;
  let peak = startingBalance;

  // Add the starting point (day 0)
  curve.push({
    date: closedTrades.length > 0 ? closedTrades[0].close_time!.slice(0, 10) : new Date().toISOString().slice(0, 10),
    equity: startingBalance,
    drawdown: 0,
  });

  // Accumulate PnL for each closed trade
  for (const trade of closedTrades) {
    const pnl = calcPnL(trade);
    runningEquity += pnl;

    // Update the peak equity for drawdown calculation
    if (runningEquity > peak) {
      peak = runningEquity;
    }

    // Calculate the current drawdown percentage from peak
    const drawdownPct = peak > 0 ? ((peak - runningEquity) / peak) * 100 : 0;

    curve.push({
      date: trade.close_time!.slice(0, 10),
      equity: runningEquity,
      drawdown: drawdownPct,
    });
  }

  return curve;
}

/**
 * Computes all trading statistics from a set of trades.
 *
 * This is the main entry point for the analytics dashboard.
 * It calls all individual calculation functions and assembles
 * the complete TradeStats object.
 *
 * @param trades          - Array of all trades in the account.
 * @param startingBalance - The account's starting balance.
 * @returns A complete TradeStats object with all computed metrics.
 */
export function calcAllStats(
  trades: Trade[],
  startingBalance: number
): TradeStats {
  // Classify each trade by outcome
  let winCount = 0;
  let lossCount = 0;
  let breakevenCount = 0;
  let openCount = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let totalFees = 0;
  let netPnl = 0;

  for (const trade of trades) {
    const outcome = getOutcome(trade);
    const pnl = calcPnL(trade);

    // Accumulate fees from all trades (including open)
    totalFees += trade.fees || 0;

    switch (outcome) {
      case 'WIN':
        winCount++;
        grossProfit += pnl;
        netPnl += pnl;
        break;
      case 'LOSS':
        lossCount++;
        grossLoss += Math.abs(pnl);
        netPnl += pnl;
        break;
      case 'BREAKEVEN':
        breakevenCount++;
        netPnl += pnl; // Should be ~0 but fees might make it slightly negative
        break;
      case 'OPEN':
        openCount++;
        break;
    }
  }

  // Build the equity curve and compute drawdown
  const equityCurve = buildEquityCurve(trades, startingBalance);

  return {
    totalTrades: trades.length,
    winCount,
    lossCount,
    breakevenCount,
    openCount,
    winRate: calcWinRate(trades),
    netPnl,
    grossProfit,
    grossLoss,
    profitFactor: calcProfitFactor(trades),
    maxDrawdown: calcMaxDrawdown(equityCurve),
    avgDuration: calcAvgDuration(trades),
    consistencyRate: calcConsistencyRate(trades),
    totalFees,
    totalEquity: startingBalance + netPnl,
  };
}

/**
 * ============================================================
 * ADVANCED ANALYTICS (Phase 1 Pro Features)
 * ============================================================
 */

/**
 * Aggregates PnL by calendar date for the Heatmap.
 */
export function calcHeatmapData(trades: Trade[]): { date: string; pnl: number; count: number }[] {
  const map = new Map<string, { pnl: number; count: number }>();
  
  trades.forEach(t => {
    if (!t.close_time) return;
    const date = t.close_time.slice(0, 10);
    const pnl = calcPnL(t);
    const current = map.get(date) || { pnl: 0, count: 0 };
    map.set(date, { pnl: current.pnl + pnl, count: current.count + 1 });
  });

  return Array.from(map.entries()).map(([date, data]) => ({
    date,
    pnl: data.pnl,
    count: data.count
  })).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculates Average Win Duration and Average Loss Duration.
 */
export function calcWinLossDuration(trades: Trade[]): { avgWinDurationMs: number; avgLossDurationMs: number } {
  const closed = trades.filter(t => t.entry_time && t.close_time);
  const wins = closed.filter(t => calcPnL(t) > 0);
  const losses = closed.filter(t => calcPnL(t) < 0);

  const avgWinDurationMs = wins.length > 0 
    ? wins.reduce((sum, t) => sum + (new Date(t.close_time!).getTime() - new Date(t.entry_time).getTime()), 0) / wins.length 
    : 0;

  const avgLossDurationMs = losses.length > 0 
    ? losses.reduce((sum, t) => sum + (new Date(t.close_time!).getTime() - new Date(t.entry_time).getTime()), 0) / losses.length 
    : 0;

  return { avgWinDurationMs, avgLossDurationMs };
}

/**
 * Aggregates profitability by day of the week for Radar Chart.
 */
export function calcTimeAnalysis(trades: Trade[]): { day: string; netPnl: number; winRate: number; count: number }[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const data = days.map(day => ({ day, netPnl: 0, wins: 0, count: 0, winRate: 0 }));

  trades.filter(t => t.entry_time && t.close_time).forEach(t => {
    const dayIndex = new Date(t.entry_time).getDay();
    const pnl = calcPnL(t);
    data[dayIndex].count++;
    data[dayIndex].netPnl += pnl;
    if (pnl > 0) data[dayIndex].wins++;
  });

  return data.map(d => ({
    ...d,
    winRate: d.count > 0 ? (d.wins / d.count) * 100 : 0
  }));
}

/**
 * Aggregates profitability by Hour of the day (UTC).
 */
export function calcHourlyPerformance(trades: Trade[]): { hour: string; pnl: number }[] {
  const map = new Map<string, number>();
  
  for (let i = 0; i < 24; i++) {
    const hourStr = `${i.toString().padStart(2, '0')}:00`;
    map.set(hourStr, 0);
  }

  trades.forEach(t => {
    if (!t.entry_time || !t.close_time) return;
    const entryDate = new Date(t.entry_time);
    const hour = entryDate.getUTCHours();
    const hourStr = `${hour.toString().padStart(2, '0')}:00`;
    
    map.set(hourStr, map.get(hourStr)! + calcPnL(t));
  });

  return Array.from(map.entries()).map(([hour, pnl]) => ({ hour, pnl })).sort((a, b) => a.hour.localeCompare(b.hour));
}

/**
 * Calculates Expected Value, Profit Factor, and Avg Risk/Reward.
 */
export function calcEVAndRiskOfRuin(trades: Trade[]): { expectedValue: number; profitFactor: number; avgRiskReward: number } {
  const closed = trades.filter(t => t.close_time);
  if (closed.length === 0) return { expectedValue: 0, profitFactor: 0, avgRiskReward: 0 };

  const wins = closed.filter(t => calcPnL(t) > 0);
  const losses = closed.filter(t => calcPnL(t) < 0);

  const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + calcPnL(t), 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + calcPnL(t), 0) / losses.length) : 0;

  const winRate = wins.length / closed.length;
  const lossRate = 1 - winRate;

  // Expected Value = (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
  const expectedValue = (winRate * avgWin) - (lossRate * avgLoss);
  
  // Calculate Avg Risk/Reward based on Stop Loss and Take Profit
  let totalPlannedRR = 0;
  let countPlannedRR = 0;
  
  for (const t of trades) {
    if (t.stop_loss && t.take_profit) {
      const risk = Math.abs(t.entry_price - t.stop_loss);
      const reward = Math.abs(t.take_profit - t.entry_price);
      if (risk > 0) {
        totalPlannedRR += (reward / risk);
        countPlannedRR++;
      }
    }
  }
  
  // Use Planned R:R if available, otherwise fallback to Realized Payoff Ratio
  const avgRiskReward = countPlannedRR > 0 
    ? totalPlannedRR / countPlannedRR 
    : (avgLoss > 0 ? avgWin / avgLoss : (avgWin > 0 ? Infinity : 0));

  return {
    expectedValue,
    profitFactor: calcProfitFactor(trades),
    avgRiskReward
  };
}

/**
 * Compares strategies for the Strategy Matrix.
 */
export function calcStrategyMatrix(trades: Trade[]): { strategy: string; winRate: number; profitFactor: number; netPnl: number; count: number }[] {
  const map = new Map<string, Trade[]>();
  
  trades.forEach(t => {
    const strat = t.strategy || 'Uncategorized';
    if (!map.has(strat)) map.set(strat, []);
    map.get(strat)!.push(t);
  });

  return Array.from(map.entries()).map(([strategy, stratTrades]) => ({
    strategy,
    count: stratTrades.length,
    winRate: calcWinRate(stratTrades),
    profitFactor: calcProfitFactor(stratTrades),
    netPnl: stratTrades.reduce((sum, t) => sum + calcPnL(t), 0)
  })).sort((a, b) => b.netPnl - a.netPnl);
}


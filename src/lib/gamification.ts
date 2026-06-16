import { Trade } from '@/types';
import { calcAllStats } from '@/lib/analytics';
import { startOfDay, startOfWeek, startOfMonth, format, differenceInHours, differenceInDays } from 'date-fns';

export type AchievementCategory = 'milestone' | 'streak' | 'win_rate' | 'time' | 'growth' | 'other';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  isUnlocked: boolean;
  progress?: { current: number; target: number };
  icon: string;
}

export interface TradingPersona {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export function evaluateAchievements(trades: Trade[], startingBalance: number): Achievement[] {
  const sortedTrades = [...trades].sort((a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime());
  const totalTrades = sortedTrades.length;
  const stats = calcAllStats(trades, startingBalance);
  
  const achievements: Achievement[] = [];

  const addM = (id: string, name: string, description: string, target: number, current: number, icon: string) => {
    achievements.push({
      id, name, description, category: 'milestone',
      isUnlocked: current >= target,
      progress: { current: Math.min(current, target), target },
      icon
    });
  };

  // --- MILESTONES (Trade Counts) ---
  addM('first_step', 'First Step', 'Log your first trade entry.', 1, totalTrades, '🐣');
  addM('getting_reps', 'Getting the Reps', 'Save 10 trades in the journal.', 10, totalTrades, '🥉');
  addM('finding_groove', 'Finding the Groove', 'Save 20 trades.', 20, totalTrades, '🥈');
  addM('quarter_century', 'Quarter Century', 'Save 25 trades.', 25, totalTrades, '🏅');
  addM('half_century', 'Half-Century', 'Save 50 trades.', 50, totalTrades, '🥇');
  addM('almost_there', 'Almost There', 'Save 75 trades.', 75, totalTrades, '🏃');
  addM('centurion', 'Centurion', 'Save 100 trades.', 100, totalTrades, '💯');
  addM('double_centurion', 'Double Centurion', 'Save 200 trades.', 200, totalTrades, '🐉');
  addM('spartan', 'Spartan', 'Save 300 trades.', 300, totalTrades, '🛡️');
  addM('gladiator', 'The Gladiator', 'Save 400 trades.', 400, totalTrades, '⚔️');
  addM('veteran', 'Veteran', 'Save 500 trades.', 500, totalTrades, '🎖️');
  addM('machine', 'The Machine', 'Save 750 trades.', 750, totalTrades, '🤖');
  addM('grandmaster', 'Grandmaster', 'Save 1,000 trades.', 1000, totalTrades, '👑');

  // Helper for streaks and PnL
  let currentWinStreak = 0;
  let maxWinStreak = 0;
  let currentLossStreak = 0;
  let hasBroken3Loss = false;
  let hasBroken5Loss = false;
  let hasBreakeven = false;

  sortedTrades.forEach(t => {
    const pnl = t.realized_pnl || 0;
    if (pnl > 0) {
      currentWinStreak++;
      if (currentLossStreak >= 3) hasBroken3Loss = true;
      if (currentLossStreak >= 5) hasBroken5Loss = true;
      currentLossStreak = 0;
    } else if (pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
    } else if (pnl === 0 && t.close_time) {
      hasBreakeven = true;
    }
    if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
  });

  const addS = (id: string, name: string, description: string, reqStreak: number, icon: string) => {
    achievements.push({
      id, name, description, category: 'streak',
      isUnlocked: maxWinStreak >= reqStreak,
      progress: { current: Math.min(maxWinStreak, reqStreak), target: reqStreak },
      icon
    });
  };

  // --- WIN STREAKS ---
  achievements.push({ id: 'back_in_black', name: 'Back in Black', description: 'Log your first winning trade.', category: 'streak', isUnlocked: maxWinStreak >= 1, icon: '📈' });
  addS('double_tap', 'Double Tap', '2 consecutive winning trades.', 2, '🔫');
  addS('hot_hand', 'Hot Hand', '3 consecutive winning trades.', 3, '🔥');
  addS('on_fire', 'On Fire', '4 consecutive winning trades.', 4, '🚒');
  addS('unstoppable', 'Unstoppable', '5 consecutive winning trades.', 5, '🚂');
  addS('dominating', 'Dominating', '7 consecutive winning trades.', 7, '😤');
  addS('sniper_streak', 'The Sniper', '10 consecutive winning trades.', 10, '🎯');
  addS('godlike', 'Godlike', '15 consecutive winning trades.', 15, '⚡');

  achievements.push({ id: 'comeback', name: 'The Comeback', description: '1 winning trade that breaks a 3-loss streak.', category: 'streak', isUnlocked: hasBroken3Loss, icon: '🔄' });
  achievements.push({ id: 'phoenix', name: 'Phoenix', description: '1 winning trade that breaks a 5-loss streak.', category: 'streak', isUnlocked: hasBroken5Loss, icon: '🦅' });
  achievements.push({ id: 'breakeven_savior', name: 'Breakeven Savior', description: 'Log a trade with an exact 0 PnL.', category: 'streak', isUnlocked: hasBreakeven, icon: '⚖️' });

  // --- WIN RATES (Last 20) ---
  const last20 = sortedTrades.slice(-20);
  const last20Wins = last20.filter(t => (t.realized_pnl || 0) > 0).length;
  const last20WR = last20.length >= 20 ? (last20Wins / 20) * 100 : 0;
  
  const addW = (id: string, name: string, description: string, reqWR: number, icon: string) => {
    achievements.push({
      id, name, description, category: 'win_rate',
      isUnlocked: last20.length >= 20 && last20WR >= reqWR,
      icon
    });
  };
  addW('sharpshooter', 'Sharpshooter', 'Achieve a 60% Win Rate over your last 20 trades.', 60, '🏹');
  addW('eagle_eye', 'Eagle Eye', 'Achieve a 70% Win Rate over your last 20 trades.', 70, '🦅');
  addW('predictor', 'Predictor', 'Achieve an 80% Win Rate over your last 20 trades.', 80, '🔮');

  // --- WORD COUNTS ---
  const maxWords = sortedTrades.reduce((max, t) => {
    const words = (t.reason || '').trim().split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(max, words);
  }, 0);
  achievements.push({ id: 'the_scribe', name: 'The Scribe', description: 'Write a trade note of more than 50 words.', category: 'other', isUnlocked: maxWords > 50, icon: '✍️' });
  achievements.push({ id: 'the_essayist', name: 'The Essayist', description: 'Write a trade note of more than 200 words.', category: 'other', isUnlocked: maxWords > 200, icon: '📜' });

  // --- TIME / FREQUENCY ---
  let hasNightOwl = false;
  let hasEarlyBird = false;
  let hasLongHold = false;
  let hasVeryLongHold = false;
  let maxTradesInDay = 0;

  const tradesByDay: Record<string, number> = {};
  sortedTrades.forEach(t => {
    const entry = new Date(t.entry_time);
    const hour = entry.getHours();
    if (hour >= 0 && hour < 4) hasNightOwl = true;
    if (hour >= 5 && hour < 8) hasEarlyBird = true;
    
    if (t.close_time) {
      const close = new Date(t.close_time);
      const hoursHeld = differenceInHours(close, entry);
      const daysHeld = differenceInDays(close, entry);
      if (hoursHeld > 24) hasLongHold = true;
      if (daysHeld > 7) hasVeryLongHold = true;
    }

    const dayKey = format(entry, 'yyyy-MM-dd');
    tradesByDay[dayKey] = (tradesByDay[dayKey] || 0) + 1;
    if (tradesByDay[dayKey] > maxTradesInDay) maxTradesInDay = tradesByDay[dayKey];
  });

  achievements.push({ id: 'night_owl', name: 'Night Owl', description: 'Log an entry between 00:00 - 04:00.', category: 'time', isUnlocked: hasNightOwl, icon: '🦉' });
  achievements.push({ id: 'early_bird', name: 'Early Bird', description: 'Log an entry between 05:00 - 08:00.', category: 'time', isUnlocked: hasEarlyBird, icon: '🌅' });
  achievements.push({ id: 'patience_bitter', name: 'Patience is Bitter', description: 'Hold a trade for more than 24 hours.', category: 'time', isUnlocked: hasLongHold, icon: '⏳' });
  achievements.push({ id: 'the_holder', name: 'The Holder', description: 'Hold a trade for more than 1 week.', category: 'time', isUnlocked: hasVeryLongHold, icon: '💎' });
  achievements.push({ id: 'multitasker', name: 'Multitasker', description: 'Log more than 2 trades on the same day.', category: 'time', isUnlocked: maxTradesInDay > 2, icon: '🤹' });

  // --- ACCOUNT GROWTH ---
  const currentEquity = startingBalance + stats.netPnl;
  const growthPct = startingBalance > 0 ? ((currentEquity - startingBalance) / startingBalance) * 100 : 0;
  
  const addG = (id: string, name: string, description: string, reqPct: number, icon: string) => {
    achievements.push({
      id, name, description, category: 'growth',
      isUnlocked: growthPct >= reqPct,
      icon
    });
  };
  addG('level_up', 'Level Up', 'Grow equity by 5%.', 5, '🍄');
  addG('compounder', 'Compounder', 'Grow equity by 10%.', 10, '📈');
  addG('momentum_shift', 'Momentum Shift', 'Grow equity by 20%.', 20, '🚀');
  addG('scaling_up', 'Scaling Up', 'Grow equity by 25%.', 25, '⚖️');
  addG('halfway_there', 'Halfway There', 'Grow equity by 50%.', 50, '🌓');
  addG('double_dragon', 'Double Dragon', 'Grow equity by 100% (Double).', 100, '🐉');
  addG('triple_threat', 'Triple Threat', 'Grow equity by 200%.', 200, '🔱');

  return achievements;
}

export function determinePersona(trades: Trade[]): TradingPersona | null {
  if (trades.length < 30) return null;

  const wins = trades.filter(t => (t.realized_pnl || 0) > 0);
  const winRate = (wins.length / trades.length) * 100;
  
  let totalHoldTimeMs = 0;
  let closedCount = 0;
  trades.forEach(t => {
    if (t.close_time) {
      totalHoldTimeMs += new Date(t.close_time).getTime() - new Date(t.entry_time).getTime();
      closedCount++;
    }
  });
  const avgHoldHours = closedCount > 0 ? (totalHoldTimeMs / closedCount) / (1000 * 60 * 60) : 0;

  if (winRate > 65 && avgHoldHours > 4) {
    return { id: 'sniper', name: 'The Sniper', description: 'High win rate, patient setups. You wait for the perfect shot.', icon: '🎯' };
  }
  if (avgHoldHours < 2 && trades.length > 50) {
    return { id: 'scalper', name: 'The Scalper', description: 'In and out fast. You capitalize on short-term momentum.', icon: '⚡' };
  }
  if (avgHoldHours > 48 && winRate > 40) {
    return { id: 'diamond_hands', name: 'Diamond Hands', description: 'You let winners run. Multi-day holds are your specialty.', icon: '💎' };
  }
  
  return { id: 'grinder', name: 'The Grinder', description: 'Consistent and hardworking. You take the reps and manage risk.', icon: '⛏️' };
}

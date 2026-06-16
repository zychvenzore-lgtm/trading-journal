/**
 * ============================================================
 * DASHBOARD OVERVIEW PAGE
 * Landing page showing equity summary + recent trades.
 * ============================================================
 */
'use client';

import { useMemo, useState } from 'react';
import { useTrades } from '@/contexts/TradeContext';
import { useAccounts } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { calcPnL, getOutcome, calcAllStats } from '@/lib/analytics';
import type { PositionType, TradeDirection } from '@/types';
import { formatCurrency, formatDateTime, formatPercentage } from '@/lib/utils';

export default function DashboardOverviewPage() {
  const { trades, loading: tradesLoading, bulkAddTrades } = useTrades();
  const { activeAccount } = useAccounts();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [generating, setGenerating] = useState(false);

  /** Generate Dummy Data */
  const generateDummyData = async () => {
    if (!activeAccount || !user) return;
    
    // Limit total trades to 15 for DEMO accounts
    const availableSlots = 15 - trades.length;
    if (availableSlots <= 0) {
      alert(t('dashboard.demoLimitAlert'));
      return;
    }
    
    const countToGenerate = Math.min(10, availableSlots);
    
    setGenerating(true);
    try {
      const now = new Date();
      const dummyTrades = [];
      
      // Generate fake trades
      for (let i = 0; i < countToGenerate; i++) {
        const isCrypto = Math.random() > 0.4;
        const isForex = !isCrypto && Math.random() > 0.5;
        
        let position_type: PositionType;
        let ticker: string;
        let entry_price: number;
        let exit_price: number;
        let position_size: number;
        let leverage: number = 1;
        
        // 75% chance of being profitable
        const isProfitable = Math.random() > 0.25;
        
        if (isCrypto) {
           position_type = 'MARGIN';
           ticker = Math.random() > 0.5 ? 'BTCUSDT' : 'ETHUSDT';
           entry_price = ticker === 'BTCUSDT' ? 65000 + (Math.random() * 2000 - 1000) : 3500 + (Math.random() * 100 - 50);
           const pnlPercent = isProfitable ? (Math.random() * 0.05 + 0.01) : -(Math.random() * 0.03 + 0.005);
           exit_price = entry_price * (1 + pnlPercent);
           position_size = Math.floor(Math.random() * 500) + 50; 
           leverage = Math.floor(Math.random() * 20) + 1;
        } else if (isForex) {
           position_type = 'LOTS';
           ticker = Math.random() > 0.5 ? 'EURUSD' : 'GBPUSD';
           entry_price = ticker === 'EURUSD' ? 1.1000 + (Math.random() * 0.02 - 0.01) : 1.3000 + (Math.random() * 0.02 - 0.01);
           const pnlPoints = isProfitable ? (Math.random() * 0.01 + 0.002) : -(Math.random() * 0.005 + 0.001);
           exit_price = entry_price + pnlPoints;
           position_size = Math.round((Math.random() * 2 + 0.1) * 10) / 10; 
        } else {
           position_type = 'QUANTITY';
           ticker = Math.random() > 0.5 ? 'AAPL' : 'TSLA';
           entry_price = ticker === 'AAPL' ? 180 + (Math.random() * 20 - 10) : 200 + (Math.random() * 20 - 10);
           const pnlPercent = isProfitable ? (Math.random() * 0.04 + 0.01) : -(Math.random() * 0.02 + 0.005);
           exit_price = entry_price * (1 + pnlPercent);
           position_size = Math.floor(Math.random() * 100) + 10;
        }

        const direction: TradeDirection = Math.random() > 0.5 ? 'LONG' : 'SHORT';
        
        // Adjust exit price if SHORT
        if (direction === 'SHORT' && isProfitable) {
          exit_price = entry_price - Math.abs(entry_price - exit_price);
        } else if (direction === 'SHORT' && !isProfitable) {
          exit_price = entry_price + Math.abs(entry_price - exit_price);
        }

        const entry_time = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const close_time = new Date(entry_time.getTime() + (Math.random() * 48 + 1) * 60 * 60 * 1000);

        dummyTrades.push({
          account_id: activeAccount.id,
          user_id: user.id,
          ticker,
          direction,
          position_type,
          entry_price,
          exit_price,
          position_size,
          leverage,
          entry_time: entry_time.toISOString(),
          close_time: close_time.toISOString(),
          fees: Math.round(Math.random() * 5 * 100) / 100,
          stop_loss: null,
          take_profit: null,
          strategy: null,
          reason: 'Dummy trade generated for demo purposes.',
          chart_link: null,
          realized_pnl: null,
        });
      }
      
      await bulkAddTrades(dummyTrades);
      
    } catch (err) {
      console.error('Failed to generate dummy data:', err);
    } finally {
      setGenerating(false);
    }
  };

  /** Compute all stats from trades */
  const stats = useMemo(
    () => calcAllStats(trades, activeAccount?.starting_balance ?? 0),
    [trades, activeAccount?.starting_balance]
  );

  /** Get the 5 most recent trades */
  const recentTrades = useMemo(() => {
    return [...trades]
      .sort((a, b) => new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime())
      .slice(0, 5);
  }, [trades]);

  if (tradesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative space-y-8 animate-fade-in min-h-full p-4 md:p-6 lg:p-8 bg-base-900">
      {/* ---- Background Depth Orbs ---- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div 
          className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] animate-float-slow opacity-30" 
          style={{ background: 'radial-gradient(circle, rgba(0, 136, 255, 0.08) 0%, rgba(0, 136, 255, 0) 70%)' }} 
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[1000px] h-[1000px] animate-float-reverse opacity-30" 
          style={{ background: 'radial-gradient(circle, rgba(0, 86, 179, 0.08) 0%, rgba(0, 86, 179, 0) 70%)' }} 
        />
      </div>

      {/* ---- Page Header ---- */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">{t('dashboard.title')}</h1>
            {activeAccount?.account_type === 'DEMO' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateDummyData}
                loading={generating}
                className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20 hover:text-warning hover:border-warning/30"
              >
                {t('dashboard.generateDummy')}
              </Button>
            )}
          </div>
          <p className="text-text-secondary mt-1">
            {activeAccount
              ? `${t('dashboard.overviewFor')} ${activeAccount.name}`
              : t('dashboard.createAccountPrompt')}
          </p>
        </div>
      </div>

      {/* ---- Stats Grid ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard.totalEquity')}
          value={formatCurrency(stats.totalEquity)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label={t('dashboard.winRate')}
          value={formatPercentage(stats.winRate)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label={t('dashboard.netPnl')}
          value={formatCurrency(stats.netPnl)}
          trend={
            stats.netPnl !== 0 && activeAccount?.starting_balance
              ? { 
                  value: (stats.netPnl / activeAccount.starting_balance) * 100, 
                  positive: stats.netPnl > 0 
                }
              : undefined
          }
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          label={t('dashboard.totalTrades')}
          value={stats.totalTrades.toString()}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      {/* ---- Second Row Stats ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard.profitFactor')}
          value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
        />
        <StatCard
          label={t('dashboard.maxDrawdown')}
          value={formatPercentage(stats.maxDrawdown)}
        />
        <StatCard
          label={t('dashboard.grossProfit')}
          value={formatCurrency(stats.grossProfit)}
        />
        <StatCard
          label={t('dashboard.totalFees')}
          value={formatCurrency(stats.totalFees)}
        />
      </div>

      {/* ---- Recent Trades Table ---- */}
      <div className="relative z-10 bg-base-800/40 backdrop-blur-xl border border-base-600/30 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        {/* Subtle inner top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="relative px-6 py-5 border-b border-base-600/30 flex items-center justify-between bg-base-800/30">
          <h2 className="text-lg font-bold text-white tracking-wide">{t('dashboard.recentTrades')}</h2>
          <a
            href="/dashboard/ledger"
            className="text-accent text-sm font-medium hover:text-accent-light transition-colors flex items-center gap-1"
          >
            {t('dashboard.viewAll')} 
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {recentTrades.length === 0 ? (
          <div className="px-6 py-12 text-center text-text-muted">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>{t('dashboard.noTradesYet')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-medium">{t('dashboard.date')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('dashboard.ticker')}</th>
                  <th className="text-left px-6 py-3 font-medium">{t('dashboard.direction')}</th>
                  <th className="text-right px-6 py-3 font-medium">{t('dashboard.entry')}</th>
                  <th className="text-right px-6 py-3 font-medium">{t('dashboard.exit')}</th>
                  <th className="text-right px-6 py-3 font-medium">{t('dashboard.pnl')}</th>
                  <th className="text-center px-6 py-3 font-medium">{t('dashboard.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-700/50">
                {recentTrades.map((trade) => {
                  const pnl = calcPnL(trade);
                  const outcome = getOutcome(trade);
                  return (
                    <tr
                      key={trade.id}
                      className="hover:bg-base-700/40 transition-colors group cursor-default"
                    >
                      <td className="px-6 py-4 text-text-secondary whitespace-nowrap group-hover:text-text-primary transition-colors">
                        {formatDateTime(trade.entry_time)}
                      </td>
                      <td className="px-6 py-3.5 text-text-primary font-mono font-medium">
                        {trade.ticker}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`font-semibold text-xs ${
                            trade.direction === 'LONG' ? 'text-accent' : 'text-danger'
                          }`}
                        >
                          {trade.direction}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-text-secondary font-mono">
                        {trade.entry_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 text-right text-text-secondary font-mono">
                        {trade.exit_price?.toLocaleString() ?? '—'}
                      </td>
                      <td
                        className={`px-6 py-3.5 text-right font-mono font-medium ${
                          pnl > 0 ? 'text-accent' : pnl < 0 ? 'text-danger' : 'text-text-muted'
                        }`}
                      >
                        {pnl > 0 ? '+' : ''}
                        {formatCurrency(pnl)}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <Badge variant={outcome.toLowerCase() as 'win' | 'loss' | 'breakeven' | 'open'}>
                          {outcome === 'WIN' ? t('ledger.filterWin') : outcome === 'LOSS' ? t('ledger.filterLoss') : outcome === 'BREAKEVEN' ? t('ledger.filterBreakeven') : t('ledger.filterOpen')}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

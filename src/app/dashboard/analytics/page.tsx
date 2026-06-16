'use client';

import { useMemo } from 'react';
import { useTrades } from '@/contexts/TradeContext';
import { useAccounts } from '@/contexts/AccountContext';
import {
  calcHeatmapData,
  buildEquityCurve,
  calcWinLossDuration,
  calcTimeAnalysis,
  calcHourlyPerformance,
  calcEVAndRiskOfRuin,
  calcStrategyMatrix,
  calcWinRate
} from '@/lib/analytics';
import { useLanguage } from '@/contexts/LanguageContext';

// Import our new chart components
import CalendarHeatmap from '@/components/charts/CalendarHeatmap';
import DrawdownCurve from '@/components/charts/DrawdownCurve';
import DurationStatsCard from '@/components/charts/DurationStatsCard';
import HourlyPerformanceChart from '@/components/charts/HourlyPerformanceChart';
import WeekdayPerformanceTable from '@/components/charts/WeekdayPerformanceTable';
import StrategyMatrix from '@/components/charts/StrategyMatrix';
import RiskOfRuinCard from '@/components/charts/RiskOfRuinCard';

export default function AnalyticsDashboardPage() {
  const { trades, loading: tradesLoading } = useTrades();
  const { activeAccount } = useAccounts();
  const { t } = useLanguage();

  // Compute all advanced analytics data
  const {
    winRate,
    heatmapData,
    equityCurve,
    durationData,
    timeAnalysis,
    hourlyPerformance,
    evAndRisk,
    strategyMatrix
  } = useMemo(() => {
    const startingBalance = activeAccount?.starting_balance ?? 0;
    
    return {
      winRate: calcWinRate(trades),
      heatmapData: calcHeatmapData(trades),
      equityCurve: buildEquityCurve(trades, startingBalance),
      durationData: calcWinLossDuration(trades),
      timeAnalysis: calcTimeAnalysis(trades),
      hourlyPerformance: calcHourlyPerformance(trades),
      evAndRisk: calcEVAndRiskOfRuin(trades),
      strategyMatrix: calcStrategyMatrix(trades)
    };
  }, [trades, activeAccount?.starting_balance]);

  if (tradesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative space-y-8 animate-fade-in min-h-[calc(100vh-80px)] p-4 md:p-6 lg:p-8 bg-base-900 pb-20">
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
      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-text-primary tracking-wide">{t('analytics.title')}</h1>
        <p className="text-text-secondary mt-1">
          {t('analytics.subtitle')}
        </p>
      </div>

      {/* ---- Top Row: Risk of Ruin & Heatmap ---- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative z-10">
        <div className="xl:col-span-3">
          <RiskOfRuinCard {...evAndRisk} winRate={winRate} currency={activeAccount?.currency} />
        </div>
        <div className="xl:col-span-3">
          <CalendarHeatmap data={heatmapData} currency={activeAccount?.currency} />
        </div>
      </div>

      {/* ---- Middle Row: Equity Curve & Duration Scatter ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <DrawdownCurve data={equityCurve} currency={activeAccount?.currency} />
        <DurationStatsCard {...durationData} />
      </div>

      {/* ---- Bottom Row: Time Analytics (Hourly & Weekday) ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <HourlyPerformanceChart data={hourlyPerformance} currency={activeAccount?.currency} />
        <WeekdayPerformanceTable data={timeAnalysis} currency={activeAccount?.currency} />
      </div>

      {/* ---- Final Row: Strategy Matrix ---- */}
      <div className="grid grid-cols-1 relative z-10">
        <StrategyMatrix data={strategyMatrix} currency={activeAccount?.currency} />
      </div>
    </div>
  );
}

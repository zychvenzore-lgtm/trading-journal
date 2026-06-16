'use client';

import React from 'react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface WeekdayData {
  day: string;
  count: number;
  winRate: number; // 0-100
  netPnl: number;
}

interface WeekdayPerformanceTableProps {
  data: WeekdayData[];
  currency?: string;
}

export default function WeekdayPerformanceTable({ data, currency = 'USD' }: WeekdayPerformanceTableProps) {
  const { t } = useLanguage();
  // We want Monday-Sunday order typically for these charts.
  // Assuming data comes in Sun-Sat order from analytics.
  const orderedData = [
    data.find(d => d.day === 'Monday'),
    data.find(d => d.day === 'Tuesday'),
    data.find(d => d.day === 'Wednesday'),
    data.find(d => d.day === 'Thursday'),
    data.find(d => d.day === 'Friday'),
    data.find(d => d.day === 'Saturday'),
    data.find(d => d.day === 'Sunday'),
  ].filter(Boolean) as WeekdayData[];

  return (
    <div className="bg-base-800/60 backdrop-blur-2xl border border-base-600/40 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col hover:border-base-500/60 transition-all duration-300 h-[500px]">
      <h3 className="text-text-primary text-lg font-semibold tracking-wide mb-6">{t('analyticsCharts.weekdayTitle')}</h3>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-base-700/50">
              <th className="pb-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">{t('dashboard.date')}</th>
              <th className="pb-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">{t('strategies.totalTrades')}</th>
              <th className="pb-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">{t('dashboard.winRate')}</th>
              <th className="pb-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">{t('dashboard.netPnl')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-700/30">
            {orderedData.map((row) => (
              <tr key={row.day} className="hover:bg-base-700/20 transition-colors group">
                <td className="py-4 px-4">
                  <span className="font-medium text-text-primary group-hover:text-white transition-colors">{row.day}</span>
                </td>
                <td className="py-4 px-4 text-right text-text-secondary">
                  {row.count}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-base-700 rounded-full overflow-hidden flex-shrink-0">
                      <div 
                        className={`h-full ${row.winRate >= 50 ? 'bg-success' : 'bg-danger'}`} 
                        style={{ width: `${Math.min(100, Math.max(0, row.winRate))}%` }} 
                      />
                    </div>
                    <span className="text-text-primary text-sm min-w-[45px]">{(row.winRate).toFixed(1)}%</span>
                  </div>
                </td>
                <td className={`py-4 px-4 text-right font-semibold tracking-tight ${row.netPnl > 0 ? 'text-success' : row.netPnl < 0 ? 'text-danger' : 'text-text-secondary'}`}>
                  {row.netPnl > 0 ? '+' : ''}{formatCurrency(row.netPnl, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

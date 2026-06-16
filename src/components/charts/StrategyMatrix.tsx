'use client';

import React from 'react';

import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface StrategyData {
  strategy: string;
  winRate: number; // e.g. 0.55 for 55%
  profitFactor: number;
  netPnl: number;
  count: number;
}

interface StrategyMatrixProps {
  data: StrategyData[];
  currency?: string;
}

export default function StrategyMatrix({ data, currency = 'USD' }: StrategyMatrixProps) {
  const { t } = useLanguage();
  return (
    <div className="bg-base-800/60 backdrop-blur-2xl border border-base-600/40 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col hover:border-base-500/60 transition-all duration-300">
      <div className="p-6 border-b border-base-600/30">
        <h3 className="text-text-primary text-lg font-semibold">{t('analyticsCharts.strategyMatrixTitle')}</h3>
        <p className="text-sm text-text-muted mt-1">{t('analyticsCharts.strategyMatrixDesc')}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-base-700/50 text-text-secondary text-sm">
              <th className="py-4 px-6 font-medium">{t('ledger.strategy')}</th>
              <th className="py-4 px-6 font-medium">{t('strategies.totalTrades')}</th>
              <th className="py-4 px-6 font-medium">{t('dashboard.winRate')}</th>
              <th className="py-4 px-6 font-medium">{t('dashboard.profitFactor')}</th>
              <th className="py-4 px-6 font-medium text-right">{t('dashboard.netPnl')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-600/30">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-base-700/30 transition-colors">
                <td className="py-4 px-6 text-text-primary font-medium">{row.strategy}</td>
                <td className="py-4 px-6 text-text-secondary">{row.count}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary">{(row.winRate).toFixed(1)}%</span>
                    <div className="w-16 h-1.5 bg-base-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${row.winRate >= 50 ? 'bg-success' : 'bg-danger'}`} 
                        style={{ width: `${Math.min(100, Math.max(0, row.winRate))}%` }} 
                      />
                    </div>
                  </div>
                </td>
                <td className={`py-4 px-6 font-medium ${row.profitFactor === Infinity ? 'text-accent' : row.profitFactor >= 1.5 ? 'text-success' : row.profitFactor >= 1 ? 'text-accent' : 'text-danger'}`}>
                  {row.profitFactor === Infinity ? '∞' : row.profitFactor.toFixed(2)}
                </td>
                <td className={`py-4 px-6 text-right font-bold tracking-tight ${row.netPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  {row.netPnl > 0 ? '+' : ''}{formatCurrency(row.netPnl, currency)}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted">
                  {t('strategies.noStrategiesFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

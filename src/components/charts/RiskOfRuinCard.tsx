'use client';

import React from 'react';

import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface RiskOfRuinCardProps {
  winRate: number; // 0-100
  expectedValue: number;
  profitFactor: number;
  avgRiskReward: number; // e.g. 1.5
  currency?: string;
}

export default function RiskOfRuinCard({ winRate, expectedValue, profitFactor, avgRiskReward, currency = 'USD' }: RiskOfRuinCardProps) {
  const { t } = useLanguage();
  return (
    <div className="bg-base-800/60 backdrop-blur-2xl border border-base-600/40 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:border-base-500/60 transition-all duration-300">
      {/* Decorative gradient blob */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-500" />
      
      <div className="relative z-10">
        <h3 className="text-text-primary text-lg font-semibold mb-6">{t('analyticsCharts.advancedMetrics')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Win Rate */}
          <div className="flex flex-col">
            <span className="text-sm text-text-secondary mb-1">{t('dashboard.winRate')}</span>
            <div className={`text-2xl font-bold tracking-tight ${winRate >= 50 ? 'text-success' : 'text-danger'}`}>
              {winRate.toFixed(1)}%
            </div>
            <span className="text-xs text-text-muted mt-2">
              {t('analyticsCharts.winRateDesc')}
            </span>
          </div>

          {/* Expected Value */}
          <div className="flex flex-col border-t md:border-t-0 md:border-l border-base-600/30 pt-4 md:pt-0 md:pl-6">
            <span className="text-sm text-text-secondary mb-1">{t('analyticsCharts.expectedValue')}</span>
            <div className={`text-2xl font-bold tracking-tight ${expectedValue >= 0 ? 'text-success' : 'text-danger'}`}>
              {expectedValue > 0 ? '+' : ''}{formatCurrency(expectedValue, currency)}
            </div>
            <span className="text-xs text-text-muted mt-2">
              {t('analyticsCharts.evDesc')}
            </span>
          </div>

          {/* Profit Factor */}
          <div className="flex flex-col border-t md:border-t-0 md:border-l border-base-600/30 pt-4 md:pt-0 md:pl-6">
            <span className="text-sm text-text-secondary mb-1">{t('dashboard.profitFactor')}</span>
            <div className={`text-2xl font-bold ${profitFactor === Infinity ? 'text-accent' : profitFactor >= 1.5 ? 'text-success' : profitFactor >= 1 ? 'text-accent' : 'text-danger'}`}>
              {profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
            </div>
            <span className="text-xs text-text-muted mt-2">
              {t('analyticsCharts.profitFactorDesc')}
            </span>
          </div>

          {/* Avg Risk/Reward */}
          <div className="flex flex-col border-t md:border-t-0 md:border-l border-base-600/30 pt-4 md:pt-0 md:pl-6">
            <span className="text-sm text-text-secondary mb-1">{t('analyticsCharts.avgRiskReward')}</span>
            <div className={`text-2xl font-bold ${avgRiskReward === Infinity ? 'text-accent' : avgRiskReward >= 1.5 ? 'text-success' : avgRiskReward >= 1 ? 'text-accent' : 'text-danger'}`}>
              {avgRiskReward === Infinity ? '1 : ∞' : `1 : ${avgRiskReward.toFixed(2)}`}
            </div>
            <span className="text-xs text-text-muted mt-2">
              {t('analyticsCharts.riskRewardDesc')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

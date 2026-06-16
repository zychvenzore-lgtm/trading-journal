'use client';

import React from 'react';
import { formatDuration } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface DurationStatsCardProps {
  avgWinDurationMs: number;
  avgLossDurationMs: number;
}

export default function DurationStatsCard({ avgWinDurationMs, avgLossDurationMs }: DurationStatsCardProps) {
  const { t } = useLanguage();
  return (
    <div className="bg-base-800/60 backdrop-blur-2xl border border-base-600/40 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col justify-center h-[400px] hover:border-base-500/60 transition-all duration-300">
      <h3 className="text-text-primary text-lg font-semibold mb-8">{t('analyticsCharts.avgTradeDuration')}</h3>
      
      <div className="space-y-8">
        {/* Winning Duration */}
        <div className="flex flex-col">
          <div className="flex justify-between items-end mb-2">
            <span className="text-text-secondary font-medium">{t('analyticsCharts.avgWinningTrade')}</span>
            <span className="text-2xl font-bold text-success tracking-tight">
              {formatDuration(avgWinDurationMs)}
            </span>
          </div>
          <div className="w-full h-3 bg-base-600 rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Losing Duration */}
        <div className="flex flex-col">
          <div className="flex justify-between items-end mb-2">
            <span className="text-text-secondary font-medium">{t('analyticsCharts.avgLosingTrade')}</span>
            <span className="text-2xl font-bold text-danger tracking-tight">
              {formatDuration(avgLossDurationMs)}
            </span>
          </div>
          <div className="w-full h-3 bg-base-600 rounded-full overflow-hidden">
            <div className="h-full bg-danger rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-text-muted text-center">
        {t('analyticsCharts.compareDuration')}
      </div>
    </div>
  );
}

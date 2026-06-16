'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeatmapData {
  date: string; // YYYY-MM-DD
  pnl: number;
  count: number;
}

interface CalendarHeatmapProps {
  data: HeatmapData[];
  currency?: string;
}

export default function CalendarHeatmap({ data, currency = 'USD' }: CalendarHeatmapProps) {
  const { t } = useLanguage();
  // Start with the current month
  const [currentDate, setCurrentDate] = useState(new Date());

  const dataMap = useMemo(() => {
    return new Map(data.map(d => [d.date, d]));
  }, [data]);

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar cells
  const cells = [];
  
  // Pad beginning of month
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push(<div key={`pad-${i}`} className="h-16 md:h-24 bg-transparent rounded-lg"></div>);
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    // Format YYYY-MM-DD local
    const d = new Date(year, month, day);
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');

    const dayData = dataMap.get(dateStr);
    
    let bgColorClass = 'bg-base-800/40 hover:bg-base-700/60 border-base-600/30';
    let textColorClass = 'text-text-primary';
    let pnlText = '';

    if (dayData) {
      if (dayData.pnl > 0) {
        bgColorClass = 'bg-success/20 hover:bg-success/30 border-success/30';
        textColorClass = 'text-success font-bold';
        pnlText = `+${formatCurrency(dayData.pnl, currency)}`;
      } else if (dayData.pnl < 0) {
        bgColorClass = 'bg-danger/20 hover:bg-danger/30 border-danger/30';
        textColorClass = 'text-danger font-bold';
        pnlText = formatCurrency(dayData.pnl, currency);
      } else {
        pnlText = '$0.00';
      }
    }

    cells.push(
      <div 
        key={dateStr} 
        className={`h-16 md:h-24 border rounded-xl p-2 flex flex-col justify-between transition-colors ${bgColorClass}`}
      >
        <div className="flex justify-between items-start">
          <span className={`text-sm font-medium ${dayData ? 'text-white' : 'text-text-secondary'}`}>{day}</span>
          {dayData && dayData.count > 0 && (
            <span className="text-[10px] bg-base-800/80 px-1.5 py-0.5 rounded text-text-muted border border-base-600/50">
              {dayData.count} {t('analyticsCharts.trades')}
            </span>
          )}
        </div>
        {dayData && (
          <div className={`text-xs md:text-sm tracking-tight truncate text-right ${textColorClass}`}>
            {pnlText}
          </div>
        )}
      </div>
    );
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-base-800/60 backdrop-blur-2xl border border-base-600/40 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col hover:border-base-500/60 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-text-primary text-lg font-semibold tracking-wide">{t('analyticsCharts.heatmapTitle')}</h3>
          <p className="text-sm text-text-muted mt-1">{t('analyticsCharts.heatmapDesc')}</p>
        </div>
        
        <div className="flex items-center gap-4 bg-base-800/80 border border-base-600/50 rounded-xl p-1">
          <button 
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-base-600 text-text-secondary hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          
          <span className="font-semibold text-white min-w-[140px] text-center tracking-wide">
            {monthName}
          </span>
          
          <button 
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-base-600 text-text-secondary hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {cells}
      </div>

    </div>
  );
}

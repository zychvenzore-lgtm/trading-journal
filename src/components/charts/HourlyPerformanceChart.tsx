'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface HourlyPerformanceChartProps {
  data: { hour: string; pnl: number }[];
  currency?: string;
}

export default function HourlyPerformanceChart({ data, currency = 'USD' }: HourlyPerformanceChartProps) {
  const { t } = useLanguage();
  // Filter out hours with exactly 0 pnl if we want to save space, 
  // but standard usually shows all hours. Let's keep all hours to show the full distribution.

  return (
    <div className="bg-base-800/60 backdrop-blur-2xl border border-base-600/40 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col h-[500px] hover:border-base-500/60 transition-all duration-300">
      <h3 className="text-text-primary text-lg font-semibold tracking-wide mb-6">{t('analyticsCharts.hourlyTitle')}</h3>
      
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" horizontal={true} vertical={false} opacity={0.5} />
            <XAxis 
              type="number" 
              tickFormatter={(value) => formatCurrency(value, currency)}
              stroke="#6B7280" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              dataKey="hour" 
              type="category" 
              stroke="#6B7280" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip 
              cursor={{ fill: '#2A2D3A', opacity: 0.4 }}
              contentStyle={{ backgroundColor: '#1A1D24', borderColor: '#374151', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
              itemStyle={{ color: '#E5E7EB' }}
              formatter={(value: number) => [formatCurrency(value, currency), 'Net PnL']}
              labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
            />
            <ReferenceLine x={0} stroke="#4B5563" strokeDasharray="3 3" />
            <Bar dataKey="pnl" barSize={8} radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface DrawdownData {
  date: string;
  equity: number;
  drawdown: number;
}

interface DrawdownCurveProps {
  data: DrawdownData[];
  currency?: string;
}

export default function DrawdownCurve({ data, currency = 'USD' }: DrawdownCurveProps) {
  const { t } = useLanguage();
  return (
    <div className="bg-base-800/60 backdrop-blur-2xl border border-base-600/40 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col h-[400px] hover:border-base-500/60 transition-all duration-300">
      <h3 className="text-text-primary text-lg font-semibold mb-4">{t('analyticsCharts.drawdownTitle')}</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007BFF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#007BFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-600)" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-text-muted)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              yAxisId="left" 
              stroke="var(--color-text-muted)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => formatCurrency(value, currency).replace(/\.00$/, '')} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="var(--color-text-muted)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `${value}%`} 
            />
            <Tooltip 
              formatter={(value: any, name: any) => {
                if (name === 'Drawdown' || name === 'Penurunan') return [`${Number(value).toFixed(2)}%`, name];
                return [formatCurrency(Number(value), currency), name];
              }}
              labelFormatter={(label: any) => new Date(label as string).toLocaleDateString()}
              contentStyle={{ 
                backgroundColor: 'var(--color-base-800)', 
                borderColor: 'var(--color-base-600)',
                color: 'var(--color-text-primary)',
                borderRadius: '0.5rem',
                backdropFilter: 'blur(16px)'
              }}
              itemStyle={{ color: 'var(--color-text-primary)' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }} />
            <Area 
              yAxisId="left" 
              type="monotone" 
              dataKey="equity" 
              name="Equity"
              stroke="#007BFF" 
              fillOpacity={1} 
              fill="url(#colorEquity)" 
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="drawdown" 
              name="Drawdown"
              stroke="#FF3333" 
              strokeWidth={2} 
              dot={false} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

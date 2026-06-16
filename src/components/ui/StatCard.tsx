'use client';

import React from 'react';

interface Trend {
  /** Percentage change value (e.g. 12.5 for +12.5%) */
  value: number;
  /** Whether the trend is positive (green arrow up) or negative (red arrow down) */
  positive: boolean;
}

interface StatCardProps {
  /** Upper label describing the stat (e.g. "Win Rate") */
  label: string;
  /** The main value to display (e.g. "68%" or 1234) */
  value: string | number;
  /** Optional icon rendered in the top-right corner */
  icon?: React.ReactNode;
  /** Optional trend indicator with percentage and direction */
  trend?: Trend;
  /** Additional class names for the card wrapper */
  className?: string;
}

/**
 * TrendArrowUp – Small SVG arrow pointing upward for positive trends.
 */
const TrendArrowUp: React.FC = () => (
  <svg
    className="h-3.5 w-3.5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * TrendArrowDown – Small SVG arrow pointing downward for negative trends.
 */
const TrendArrowDown: React.FC = () => (
  <svg
    className="h-3.5 w-3.5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * StatCard – A glassmorphic analytics card displaying a single KPI.
 *
 * Features:
 * - Semi-transparent background with backdrop-blur (glassmorphism)
 * - Subtle border from the theme tokens
 * - Optional icon in the top-right corner
 * - Optional trend indicator showing percentage with a colour-coded arrow
 * - Gentle scale-up on hover for visual feedback
 *
 * @example
 * <StatCard
 *   label="Win Rate"
 *   value="68.4%"
 *   icon={<ChartIcon />}
 *   trend={{ value: 3.2, positive: true }}
 * />
 */
const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  className = '',
}) => {
  return (
    <div
      className={[
        // Deep Glassmorphism card
        'relative overflow-hidden group',
        'bg-base-800/40 backdrop-blur-xl',
        'border border-base-600/30 rounded-2xl p-6',
        'shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
        // Hover interaction
        'hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,243,255,0.08)] hover:border-accent/30',
        'transition-all duration-300 ease-out',
        className,
      ].join(' ')}
    >
      {/* Subtle inner top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {/* Subtle corner glow on hover */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header row: label + optional icon */}
      <div className="relative z-10 flex items-center justify-between">
        <p className="text-text-muted text-sm uppercase tracking-wider">
          {label}
        </p>
        {icon && (
          <span className="text-text-muted">{icon}</span>
        )}
      </div>

      {/* Main value */}
      <p className="text-2xl font-bold text-text-primary mt-2">{value}</p>

      {/* Trend indicator */}
      {trend && (
        <div
          className={[
            'flex items-center gap-1 mt-2 text-xs font-medium',
            trend.positive ? 'text-success' : 'text-danger',
          ].join(' ')}
        >
          {trend.positive ? <TrendArrowUp /> : <TrendArrowDown />}
          <span>
            {trend.positive ? '+' : '-'}
            {Math.abs(trend.value).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

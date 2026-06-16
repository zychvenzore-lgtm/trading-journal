'use client';

import React from 'react';

/**
 * Badge variant corresponding to TradeOutcome values.
 */
type BadgeVariant = 'win' | 'loss' | 'breakeven' | 'open';

interface BadgeProps {
  /** The visual variant that controls colour scheme */
  variant: BadgeVariant;
  /**
   * Optional children override the default label text.
   * When omitted the badge displays the variant name in uppercase.
   */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

/** Colour classes for each variant */
const variantClasses: Record<BadgeVariant, string> = {
  win: 'bg-accent/20 text-accent border-accent/30',
  loss: 'bg-danger/20 text-danger border-danger/30',
  breakeven: 'bg-base-500/30 text-text-secondary border-base-400/30',
  open: 'bg-transparent text-text-muted border-text-muted/40',
};

/** Default display text for each variant when no children are provided */
const variantLabels: Record<BadgeVariant, string> = {
  win: 'WIN',
  loss: 'LOSS',
  breakeven: 'BREAKEVEN',
  open: 'OPEN',
};

/**
 * Badge – A small status pill used to display trade outcomes.
 *
 * Each variant maps to a distinct colour scheme:
 * - **win** – accent blue with translucent background
 * - **loss** – danger red with translucent background
 * - **breakeven** – neutral grey
 * - **open** – outlined with muted text
 *
 * @example
 * <Badge variant="win" />           // renders "WIN"
 * <Badge variant="loss">-$42</Badge> // renders "-$42" in red
 */
const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  return (
    <span
      className={[
        // Shared base styles
        'inline-flex items-center rounded-full px-3 py-1',
        'text-xs font-semibold uppercase tracking-wider',
        'border',
        // Variant-specific colours
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children ?? variantLabels[variant]}
    </span>
  );
};

export default Badge;

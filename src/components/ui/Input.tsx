'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input; also triggers red border */
  error?: string;
  /** Optional icon rendered inside the left side of the input */
  icon?: React.ReactNode;
  /** Additional class names for the wrapper div */
  className?: string;
}

/**
 * Input – A dark-themed form input with optional label, icon, and error state.
 *
 * Features:
 * - Floating label above the field in muted text
 * - Leading icon support (e.g. search icon)
 * - Red border + error message when `error` prop is provided
 * - Accent-colored focus ring
 *
 * @example
 * <Input
 *   label="Ticker"
 *   placeholder="e.g. AAPL"
 *   value={ticker}
 *   onChange={(e) => setTicker(e.target.value)}
 *   error={errors.ticker}
 * />
 */
const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  required,
  ...rest
}) => {
  // Generate a stable id for label-input association when none provided
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-text-secondary text-sm font-medium"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper – positions the optional icon */}
      <div className="relative">
        {/* Leading icon */}
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          required={required}
          className={[
            // Base styles
            'w-full rounded-lg bg-base-800 text-text-primary',
            'placeholder:text-text-muted',
            'transition-all duration-200',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50',
            // Border – switches to danger when there's an error
            error ? 'border border-danger' : 'border border-base-600',
            // Padding adjusts when an icon is present
            icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5',
            'text-sm',
          ].join(' ')}
          {...rest}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-danger text-xs mt-0.5">{error}</p>
      )}
    </div>
  );
};

export default Input;

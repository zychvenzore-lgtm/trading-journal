'use client';

import React from 'react';

interface SelectOption {
  /** The value submitted with the form */
  value: string;
  /** The user-visible label */
  label: string;
}

interface SelectProps {
  /** Label text displayed above the select */
  label?: string;
  /** Error message displayed below; triggers red border */
  error?: string;
  /** Array of options to render */
  options: SelectOption[];
  /** Currently selected value */
  value?: string;
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Placeholder text shown as the first disabled option */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Name attribute for form serialisation */
  name?: string;
  /** Additional wrapper class names */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * ChevronDown – A small SVG chevron used as the dropdown arrow indicator.
 */
const ChevronDown: React.FC = () => (
  <svg
    className="h-4 w-4 text-text-muted pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Select – A styled dropdown select matching the project's dark theme.
 *
 * Mirrors the Input component's visual language: same border colours,
 * focus ring, error state, and label positioning.
 *
 * @example
 * <Select
 *   label="Strategy"
 *   options={[
 *     { value: 'Breakout', label: 'Breakout' },
 *     { value: 'Scalp', label: 'Scalp' },
 *   ]}
 *   value={strategy}
 *   onChange={(e) => setStrategy(e.target.value)}
 * />
 */
const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  value,
  onChange,
  placeholder,
  required,
  name,
  className = '',
  disabled = false,
}) => {
  const selectId = label ? label.toLowerCase().replace(/\s+/g, '-') : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className="text-text-secondary text-sm font-medium"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      {/* Select wrapper – positions the custom chevron */}
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={[
            // Base styles
            'w-full rounded-lg bg-base-800 text-text-primary',
            'appearance-none cursor-pointer',
            'transition-all duration-200',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50',
            // Border
            error ? 'border border-danger' : 'border border-base-600',
            // Padding – extra right padding for the chevron
            'pl-4 pr-10 py-2.5 text-sm',
            // Disabled state
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
        >
          {/* Placeholder option */}
          {placeholder && (
            <option value="" disabled className="text-text-muted">
              {placeholder}
            </option>
          )}

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom arrow indicator positioned on the right */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronDown />
        </span>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-danger text-xs mt-0.5">{error}</p>
      )}
    </div>
  );
};

export default Select;

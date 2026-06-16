'use client';

import React from 'react';

/**
 * Button variant types controlling visual style.
 * - primary: Solid accent-colored button for main actions
 * - danger: Red button for destructive actions
 * - ghost: Transparent button that shows bg on hover
 * - outline: Bordered button with accent highlight on hover
 */
type ButtonVariant = 'primary' | 'danger' | 'ghost' | 'outline';

/**
 * Button size types controlling padding and font size.
 */
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Shows a loading spinner and disables the button */
  loading?: boolean;
  /** Makes the button take full width of its container */
  fullWidth?: boolean;
  /** Button contents */
  children: React.ReactNode;
}

/** Tailwind classes mapped to each variant */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-fg hover:bg-accent-dark active:bg-accent-dark/90',
  danger:
    'bg-danger text-danger-fg hover:bg-danger-dark active:bg-danger-dark/90',
  ghost:
    'bg-transparent text-text-secondary hover:bg-base-600 hover:text-text-primary active:bg-base-500',
  outline:
    'bg-transparent border border-base-500 text-text-secondary hover:border-accent hover:text-accent active:bg-accent/10',
};

/** Tailwind classes mapped to each size */
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

/**
 * Animated SVG spinner displayed during loading state.
 */
const Spinner: React.FC = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Button – A reusable, fully-styled button component.
 *
 * Supports four visual variants, three sizes, a loading state with
 * an animated spinner, disabled styling, and full-width mode.
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleSave}>
 *   Save Trade
 * </Button>
 *
 * @example
 * <Button variant="danger" loading>
 *   Deleting…
 * </Button>
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled = false,
  children,
  className = '',
  type = 'button',
  ...rest
}) => {
  /** Merge all classes together */
  const classes = [
    // Base styles shared by every button
    'inline-flex items-center justify-center rounded-lg font-medium',
    'transition-all duration-200 cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-accent/50',
    // Variant-specific styles
    variantClasses[variant],
    // Size-specific styles
    sizeClasses[size],
    // Full-width modifier
    fullWidth ? 'w-full' : '',
    // Disabled / loading state – reduce opacity and prevent interaction
    disabled || loading
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : '',
    // Any additional classes from the consumer
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {loading && <Spinner />}
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;

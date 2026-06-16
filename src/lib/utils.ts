/**
 * ============================================================
 * UTILITY FUNCTIONS
 * Pure helper functions for formatting and display logic.
 * These have no side effects and are safe to use anywhere
 * (server or client, components or analytics).
 * ============================================================
 */

import { format } from 'date-fns';

/**
 * Formats a numeric value as a currency string.
 *
 * @param value    - The numeric amount to format.
 * @param currency - ISO 4217 currency code (default: "USD").
 * @returns A locale-formatted currency string, e.g. "$1,234.56".
 *
 * @example
 * formatCurrency(1234.5)        // "$1,234.50"
 * formatCurrency(-500, 'EUR')   // "-€500.00"
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a numeric value as a percentage string.
 *
 * @param value - The percentage value (e.g. 12.345 for 12.35%).
 * @returns A formatted percentage string, e.g. "12.35%".
 *
 * @example
 * formatPercentage(56.789)  // "56.79%"
 * formatPercentage(0)       // "0.00%"
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Formats a duration in milliseconds into a human-readable string.
 *
 * The output uses the two largest relevant time units:
 * - Under 1 hour:  "45m"
 * - 1–24 hours:    "2h 15m"
 * - 1+ days:       "3d 4h"
 *
 * @param ms - Duration in milliseconds.
 * @returns A human-readable duration string.
 *
 * @example
 * formatDuration(7200000)   // "2h 0m"
 * formatDuration(93600000)  // "1d 2h"
 */
export function formatDuration(ms: number): string {
  // Handle zero or negative durations gracefully
  if (ms <= 0) return '0m';

  const totalMinutes = Math.floor(ms / 60_000);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const remainingHours = totalHours % 24;
  const remainingMinutes = totalMinutes % 60;

  // If the duration spans days, show days and hours
  if (totalDays > 0) {
    return `${totalDays}d ${remainingHours}h`;
  }

  // If the duration spans hours, show hours and minutes
  if (totalHours > 0) {
    return `${totalHours}h ${remainingMinutes}m`;
  }

  // Otherwise just show minutes
  return `${remainingMinutes}m`;
}

/**
 * Formats an ISO 8601 date string into a short readable date.
 *
 * @param dateString - An ISO 8601 date string (e.g. "2026-06-15T14:30:00Z").
 * @returns A formatted date like "Jun 15, 2026".
 *
 * @example
 * formatDate("2026-06-15T14:30:00Z")  // "Jun 15, 2026"
 */
export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy');
}

/**
 * Formats an ISO 8601 date string into a readable date + time.
 *
 * @param dateString - An ISO 8601 date string (e.g. "2026-06-15T14:30:00Z").
 * @returns A formatted datetime like "Jun 15, 2026 14:30".
 *
 * @example
 * formatDateTime("2026-06-15T14:30:00Z")  // "Jun 15, 2026 14:30"
 */
export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy HH:mm');
}

/**
 * Merges CSS class names, filtering out falsy values.
 * A lightweight alternative to `clsx` / `classnames` libraries.
 *
 * @param classes - An array of class name strings, undefined, or false values.
 * @returns A single space-separated class name string.
 *
 * @example
 * cn('bg-black', isActive && 'text-white', undefined, 'p-4')
 * // "bg-black text-white p-4"  (if isActive is true)
 * // "bg-black p-4"             (if isActive is false)
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert EUR float to cents integer: 34.50 -> 3450 */
export function euroToCents(euro: number): number {
  return Math.round(euro * 100);
}

/** Convert cents integer to EUR float: 3450 -> 34.50 */
export function centsToEuro(cents: number): number {
  return cents / 100;
}

/** Format cents as Italian currency: 3441540 -> "34.415,40 €" */
export function formatCurrency(cents: number): string {
  const euro = centsToEuro(cents);
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(euro);
}

/** Format cents as compact currency: 3441540 -> "34.415 €" */
export function formatCurrencyCompact(cents: number): string {
  const euro = centsToEuro(cents);
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(euro);
}

/** Format a percentage: 67.5 -> "67,5%" */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value) + '%';
}

/** Parse Italian currency string to cents: "1.350,00" -> 135000 */
export function parseItalianCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  return euroToCents(num);
}

/** Format date as Italian: "2025-06-15" -> "15/06/2025" */
export function formatDateIT(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

/** Get current month (1-12) */
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

/** Get current year */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

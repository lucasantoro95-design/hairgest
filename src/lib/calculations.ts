import type { FiscalConfig, FiscalSummary, ProjectionData, MonthlyData } from './types';

/**
 * Calculate fiscal summary for forfettario regime.
 * Reddito imponibile = fatturato * coefficiente_redditivita (67%)
 * Imposta sostitutiva = reddito_imponibile * aliquota (5%)
 * INPS = reddito_imponibile * aliquota_inps (24%)
 */
export function calculateFiscalSummary(
  totalRevenueCents: number,
  totalExpensesCents: number,
  config: FiscalConfig
): FiscalSummary {
  const taxableIncome = Math.round(totalRevenueCents * config.profitability_coefficient / 100);
  const tax = Math.round(taxableIncome * config.tax_rate / 100);
  const inps = Math.round(taxableIncome * config.inps_rate / 100);
  const totalTaxes = tax + inps;
  const netProfit = totalRevenueCents - totalExpensesCents - totalTaxes;
  const nearCap = totalRevenueCents >= config.revenue_cap_cents * 0.8;

  return {
    total_revenue_cents: totalRevenueCents,
    taxable_income_cents: taxableIncome,
    tax_cents: tax,
    inps_cents: inps,
    total_taxes_cents: totalTaxes,
    net_profit_cents: netProfit,
    suggested_reserve_cents: totalTaxes,
    near_cap_warning: nearCap,
  };
}

/**
 * Project year-end figures based on current data.
 */
export function calculateProjections(
  monthlyData: MonthlyData[],
  targetCents: number,
  currentMonth: number
): ProjectionData {
  const monthsWithData = monthlyData.filter(m => m.revenue_cents > 0 || m.expense_cents > 0);
  const activeMonths = monthsWithData.length || 1;

  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue_cents, 0);
  const totalExpenses = monthlyData.reduce((s, m) => s + m.expense_cents, 0);

  const avgMonthlyRevenue = Math.round(totalRevenue / activeMonths);
  const avgMonthlyExpenses = Math.round(totalExpenses / activeMonths);

  const remainingMonths = Math.max(0, 12 - currentMonth);
  const projectedRevenue = totalRevenue + avgMonthlyRevenue * remainingMonths;
  const projectedExpenses = totalExpenses + avgMonthlyExpenses * remainingMonths;
  const projectedProfit = projectedRevenue - projectedExpenses;

  const gap = targetCents - projectedRevenue;
  const monthlyNeeded = remainingMonths > 0 ? Math.round(Math.max(0, targetCents - totalRevenue) / remainingMonths) : 0;
  const completionPercentage = targetCents > 0 ? Math.min(100, Math.round(totalRevenue / targetCents * 100)) : 0;

  return {
    projected_annual_revenue_cents: projectedRevenue,
    projected_annual_expenses_cents: projectedExpenses,
    projected_annual_profit_cents: projectedProfit,
    target_cents: targetCents,
    gap_cents: gap,
    monthly_needed_cents: monthlyNeeded,
    on_track: gap <= 0,
    completion_percentage: completionPercentage,
  };
}

/**
 * Calculate ROI on business purchase
 */
export function calculateROI(profitCents: number, investmentCents: number): number {
  if (investmentCents === 0) return 0;
  return (profitCents / investmentCents) * 100;
}

/**
 * Calculate margin percentage
 */
export function calculateMargin(revenueCents: number, expensesCents: number): number {
  if (revenueCents === 0) return 0;
  return ((revenueCents - expensesCents) / revenueCents) * 100;
}

/**
 * Month-over-month change percentage
 */
export function calculateMoMChange(currentCents: number, previousCents: number): number {
  if (previousCents === 0) return currentCents > 0 ? 100 : 0;
  return ((currentCents - previousCents) / previousCents) * 100;
}

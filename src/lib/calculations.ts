import type { FiscalConfig, FiscalSummary, ProjectionData, MonthlyData } from './types';

/**
 * Calcolo INPS gestione artigiani in regime forfettario, anno 2026.
 * Riferimento: Circolare INPS n. 14/2026.
 *
 * Componenti:
 *  - Contributo FISSO annuo (es. 4.521,36 EUR per artigiani 2026), dovuto a prescindere dal reddito
 *  - Contributo VARIABILE IVS sulla quota di reddito eccedente il minimale (18.808 EUR):
 *      * 24% da minimale a soglia secondo scaglione (56.224 EUR)
 *      * 25% oltre la soglia
 *  - Riduzione 35% opzionale per forfettari (si applica sia al fisso che al variabile)
 *
 * Tutti i parametri sono leggibili da fiscal_config (modificabili dall'utente per anni futuri).
 */
function calculateInps(
  taxableIncomeGrossCents: number,
  config: FiscalConfig
): { fixed: number; variable: number } {
  const minimale = config.inps_minimale_cents;
  const scaglione2 = config.inps_scaglione2_threshold_cents;
  const rate1 = config.inps_rate; // es. 24
  const rate2 = config.inps_rate_2; // es. 25

  // Fisso annuo (sempre dovuto)
  let fixed = config.inps_fixed_annual_cents;

  // Variabile sulla parte di imponibile eccedente il minimale
  let variable = 0;
  if (taxableIncomeGrossCents > minimale) {
    const oltreMinimale = taxableIncomeGrossCents - minimale;
    if (taxableIncomeGrossCents <= scaglione2) {
      // tutto nel primo scaglione
      variable = Math.round((oltreMinimale * rate1) / 100);
    } else {
      // primo scaglione: dal minimale alla soglia2
      const primoScaglione = scaglione2 - minimale;
      const secondoScaglione = taxableIncomeGrossCents - scaglione2;
      variable =
        Math.round((primoScaglione * rate1) / 100) +
        Math.round((secondoScaglione * rate2) / 100);
    }
  }

  // Riduzione 35% se applicata (sia fisso che variabile)
  if (config.inps_reduction_35) {
    fixed = Math.round(fixed * 0.65);
    variable = Math.round(variable * 0.65);
  }

  return { fixed, variable };
}

/**
 * Calculate fiscal summary for forfettario regime con calcolo INPS corretto a scaglioni
 * e deducibilita' dei contributi pagati.
 *
 * Formula imposta sostitutiva (regime forfettario):
 *   imponibile_lordo = fatturato_fiscale × coefficiente_redditivita (67% parrucchieri)
 *   imponibile_netto = imponibile_lordo - contributi_inps_pagati_nell_anno   (principio di cassa)
 *   imposta = imponibile_netto × aliquota (5% primi 5 anni, 15% dopo)
 *
 * @param totalRevenueCents fatturato FISCALE (esclusi PREVENTIVI)
 * @param totalExpensesCents spese totali (per stima utile netto)
 * @param config configurazione fiscale del business
 * @param paidByType pagamenti effettuati nell'anno per categoria (deducibilita' principio di cassa)
 */
export function calculateFiscalSummary(
  totalRevenueCents: number,
  totalExpensesCents: number,
  config: FiscalConfig,
  paidByType: { inps_fisso: number; inps_variabile: number; imposta_sostitutiva: number; altro: number } = {
    inps_fisso: 0,
    inps_variabile: 0,
    imposta_sostitutiva: 0,
    altro: 0,
  }
): FiscalSummary {
  const taxableIncomeGross = Math.round(
    (totalRevenueCents * config.profitability_coefficient) / 100
  );

  // INPS dovuto (fisso + variabile a scaglioni)
  const { fixed: inpsFixedDue, variable: inpsVariableDue } = calculateInps(taxableIncomeGross, config);
  const inpsTotalDue = inpsFixedDue + inpsVariableDue;

  // INPS effettivamente pagato nell'anno (deducibile dall'imponibile)
  const inpsPaid = paidByType.inps_fisso + paidByType.inps_variabile;

  // Imponibile netto = lordo - contributi INPS pagati (mai sotto zero)
  const taxableIncomeNet = Math.max(0, taxableIncomeGross - inpsPaid);

  // Imposta sostitutiva sul netto
  const taxDue = Math.round((taxableIncomeNet * config.tax_rate) / 100);
  const taxPaid = paidByType.imposta_sostitutiva;

  // Saldi (positivo = ancora da pagare)
  const inpsBalance = inpsTotalDue - inpsPaid;
  const taxBalance = taxDue - taxPaid;
  const totalDue = inpsTotalDue + taxDue;
  const totalPaid = inpsPaid + taxPaid;
  const totalBalance = totalDue - totalPaid;

  // Utile netto stimato = fatturato fiscale - spese - tasse dovute
  const netProfit = totalRevenueCents - totalExpensesCents - totalDue;

  const nearCap = totalRevenueCents >= config.revenue_cap_cents * 0.8;

  return {
    total_revenue_cents: totalRevenueCents,
    taxable_income_gross_cents: taxableIncomeGross,
    inps_fixed_due_cents: inpsFixedDue,
    inps_variable_due_cents: inpsVariableDue,
    inps_total_due_cents: inpsTotalDue,
    inps_paid_cents: inpsPaid,
    taxable_income_net_cents: taxableIncomeNet,
    tax_due_cents: taxDue,
    tax_paid_cents: taxPaid,
    inps_balance_cents: inpsBalance,
    tax_balance_cents: taxBalance,
    total_due_cents: totalDue,
    total_paid_cents: totalPaid,
    total_balance_cents: totalBalance,
    net_profit_cents: netProfit,
    near_cap_warning: nearCap,
    reduction_35_applied: !!config.inps_reduction_35,
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

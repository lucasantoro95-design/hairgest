export interface Business {
  id: number;
  name: string;
  owner_name: string;
  address: string;
  phone: string;
  email: string;
  opening_date: string; // YYYY-MM-DD
  purchase_price_cents: number;
  annual_target_cents: number;
  created_at: string;
  updated_at: string;
}

export interface RevenueChannel {
  id: number;
  business_id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface ExpenseCategory {
  id: number;
  business_id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Revenue {
  id: number;
  business_id: number;
  channel_id: number;
  month: number; // 1-12
  year: number;
  amount_cents: number;
  notes: string;
  created_at: string;
  updated_at: string;
  // joined
  channel_name?: string;
  channel_color?: string;
}

export interface Expense {
  id: number;
  business_id: number;
  category_id: number;
  date: string; // YYYY-MM-DD
  amount_cents: number;
  description: string;
  notes: string;
  created_at: string;
  updated_at: string;
  // joined
  category_name?: string;
  category_color?: string;
}

export interface MonthlyTarget {
  id: number;
  business_id: number;
  month: number;
  year: number;
  target_cents: number;
}

export interface FiscalConfig {
  id: number;
  business_id: number;
  regime: string; // 'forfettario'
  profitability_coefficient: number; // 67 = 67%
  tax_rate: number; // 5 = 5% primi 5 anni, 15 = 15% successivi
  inps_rate: number; // aliquota IVS variabile primo scaglione (24% artigiani)
  revenue_cap_cents: number; // 8500000 = 85.000 EUR
  // Nuovi campi v1.0.5+ (Circolare INPS 14/2026)
  inps_fixed_annual_cents: number; // 452136 = 4.521,36 EUR contributo fisso annuo
  inps_minimale_cents: number; // 1880800 = 18.808 EUR
  inps_scaglione2_threshold_cents: number; // 5622400 = 56.224 EUR
  inps_rate_2: number; // 25 = 25% sopra il secondo scaglione
  inps_reduction_35: number; // 0 o 1 — riduzione 35% per forfettari
  updated_at: string;
}

/** Pagamento manuale tracciato dall'utente (tasse e contributi) */
export type TaxPaymentType =
  | 'inps_fisso' // rata trimestrale del contributo fisso
  | 'inps_variabile' // saldo o acconto IVS variabile
  | 'imposta_sostitutiva' // saldo o acconto imposta sostitutiva
  | 'altro';

export interface TaxPayment {
  id: number;
  business_id: number;
  year: number; // anno di riferimento del pagamento
  type: TaxPaymentType;
  amount_cents: number;
  payment_date: string; // YYYY-MM-DD
  notes: string;
  created_at: string;
}

// Computed types
export interface MonthlyData {
  month: number;
  year: number;
  month_label: string;
  revenue_cents: number;
  expense_cents: number;
  profit_cents: number;
  target_cents: number;
}

export interface ChannelBreakdown {
  channel_id: number;
  channel_name: string;
  channel_color: string;
  total_cents: number;
  percentage: number;
}

export interface CategoryBreakdown {
  category_id: number;
  category_name: string;
  category_color: string;
  total_cents: number;
  percentage: number;
}

/** Riepilogo fiscale con calcolo INPS a scaglioni e deducibilita' contributi pagati */
export interface FiscalSummary {
  // Input
  total_revenue_cents: number; // fatturato fiscale (esclude PREVENTIVI)
  taxable_income_gross_cents: number; // fatturato * coeff. (67%)
  // INPS
  inps_fixed_due_cents: number; // contributo fisso annuo (con eventuale riduzione 35%)
  inps_variable_due_cents: number; // IVS variabile sulla quota oltre minimale
  inps_total_due_cents: number; // fisso + variabile
  // INPS pagato (da tax_payments)
  inps_paid_cents: number; // totale contributi pagati nell'anno (deducibili)
  // Imposta sostitutiva (calcolata sull'imponibile netto = lordo - inps pagato)
  taxable_income_net_cents: number; // imponibile dopo deduzione contributi pagati
  tax_due_cents: number; // imposta sostitutiva dovuta totale
  tax_paid_cents: number; // imposta sostitutiva gia' versata
  // Saldi
  inps_balance_cents: number; // dovuto - pagato (se > 0 = ancora da pagare)
  tax_balance_cents: number; // dovuto - pagato
  total_due_cents: number; // tasse + INPS dovuti totali
  total_paid_cents: number; // tasse + INPS pagati totali
  total_balance_cents: number; // saldo complessivo
  // Utile
  net_profit_cents: number; // fatturato - spese - tasse dovute (stima)
  // Avvisi
  near_cap_warning: boolean; // fatturato vicino al limite 85k
  reduction_35_applied: boolean;
}

export interface ProjectionData {
  projected_annual_revenue_cents: number;
  projected_annual_expenses_cents: number;
  projected_annual_profit_cents: number;
  target_cents: number;
  gap_cents: number; // target - projected
  monthly_needed_cents: number; // how much per remaining month
  on_track: boolean;
  completion_percentage: number;
}

export interface KPI {
  label: string;
  value: string;
  sub_label?: string;
  sub_value?: string;
  trend?: 'up' | 'down' | 'neutral';
  trend_value?: string;
  icon?: string;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

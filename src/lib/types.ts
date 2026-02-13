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
  tax_rate: number; // 5 = 5%
  inps_rate: number; // 24 = 24%
  revenue_cap_cents: number; // 8500000 = 85.000 EUR
  updated_at: string;
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

export interface FiscalSummary {
  total_revenue_cents: number;
  taxable_income_cents: number; // revenue * 67%
  tax_cents: number; // taxable * 5%
  inps_cents: number; // taxable * 24%
  total_taxes_cents: number; // tax + inps
  net_profit_cents: number; // revenue - expenses - total_taxes
  suggested_reserve_cents: number; // total_taxes (to set aside)
  near_cap_warning: boolean;
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

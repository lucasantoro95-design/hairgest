export const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
] as const;

export const MONTHS_SHORT_IT = [
  'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
  'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic',
] as const;

export const CURRENT_YEAR = 2025;

export const DEFAULT_CHANNELS = [
  { name: 'NEGOZIO', color: '#3B82F6' },
  { name: 'PRIVATO', color: '#10B981' },
] as const;

export const DEFAULT_CATEGORIES = [
  { name: 'Affitto', color: '#EF4444' },
  { name: 'Prodotti', color: '#F59E0B' },
  { name: 'Utenze', color: '#8B5CF6' },
  { name: 'Commercialista', color: '#06B6D4' },
  { name: 'Assicurazione', color: '#EC4899' },
  { name: 'Attrezzatura', color: '#14B8A6' },
  { name: 'Marketing', color: '#F97316' },
  { name: 'Formazione', color: '#6366F1' },
  { name: 'Manutenzione', color: '#84CC16' },
  { name: 'Altro', color: '#6B7280' },
] as const;

// Forfettario regime constants
export const FORFETTARIO = {
  PROFITABILITY_COEFFICIENT: 67, // 67%
  TAX_RATE_NEW: 5, // 5% first 5 years
  TAX_RATE_STANDARD: 15, // 15% after
  INPS_RATE: 24, // 24.48% simplified to 24%
  REVENUE_CAP_CENTS: 8500000, // 85.000 EUR
} as const;

export const APP_NAME = 'HairGest';
export const DB_NAME = 'sqlite:hairgest.db';

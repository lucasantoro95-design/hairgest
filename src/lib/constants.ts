export const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
] as const;

export const MONTHS_SHORT_IT = [
  'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
  'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic',
] as const;

export const CURRENT_YEAR = new Date().getFullYear();

/** Canale "PREVENTIVI" (ex "PRIVATO"): tracciato in Incassi ma escluso dal calcolo fiscale */
export const PREVENTIVI_CHANNEL = 'PREVENTIVI';

/** Canali esclusi dal calcolo fiscale (fatturato fiscale = incassi totali - questi canali) */
export const FISCAL_EXCLUDED_CHANNELS: readonly string[] = [PREVENTIVI_CHANNEL];

export const DEFAULT_CHANNELS = [
  { name: 'NEGOZIO', color: '#3B82F6' },
  { name: PREVENTIVI_CHANNEL, color: '#10B981' },
] as const;

export const DEFAULT_CATEGORIES = [
  { name: 'Affitto', color: '#EF4444' },
  { name: 'Stipendio', color: '#A855F7' },
  { name: 'Finanziamenti', color: '#0EA5E9' },
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
  PROFITABILITY_COEFFICIENT: 67, // 67% — codice ATECO parrucchieri
  TAX_RATE_NEW: 5, // 5% primi 5 anni
  TAX_RATE_STANDARD: 15, // 15% successivi
  REVENUE_CAP_CENTS: 8500000, // 85.000 EUR
} as const;

// Circolare INPS n. 14/2026 — Gestione artigiani
// Fonte: https://www.tutelaprevidenziale.it/artigiani-e-commercianti-contributi-inps-2026-aliquote-minimali-scadenze-circolare-n-14-2026/
export const INPS_ARTIGIANI_2026 = {
  /** Contributo IVS+maternita' annuo dovuto a prescindere dal reddito */
  FIXED_ANNUAL_CENTS: 452136, // 4.521,36 EUR
  /** Reddito coperto dal contributo fisso */
  MINIMALE_CENTS: 1880800, // 18.808 EUR
  /** Soglia oltre la quale l'aliquota IVS variabile sale al 25% */
  SCAGLIONE2_THRESHOLD_CENTS: 5622400, // 56.224 EUR
  /** Aliquota IVS variabile primo scaglione (18.808 - 56.224) */
  RATE_1: 24, // %
  /** Aliquota IVS variabile secondo scaglione (oltre 56.224) */
  RATE_2: 25, // %
  /** Riduzione facoltativa per forfettari (richiesta entro 28 febbraio) */
  REDUCTION_PERCENT: 35, // %
} as const;

/** Scadenze 2026 contributo fisso INPS (4 rate trimestrali da 1.130,34 EUR) */
export const INPS_FISSO_DEADLINES_2026: { date: string; label: string }[] = [
  { date: '2026-05-18', label: '1ª rata - 18 maggio 2026' },
  { date: '2026-08-20', label: '2ª rata - 20 agosto 2026' },
  { date: '2026-11-16', label: '3ª rata - 16 novembre 2026' },
  { date: '2027-02-16', label: '4ª rata - 16 febbraio 2027' },
];

export const APP_NAME = 'HairGest';
export const DB_NAME = 'sqlite:hairgest.db';

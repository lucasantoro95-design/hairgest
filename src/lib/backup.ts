import { save, open } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile, exists } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';
import * as XLSX from 'xlsx';
import { getDb } from './database';
import { MONTHS_IT } from './constants';
import { centsToEuro } from './utils';

/** Get the full path to the hairgest.db file */
async function getDbPath(): Promise<string> {
  const dataDir = await appDataDir();
  return `${dataDir}hairgest.db`;
}

/** Format euro value for Excel: 1350.00 (number, not string) */
function euroValue(cents: number): number {
  return centsToEuro(cents);
}

/**
 * Export a backup of the database to a user-chosen location.
 * Returns true if backup was saved, false if user cancelled.
 */
export async function exportBackup(): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const defaultName = `HairGest_backup_${today}.db`;

  const dest = await save({
    title: 'Salva Backup Database',
    defaultPath: defaultName,
    filters: [{ name: 'Database SQLite', extensions: ['db'] }],
  });

  if (!dest) return false;

  const dbPath = await getDbPath();
  const dbExists = await exists(dbPath);
  if (!dbExists) {
    throw new Error('Database non trovato. Assicurati che l\'app sia stata avviata almeno una volta.');
  }

  const data = await readFile(dbPath);
  await writeFile(dest, data);

  return true;
}

/**
 * Import a backup database, replacing the current one.
 * The app will reload after import.
 * Returns true if import started, false if user cancelled.
 */
export async function importBackup(): Promise<boolean> {
  const source = await open({
    title: 'Seleziona Backup da Ripristinare',
    filters: [{ name: 'Database SQLite', extensions: ['db'] }],
    multiple: false,
    directory: false,
  });

  if (!source) return false;

  // Read the backup file
  const backupData = await readFile(source as string);

  // Basic validation: SQLite files start with "SQLite format 3\0"
  const header = new TextDecoder().decode(backupData.slice(0, 16));
  if (!header.startsWith('SQLite format 3')) {
    throw new Error('Il file selezionato non e\' un database SQLite valido.');
  }

  // Close the current DB connection
  const db = await getDb();
  await db.close();

  // Overwrite the database file
  const dbPath = await getDbPath();
  await writeFile(dbPath, backupData);

  // Reload the app
  window.location.reload();

  return true;
}

interface RevenueRow {
  month: number;
  channel_name: string;
  amount_cents: number;
  notes: string;
}

interface ExpenseRow {
  date: string;
  category_name: string;
  amount_cents: number;
  description: string;
  notes: string;
}

interface MonthlyRevenue {
  month: number;
  total_cents: number;
}

interface MonthlyExpense {
  month: number;
  total_cents: number;
}

interface FiscalRow {
  profitability_coefficient: number;
  tax_rate: number;
  inps_rate: number;
}

interface TargetRow {
  month: number;
  target_cents: number;
}

/**
 * Export all data for a given year as an Excel file.
 * Creates 4 sheets: Incassi, Spese, Riepilogo Mensile, Fiscale.
 * Returns true if file was saved, false if user cancelled.
 */
export async function exportExcel(year: number, businessId: number = 1): Promise<boolean> {
  const db = await getDb();

  // Fetch all data
  const revenues = await db.select<RevenueRow[]>(
    `SELECT r.month, rc.name AS channel_name, r.amount_cents, r.notes
     FROM revenues r
     JOIN revenue_channels rc ON r.channel_id = rc.id
     WHERE r.business_id = ? AND r.year = ?
     ORDER BY r.month ASC, rc.name ASC`,
    [businessId, year]
  );

  const expenses = await db.select<ExpenseRow[]>(
    `SELECT e.date, ec.name AS category_name, e.amount_cents, e.description, e.notes
     FROM expenses e
     JOIN expense_categories ec ON e.category_id = ec.id
     WHERE e.business_id = ? AND e.date >= ? AND e.date <= ?
     ORDER BY e.date ASC`,
    [businessId, `${year}-01-01`, `${year}-12-31`]
  );

  const monthlyRevenues = await db.select<MonthlyRevenue[]>(
    `SELECT month, SUM(amount_cents) AS total_cents
     FROM revenues
     WHERE business_id = ? AND year = ?
     GROUP BY month ORDER BY month`,
    [businessId, year]
  );

  const monthlyExpenses = await db.select<MonthlyExpense[]>(
    `SELECT CAST(SUBSTR(date, 6, 2) AS INTEGER) AS month, SUM(amount_cents) AS total_cents
     FROM expenses
     WHERE business_id = ? AND date >= ? AND date <= ?
     GROUP BY month ORDER BY month`,
    [businessId, `${year}-01-01`, `${year}-12-31`]
  );

  const fiscalRows = await db.select<FiscalRow[]>(
    `SELECT profitability_coefficient, tax_rate, inps_rate FROM fiscal_config WHERE business_id = ?`,
    [businessId]
  );

  const targets = await db.select<TargetRow[]>(
    `SELECT month, target_cents FROM monthly_targets WHERE business_id = ? AND year = ?`,
    [businessId, year]
  );

  const fiscal = fiscalRows[0] ?? { profitability_coefficient: 67, tax_rate: 5, inps_rate: 24 };

  // Build revenue map and expense map by month
  const revMap = new Map<number, number>();
  for (const r of monthlyRevenues) revMap.set(r.month, r.total_cents);

  const expMap = new Map<number, number>();
  for (const e of monthlyExpenses) expMap.set(e.month, e.total_cents);

  const targetMap = new Map<number, number>();
  for (const t of targets) targetMap.set(t.month, t.target_cents);

  // --- Sheet 1: Incassi ---
  const incassiData = revenues.map(r => ({
    'Mese': MONTHS_IT[r.month - 1],
    'Canale': r.channel_name,
    'Importo (EUR)': euroValue(r.amount_cents),
    'Note': r.notes,
  }));

  // --- Sheet 2: Spese ---
  const speseData = expenses.map(e => ({
    'Data': e.date,
    'Categoria': e.category_name,
    'Importo (EUR)': euroValue(e.amount_cents),
    'Descrizione': e.description,
    'Note': e.notes,
  }));

  // --- Sheet 3: Riepilogo Mensile ---
  const riepilogoData: { 'Mese': string; 'Incassi (EUR)': number; 'Spese (EUR)': number; 'Profitto (EUR)': number; 'Obiettivo (EUR)': number }[] = MONTHS_IT.map((name, i) => {
    const m = i + 1;
    const rev = revMap.get(m) ?? 0;
    const exp = expMap.get(m) ?? 0;
    const target = targetMap.get(m) ?? 0;
    return {
      'Mese': name,
      'Incassi (EUR)': euroValue(rev),
      'Spese (EUR)': euroValue(exp),
      'Profitto (EUR)': euroValue(rev - exp),
      'Obiettivo (EUR)': euroValue(target),
    };
  });

  // Totals row
  const totalRev = Array.from(revMap.values()).reduce((a, b) => a + b, 0);
  const totalExp = Array.from(expMap.values()).reduce((a, b) => a + b, 0);
  const totalTarget = Array.from(targetMap.values()).reduce((a, b) => a + b, 0);
  riepilogoData.push({
    'Mese': 'TOTALE',
    'Incassi (EUR)': euroValue(totalRev),
    'Spese (EUR)': euroValue(totalExp),
    'Profitto (EUR)': euroValue(totalRev - totalExp),
    'Obiettivo (EUR)': euroValue(totalTarget),
  });

  // --- Sheet 4: Fiscale ---
  const taxableIncome = Math.round(totalRev * fiscal.profitability_coefficient / 100);
  const tax = Math.round(taxableIncome * fiscal.tax_rate / 100);
  const inps = Math.round(taxableIncome * fiscal.inps_rate / 100);
  const net = totalRev - totalExp - tax - inps;

  const fiscaleData = [
    { 'Voce': 'Fatturato Annuo', 'Importo (EUR)': euroValue(totalRev) },
    { 'Voce': `Reddito Imponibile (${fiscal.profitability_coefficient}%)`, 'Importo (EUR)': euroValue(taxableIncome) },
    { 'Voce': `Imposta Sostitutiva (${fiscal.tax_rate}%)`, 'Importo (EUR)': euroValue(tax) },
    { 'Voce': `Contributi INPS (${fiscal.inps_rate}%)`, 'Importo (EUR)': euroValue(inps) },
    { 'Voce': 'Totale Tasse e Contributi', 'Importo (EUR)': euroValue(tax + inps) },
    { 'Voce': 'Spese Totali', 'Importo (EUR)': euroValue(totalExp) },
    { 'Voce': 'Utile Netto Stimato', 'Importo (EUR)': euroValue(net) },
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();

  const wsIncassi = XLSX.utils.json_to_sheet(incassiData.length > 0 ? incassiData : [{ 'Mese': '', 'Canale': '', 'Importo (EUR)': '', 'Note': '' }]);
  const wsSpese = XLSX.utils.json_to_sheet(speseData.length > 0 ? speseData : [{ 'Data': '', 'Categoria': '', 'Importo (EUR)': '', 'Descrizione': '', 'Note': '' }]);
  const wsRiepilogo = XLSX.utils.json_to_sheet(riepilogoData);
  const wsFiscale = XLSX.utils.json_to_sheet(fiscaleData);

  // Set column widths
  wsIncassi['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];
  wsSpese['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 30 }, { wch: 30 }];
  wsRiepilogo['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  wsFiscale['!cols'] = [{ wch: 35 }, { wch: 18 }];

  XLSX.utils.book_append_sheet(wb, wsIncassi, 'Incassi');
  XLSX.utils.book_append_sheet(wb, wsSpese, 'Spese');
  XLSX.utils.book_append_sheet(wb, wsRiepilogo, 'Riepilogo Mensile');
  XLSX.utils.book_append_sheet(wb, wsFiscale, 'Fiscale');

  // Generate the file
  const xlsxData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  // Save dialog
  const dest = await save({
    title: 'Salva Export Excel',
    defaultPath: `HairGest_${year}.xlsx`,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }],
  });

  if (!dest) return false;

  await writeFile(dest, new Uint8Array(xlsxData));

  return true;
}

import Database from '@tauri-apps/plugin-sql';
import {
  DB_NAME,
  DEFAULT_CATEGORIES,
  DEFAULT_CHANNELS,
  FORFETTARIO,
  INPS_ARTIGIANI_2026,
  PREVENTIVI_CHANNEL,
} from './constants';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load(DB_NAME);
    await db.execute('PRAGMA journal_mode=WAL;');
    await db.execute('PRAGMA foreign_keys=ON;');
  }
  return db;
}

/** Reset the module-level db singleton (call after db.close()) */
export function resetDb(): void {
  db = null;
}

export async function initSchema(): Promise<void> {
  const d = await getDb();

  await d.execute(`
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      owner_name TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      opening_date TEXT NOT NULL DEFAULT '',
      purchase_price_cents INTEGER NOT NULL DEFAULT 0,
      annual_target_cents INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await d.execute(`
    CREATE TABLE IF NOT EXISTS revenue_channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#3B82F6',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (business_id) REFERENCES businesses(id)
    );
  `);

  await d.execute(`
    CREATE TABLE IF NOT EXISTS expense_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6B7280',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (business_id) REFERENCES businesses(id)
    );
  `);

  await d.execute(`
    CREATE TABLE IF NOT EXISTS revenues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      channel_id INTEGER NOT NULL,
      month INTEGER NOT NULL CHECK(month >= 1 AND month <= 12),
      year INTEGER NOT NULL,
      amount_cents INTEGER NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (business_id) REFERENCES businesses(id),
      FOREIGN KEY (channel_id) REFERENCES revenue_channels(id)
    );
  `);

  await d.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      amount_cents INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (business_id) REFERENCES businesses(id),
      FOREIGN KEY (category_id) REFERENCES expense_categories(id)
    );
  `);

  await d.execute(`
    CREATE TABLE IF NOT EXISTS monthly_targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      month INTEGER NOT NULL CHECK(month >= 1 AND month <= 12),
      year INTEGER NOT NULL,
      target_cents INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (business_id) REFERENCES businesses(id),
      UNIQUE(business_id, month, year)
    );
  `);

  await d.execute(`
    CREATE TABLE IF NOT EXISTS fiscal_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL UNIQUE,
      regime TEXT NOT NULL DEFAULT 'forfettario',
      profitability_coefficient INTEGER NOT NULL DEFAULT 67,
      tax_rate INTEGER NOT NULL DEFAULT 5,
      inps_rate INTEGER NOT NULL DEFAULT 24,
      revenue_cap_cents INTEGER NOT NULL DEFAULT 8500000,
      inps_fixed_annual_cents INTEGER NOT NULL DEFAULT 452136,
      inps_minimale_cents INTEGER NOT NULL DEFAULT 1880800,
      inps_scaglione2_threshold_cents INTEGER NOT NULL DEFAULT 5622400,
      inps_rate_2 INTEGER NOT NULL DEFAULT 25,
      inps_reduction_35 INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (business_id) REFERENCES businesses(id)
    );
  `);

  // Tabella tracciamento manuale pagamenti tasse e contributi
  await d.execute(`
    CREATE TABLE IF NOT EXISTS tax_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('inps_fisso','inps_variabile','imposta_sostitutiva','altro')),
      amount_cents INTEGER NOT NULL DEFAULT 0,
      payment_date TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (business_id) REFERENCES businesses(id)
    );
  `);

  // Indexes
  await d.execute('CREATE INDEX IF NOT EXISTS idx_revenues_business_year ON revenues(business_id, year);');
  await d.execute('CREATE INDEX IF NOT EXISTS idx_revenues_channel ON revenues(channel_id);');
  await d.execute('CREATE INDEX IF NOT EXISTS idx_expenses_business_date ON expenses(business_id, date);');
  await d.execute('CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);');
  await d.execute('CREATE INDEX IF NOT EXISTS idx_monthly_targets_lookup ON monthly_targets(business_id, year);');
  await d.execute('CREATE INDEX IF NOT EXISTS idx_tax_payments_business_year ON tax_payments(business_id, year);');
}

export async function isDbSeeded(): Promise<boolean> {
  const d = await getDb();
  const result = await d.select<{ count: number }[]>('SELECT COUNT(*) as count FROM businesses;');
  return result[0].count > 0;
}

/** Verifica se una colonna esiste in una tabella (per migrazioni idempotenti) */
async function columnExists(d: Database, table: string, column: string): Promise<boolean> {
  const rows = await d.select<{ name: string }[]>(`PRAGMA table_info(${table})`);
  return rows.some((r) => r.name === column);
}

/**
 * Apply idempotent migrations / repairs for existing DBs so newer releases
 * don't leave old users missing default data (new categories, fiscal_config, channels, etc.).
 *
 * IMPORTANTE: tutte le operazioni qui devono essere idempotenti e PRESERVARE i dati esistenti.
 * Questa funzione viene eseguita ogni volta che un DB esistente viene aperto da una nuova versione dell'app.
 */
export async function runMigrations(): Promise<void> {
  const d = await getDb();

  const businesses = await d.select<{ id: number }[]>('SELECT id FROM businesses ORDER BY id ASC');
  if (businesses.length === 0) return;

  // === MIGRAZIONE v1.0.5 ===
  // 1. Aggiungere nuove colonne a fiscal_config se mancanti (default INPS Artigiani 2026)
  const fiscalNewColumns: { name: string; sql: string }[] = [
    { name: 'inps_fixed_annual_cents', sql: `ALTER TABLE fiscal_config ADD COLUMN inps_fixed_annual_cents INTEGER NOT NULL DEFAULT ${INPS_ARTIGIANI_2026.FIXED_ANNUAL_CENTS}` },
    { name: 'inps_minimale_cents', sql: `ALTER TABLE fiscal_config ADD COLUMN inps_minimale_cents INTEGER NOT NULL DEFAULT ${INPS_ARTIGIANI_2026.MINIMALE_CENTS}` },
    { name: 'inps_scaglione2_threshold_cents', sql: `ALTER TABLE fiscal_config ADD COLUMN inps_scaglione2_threshold_cents INTEGER NOT NULL DEFAULT ${INPS_ARTIGIANI_2026.SCAGLIONE2_THRESHOLD_CENTS}` },
    { name: 'inps_rate_2', sql: `ALTER TABLE fiscal_config ADD COLUMN inps_rate_2 INTEGER NOT NULL DEFAULT ${INPS_ARTIGIANI_2026.RATE_2}` },
    { name: 'inps_reduction_35', sql: `ALTER TABLE fiscal_config ADD COLUMN inps_reduction_35 INTEGER NOT NULL DEFAULT 0` },
  ];

  for (const col of fiscalNewColumns) {
    const exists = await columnExists(d, 'fiscal_config', col.name);
    if (!exists) {
      await d.execute(col.sql);
    }
  }

  // 2. Rinominare canale "PRIVATO" → "PREVENTIVI" (preserva tutti i record revenues collegati via channel_id)
  for (const b of businesses) {
    // Solo se esiste ancora un canale "PRIVATO" e NON esiste gia' "PREVENTIVI" per questo business
    const privato = await d.select<{ id: number }[]>(
      'SELECT id FROM revenue_channels WHERE business_id = ? AND name = ? LIMIT 1',
      [b.id, 'PRIVATO']
    );
    const preventivi = await d.select<{ id: number }[]>(
      'SELECT id FROM revenue_channels WHERE business_id = ? AND name = ? LIMIT 1',
      [b.id, PREVENTIVI_CHANNEL]
    );

    if (privato.length > 0 && preventivi.length === 0) {
      // Caso normale: rinomina il canale (mantiene id, quindi tutti i revenues restano collegati)
      await d.execute(
        'UPDATE revenue_channels SET name = ? WHERE id = ?',
        [PREVENTIVI_CHANNEL, privato[0].id]
      );
    } else if (privato.length > 0 && preventivi.length > 0) {
      // Edge case: esistono entrambi (improbabile). Sposta i revenues di PRIVATO su PREVENTIVI e poi elimina PRIVATO.
      await d.execute(
        'UPDATE revenues SET channel_id = ? WHERE channel_id = ?',
        [preventivi[0].id, privato[0].id]
      );
      await d.execute('DELETE FROM revenue_channels WHERE id = ?', [privato[0].id]);
    }
    // Se non esiste PRIVATO: niente da fare (DB nuovo o gia' migrato)
  }

  // === DEFAULT DATA REPAIR (esistente, mantenuto) ===
  for (const b of businesses) {
    // Ensure default channels (NEGOZIO, PREVENTIVI)
    for (const ch of DEFAULT_CHANNELS) {
      const existing = await d.select<{ id: number }[]>(
        'SELECT id FROM revenue_channels WHERE business_id = ? AND name = ? LIMIT 1',
        [b.id, ch.name]
      );
      if (existing.length === 0) {
        await d.execute(
          'INSERT INTO revenue_channels (business_id, name, color) VALUES (?, ?, ?)',
          [b.id, ch.name, ch.color]
        );
      }
    }

    // Ensure default categories
    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await d.select<{ id: number }[]>(
        'SELECT id FROM expense_categories WHERE business_id = ? AND name = ? LIMIT 1',
        [b.id, cat.name]
      );
      if (existing.length === 0) {
        await d.execute(
          'INSERT INTO expense_categories (business_id, name, color) VALUES (?, ?, ?)',
          [b.id, cat.name, cat.color]
        );
      }
    }

    // Ensure fiscal_config exists con tutti i default INPS 2026
    const fc = await d.select<{ id: number }[]>(
      'SELECT id FROM fiscal_config WHERE business_id = ? LIMIT 1',
      [b.id]
    );
    if (fc.length === 0) {
      await d.execute(
        `INSERT INTO fiscal_config (
          business_id, regime, profitability_coefficient, tax_rate, inps_rate, revenue_cap_cents,
          inps_fixed_annual_cents, inps_minimale_cents, inps_scaglione2_threshold_cents, inps_rate_2, inps_reduction_35
        ) VALUES (?, 'forfettario', ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          b.id,
          FORFETTARIO.PROFITABILITY_COEFFICIENT,
          FORFETTARIO.TAX_RATE_NEW,
          INPS_ARTIGIANI_2026.RATE_1,
          FORFETTARIO.REVENUE_CAP_CENTS,
          INPS_ARTIGIANI_2026.FIXED_ANNUAL_CENTS,
          INPS_ARTIGIANI_2026.MINIMALE_CENTS,
          INPS_ARTIGIANI_2026.SCAGLIONE2_THRESHOLD_CENTS,
          INPS_ARTIGIANI_2026.RATE_2,
        ]
      );
    }
  }
}

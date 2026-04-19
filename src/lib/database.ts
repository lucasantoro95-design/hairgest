import Database from '@tauri-apps/plugin-sql';
import { DB_NAME, DEFAULT_CATEGORIES, DEFAULT_CHANNELS, FORFETTARIO } from './constants';

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
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (business_id) REFERENCES businesses(id)
    );
  `);

  // Indexes
  await d.execute('CREATE INDEX IF NOT EXISTS idx_revenues_business_year ON revenues(business_id, year);');
  await d.execute('CREATE INDEX IF NOT EXISTS idx_revenues_channel ON revenues(channel_id);');
  await d.execute('CREATE INDEX IF NOT EXISTS idx_expenses_business_date ON expenses(business_id, date);');
  await d.execute('CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);');
  await d.execute('CREATE INDEX IF NOT EXISTS idx_monthly_targets_lookup ON monthly_targets(business_id, year);');
}

export async function isDbSeeded(): Promise<boolean> {
  const d = await getDb();
  const result = await d.select<{ count: number }[]>('SELECT COUNT(*) as count FROM businesses;');
  return result[0].count > 0;
}

/**
 * Apply idempotent migrations / repairs for existing DBs so newer releases
 * don't leave old users missing default data (new categories, fiscal_config, channels, etc.).
 */
export async function runMigrations(): Promise<void> {
  const d = await getDb();

  const businesses = await d.select<{ id: number }[]>('SELECT id FROM businesses ORDER BY id ASC');
  if (businesses.length === 0) return;

  for (const b of businesses) {
    // Ensure default channels
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

    // Ensure default categories (adds new ones like Stipendio/Finanziamenti for old DBs)
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

    // Ensure fiscal_config exists
    const fc = await d.select<{ id: number }[]>(
      'SELECT id FROM fiscal_config WHERE business_id = ? LIMIT 1',
      [b.id]
    );
    if (fc.length === 0) {
      await d.execute(
        `INSERT INTO fiscal_config (business_id, regime, profitability_coefficient, tax_rate, inps_rate, revenue_cap_cents)
         VALUES (?, 'forfettario', ?, ?, ?, ?)`,
        [b.id, FORFETTARIO.PROFITABILITY_COEFFICIENT, FORFETTARIO.TAX_RATE_NEW, FORFETTARIO.INPS_RATE, FORFETTARIO.REVENUE_CAP_CENTS]
      );
    }
  }
}

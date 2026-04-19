import { getDb } from './database';
import { DEFAULT_CATEGORIES, DEFAULT_CHANNELS, FORFETTARIO } from './constants';
import { euroToCents } from './utils';

/**
 * Minimal first-run seed: creates the empty structure the app needs to work.
 * NO sample revenues or expenses — the client installs fresh and fills in real data.
 */
export async function seedDatabase(): Promise<void> {
  const db = await getDb();

  // 1. Empty business — user fills it in from Impostazioni > Profilo
  await db.execute(
    `INSERT INTO businesses (name, owner_name, address, phone, email, opening_date, purchase_price_cents, annual_target_cents)
     VALUES (?, '', '', '', '', '', 0, ?)`,
    ['La mia attività', euroToCents(0)]
  );

  // 2. Default revenue channels
  for (const ch of DEFAULT_CHANNELS) {
    await db.execute(
      `INSERT INTO revenue_channels (business_id, name, color) VALUES (1, ?, ?)`,
      [ch.name, ch.color]
    );
  }

  // 3. Default expense categories (includes Stipendio + Finanziamenti)
  for (const cat of DEFAULT_CATEGORIES) {
    await db.execute(
      `INSERT INTO expense_categories (business_id, name, color) VALUES (1, ?, ?)`,
      [cat.name, cat.color]
    );
  }

  // 4. Empty monthly targets for the current year (so dashboard rows render)
  const currentYear = new Date().getFullYear();
  for (let m = 1; m <= 12; m++) {
    await db.execute(
      `INSERT INTO monthly_targets (business_id, month, year, target_cents) VALUES (1, ?, ?, 0)`,
      [m, currentYear]
    );
  }

  // 5. Default fiscal config (forfettario)
  await db.execute(
    `INSERT INTO fiscal_config (business_id, regime, profitability_coefficient, tax_rate, inps_rate, revenue_cap_cents)
     VALUES (1, 'forfettario', ?, ?, ?, ?)`,
    [
      FORFETTARIO.PROFITABILITY_COEFFICIENT,
      FORFETTARIO.TAX_RATE_NEW,
      FORFETTARIO.INPS_RATE,
      FORFETTARIO.REVENUE_CAP_CENTS,
    ]
  );
}

import { getDb } from './database';
import { euroToCents } from './utils';

export async function seedDatabase(): Promise<void> {
  const db = await getDb();

  // 1. Business
  await db.execute(
    `INSERT INTO businesses (name, owner_name, address, phone, email, opening_date, purchase_price_cents, annual_target_cents)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Glam Hair Boutique', 'Mattia', '', '', '', '2025-06-01', euroToCents(36000), euroToCents(60000)]
  );

  // 2. Revenue channels
  await db.execute(
    `INSERT INTO revenue_channels (business_id, name, color) VALUES (1, 'NEGOZIO', '#3B82F6')`,
  );
  await db.execute(
    `INSERT INTO revenue_channels (business_id, name, color) VALUES (1, 'PRIVATO', '#10B981')`,
  );

  // 3. Expense categories
  const categories = [
    ['Affitto', '#EF4444'],
    ['Prodotti', '#F59E0B'],
    ['Utenze', '#8B5CF6'],
    ['Commercialista', '#06B6D4'],
    ['Assicurazione', '#EC4899'],
    ['Attrezzatura', '#14B8A6'],
    ['Marketing', '#F97316'],
    ['Formazione', '#6366F1'],
    ['Manutenzione', '#84CC16'],
    ['Altro', '#6B7280'],
  ];
  for (const [name, color] of categories) {
    await db.execute(
      `INSERT INTO expense_categories (business_id, name, color) VALUES (1, ?, ?)`,
      [name, color]
    );
  }

  // 4. Revenues (Mattia's 2025 data)
  // Channel 1 = NEGOZIO, Channel 2 = PRIVATO
  const revenues: [number, number, number, number][] = [
    // [channel_id, month, year, amount_eur]
    [1, 6, 2025, 3210.00],
    [2, 6, 2025, 430.00],
    [1, 7, 2025, 5765.00],
    [2, 7, 2025, 620.00],
    [1, 8, 2025, 4020.00],
    [2, 8, 2025, 380.40],
    [1, 9, 2025, 5350.00],
    [2, 9, 2025, 710.00],
    [1, 10, 2025, 4890.00],
    [2, 10, 2025, 540.00],
    [1, 11, 2025, 4280.00],
    [2, 11, 2025, 620.00],
    [1, 12, 2025, 3100.00],
    [2, 12, 2025, 500.00],
  ];

  for (const [channelId, month, year, amount] of revenues) {
    await db.execute(
      `INSERT INTO revenues (business_id, channel_id, month, year, amount_cents, notes) VALUES (1, ?, ?, ?, ?, '')`,
      [channelId, month, year, euroToCents(amount)]
    );
  }

  // 5. Expenses (Mattia's 2025 data)
  // Categories: 1=Affitto, 2=Prodotti, 3=Utenze, 4=Commercialista, 5=Assicurazione,
  //             6=Attrezzatura, 7=Marketing, 8=Formazione, 9=Manutenzione, 10=Altro
  const expenses: [number, string, number, string][] = [
    // [category_id, date, amount_eur, description]
    // Affitto - monthly from June
    [1, '2025-06-01', 900.00, 'Affitto giugno'],
    [1, '2025-07-01', 900.00, 'Affitto luglio'],
    [1, '2025-08-01', 900.00, 'Affitto agosto'],
    [1, '2025-09-01', 900.00, 'Affitto settembre'],
    [1, '2025-10-01', 900.00, 'Affitto ottobre'],
    [1, '2025-11-01', 900.00, 'Affitto novembre'],
    [1, '2025-12-01', 900.00, 'Affitto dicembre'],
    // Prodotti
    [2, '2025-06-15', 1250.00, 'Prodotti colore e trattamento'],
    [2, '2025-08-10', 980.00, 'Riassortimento prodotti'],
    [2, '2025-10-20', 1150.00, 'Prodotti autunno'],
    [2, '2025-12-05', 870.00, 'Prodotti inverno'],
    // Utenze
    [3, '2025-06-28', 320.00, 'Luce + acqua giugno'],
    [3, '2025-07-28', 350.16, 'Luce + acqua luglio'],
    [3, '2025-08-28', 380.00, 'Luce + acqua agosto'],
    [3, '2025-09-28', 310.00, 'Luce + acqua settembre'],
    [3, '2025-10-28', 340.00, 'Luce + acqua ottobre'],
    [3, '2025-11-28', 360.00, 'Luce + acqua novembre'],
    [3, '2025-12-28', 330.00, 'Luce + acqua dicembre'],
    // Commercialista
    [4, '2025-06-10', 250.00, 'Apertura P.IVA e consulenza'],
    [4, '2025-09-15', 200.00, 'Consulenza trimestrale'],
    [4, '2025-12-15', 200.00, 'Consulenza fine anno'],
    // Assicurazione
    [5, '2025-06-05', 1200.00, 'Polizza annuale salone'],
    // Attrezzatura
    [6, '2025-06-20', 2800.00, 'Poltrone e lavatesta'],
    [6, '2025-09-10', 450.00, 'Phon professionale'],
    // Marketing
    [7, '2025-07-01', 300.00, 'Volantini inaugurazione'],
    [7, '2025-09-01', 200.00, 'Social media ads'],
    [7, '2025-11-15', 150.00, 'Promozione Natale'],
    // Formazione
    [8, '2025-07-20', 400.00, 'Corso colorazione avanzata'],
    [8, '2025-11-10', 350.00, 'Workshop tendenze 2026'],
    // Manutenzione
    [9, '2025-08-15', 180.00, 'Riparazione condizionatore'],
    [9, '2025-12-10', 250.00, 'Manutenzione impianto idraulico'],
    // Altro
    [10, '2025-06-01', 461.00, 'Spese varie apertura'],
    [10, '2025-07-15', 200.00, 'Cancelleria e materiali'],
    [10, '2025-10-05', 100.00, 'Spese varie'],
    [10, '2025-11-20', 150.00, 'Decorazioni salone'],
    [10, '2025-12-20', 100.00, 'Spese varie fine anno'],
  ];

  for (const [categoryId, date, amount, description] of expenses) {
    await db.execute(
      `INSERT INTO expenses (business_id, category_id, date, amount_cents, description, notes) VALUES (1, ?, ?, ?, ?, '')`,
      [categoryId, date, euroToCents(amount), description]
    );
  }

  // 6. Monthly targets (5000/month = 60000/year)
  for (let m = 1; m <= 12; m++) {
    await db.execute(
      `INSERT INTO monthly_targets (business_id, month, year, target_cents) VALUES (1, ?, 2025, ?)`,
      [m, euroToCents(5000)]
    );
  }

  // 7. Fiscal config
  await db.execute(
    `INSERT INTO fiscal_config (business_id, regime, profitability_coefficient, tax_rate, inps_rate, revenue_cap_cents)
     VALUES (1, 'forfettario', 67, 5, 24, ?)`,
    [euroToCents(85000)]
  );
}

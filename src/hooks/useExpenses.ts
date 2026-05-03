import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Expense, ExpenseCategory, CategoryBreakdown } from '@/lib/types';
import { MONTHS_IT, OPERATING_EXCLUDED_EXPENSE_CATEGORIES } from '@/lib/constants';
import { useDatabase } from './useDatabase';

interface ExpenseInput {
  category_id: number;
  date: string;
  amount_cents: number;
  description?: string;
  notes?: string;
}

interface UseExpensesReturn {
  expenses: Expense[];
  categories: ExpenseCategory[];
  loading: boolean;
  addExpense: (data: ExpenseInput) => Promise<void>;
  updateExpense: (id: number, data: ExpenseInput) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  /** Totale di TUTTE le spese inserite (include affitto, finanziamenti, ecc.) */
  totalExpensesCents: number;
  /** Spese operative: totale - categorie escluse (Affitto, Finanziamenti). Usato in Fiscale > Riepilogo. */
  operatingExpensesCents: number;
  /** Totale spese delle categorie escluse (Affitto + Finanziamenti) */
  excludedExpensesCents: number;
  expensesByCategory: CategoryBreakdown[];
  expensesByMonth: { month: number; month_label: string; total_cents: number }[];
}

export function useExpenses(businessId: number, year: number): UseExpensesReturn {
  const { db } = useDatabase();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!db) return;
    try {
      setLoading(true);
      const rows = await db.select<Expense[]>(
        `SELECT e.*, ec.name AS category_name, ec.color AS category_color
         FROM expenses e
         JOIN expense_categories ec ON e.category_id = ec.id
         WHERE e.business_id = ?
           AND e.date >= ? AND e.date <= ?
         ORDER BY e.date DESC, ec.name ASC`,
        [businessId, `${year}-01-01`, `${year}-12-31`]
      );
      setExpenses(rows);

      const cats = await db.select<ExpenseCategory[]>(
        `SELECT * FROM expense_categories WHERE business_id = ? ORDER BY id ASC`,
        [businessId]
      );
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }, [db, businessId, year]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = useCallback(async (data: ExpenseInput) => {
    if (!db) return;
    await db.execute(
      `INSERT INTO expenses (business_id, category_id, date, amount_cents, description, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [businessId, data.category_id, data.date, data.amount_cents, data.description ?? '', data.notes ?? '']
    );
    await fetchExpenses();
  }, [db, businessId, fetchExpenses]);

  const updateExpense = useCallback(async (id: number, data: ExpenseInput) => {
    if (!db) return;
    await db.execute(
      `UPDATE expenses
       SET category_id = ?, date = ?, amount_cents = ?, description = ?, notes = ?, updated_at = datetime('now')
       WHERE id = ? AND business_id = ?`,
      [data.category_id, data.date, data.amount_cents, data.description ?? '', data.notes ?? '', id, businessId]
    );
    await fetchExpenses();
  }, [db, businessId, fetchExpenses]);

  const deleteExpense = useCallback(async (id: number) => {
    if (!db) return;
    await db.execute(
      `DELETE FROM expenses WHERE id = ? AND business_id = ?`,
      [id, businessId]
    );
    await fetchExpenses();
  }, [db, businessId, fetchExpenses]);

  const totalExpensesCents = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount_cents, 0);
  }, [expenses]);

  const excludedExpensesCents = useMemo(() => {
    return expenses
      .filter((e) => e.category_name && OPERATING_EXCLUDED_EXPENSE_CATEGORIES.includes(e.category_name))
      .reduce((sum, e) => sum + e.amount_cents, 0);
  }, [expenses]);

  const operatingExpensesCents = useMemo(
    () => totalExpensesCents - excludedExpensesCents,
    [totalExpensesCents, excludedExpensesCents]
  );

  const expensesByCategory = useMemo((): CategoryBreakdown[] => {
    const map = new Map<number, CategoryBreakdown>();
    for (const e of expenses) {
      const existing = map.get(e.category_id);
      if (existing) {
        existing.total_cents += e.amount_cents;
      } else {
        map.set(e.category_id, {
          category_id: e.category_id,
          category_name: e.category_name ?? '',
          category_color: e.category_color ?? '#6B7280',
          total_cents: e.amount_cents,
          percentage: 0,
        });
      }
    }
    const breakdowns = Array.from(map.values());
    for (const b of breakdowns) {
      b.percentage = totalExpensesCents > 0
        ? Math.round((b.total_cents / totalExpensesCents) * 10000) / 100
        : 0;
    }
    return breakdowns;
  }, [expenses, totalExpensesCents]);

  const expensesByMonth = useMemo(() => {
    const monthMap = new Map<number, number>();
    for (const e of expenses) {
      const month = parseInt(e.date.split('-')[1], 10);
      monthMap.set(month, (monthMap.get(month) ?? 0) + e.amount_cents);
    }
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      month_label: MONTHS_IT[i],
      total_cents: monthMap.get(i + 1) ?? 0,
    }));
  }, [expenses]);

  return {
    expenses,
    categories,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    totalExpensesCents,
    operatingExpensesCents,
    excludedExpensesCents,
    expensesByCategory,
    expensesByMonth,
  };
}

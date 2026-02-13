import { useState, useEffect, useCallback } from 'react';
import type { MonthlyData, MonthlyTarget } from '@/lib/types';
import { MONTHS_IT } from '@/lib/constants';
import { useDatabase } from './useDatabase';

interface UseMonthlyDataReturn {
  monthlyData: MonthlyData[];
  loading: boolean;
}

export function useMonthlyData(businessId: number, year: number): UseMonthlyDataReturn {
  const { db } = useDatabase();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyData = useCallback(async () => {
    if (!db) return;
    try {
      setLoading(true);

      // Fetch revenue aggregated by month
      const revenueRows = await db.select<{ month: number; total_cents: number }[]>(
        `SELECT month, SUM(amount_cents) AS total_cents
         FROM revenues
         WHERE business_id = ? AND year = ?
         GROUP BY month`,
        [businessId, year]
      );

      // Fetch expense aggregated by month (extract month from date)
      const expenseRows = await db.select<{ month: number; total_cents: number }[]>(
        `SELECT CAST(strftime('%m', date) AS INTEGER) AS month, SUM(amount_cents) AS total_cents
         FROM expenses
         WHERE business_id = ?
           AND date >= ? AND date <= ?
         GROUP BY month`,
        [businessId, `${year}-01-01`, `${year}-12-31`]
      );

      // Fetch monthly targets
      const targetRows = await db.select<MonthlyTarget[]>(
        `SELECT * FROM monthly_targets
         WHERE business_id = ? AND year = ?`,
        [businessId, year]
      );

      // Build lookup maps
      const revenueMap = new Map<number, number>();
      for (const row of revenueRows) {
        revenueMap.set(row.month, row.total_cents);
      }

      const expenseMap = new Map<number, number>();
      for (const row of expenseRows) {
        expenseMap.set(row.month, row.total_cents);
      }

      const targetMap = new Map<number, number>();
      for (const row of targetRows) {
        targetMap.set(row.month, row.target_cents);
      }

      // Build the 12-month array
      const data: MonthlyData[] = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const revenueCents = revenueMap.get(month) ?? 0;
        const expenseCents = expenseMap.get(month) ?? 0;
        return {
          month,
          year,
          month_label: MONTHS_IT[i],
          revenue_cents: revenueCents,
          expense_cents: expenseCents,
          profit_cents: revenueCents - expenseCents,
          target_cents: targetMap.get(month) ?? 0,
        };
      });

      setMonthlyData(data);
    } finally {
      setLoading(false);
    }
  }, [db, businessId, year]);

  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  return {
    monthlyData,
    loading,
  };
}

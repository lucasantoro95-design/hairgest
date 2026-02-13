import { useState, useEffect, useCallback } from 'react';
import type { FiscalConfig, FiscalSummary } from '@/lib/types';
import { calculateFiscalSummary } from '@/lib/calculations';
import { useDatabase } from './useDatabase';

interface UseFiscalReturn {
  config: FiscalConfig | null;
  loading: boolean;
  updateConfig: (idOrData: number | Partial<Omit<FiscalConfig, 'id' | 'business_id' | 'updated_at'>>, maybeData?: Record<string, unknown>) => Promise<void>;
  calculateSummary: (totalRevenueCents: number, totalExpensesCents: number) => FiscalSummary | null;
}

export function useFiscal(businessId: number): UseFiscalReturn {
  const { db } = useDatabase();
  const [config, setConfig] = useState<FiscalConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    if (!db) return;
    try {
      setLoading(true);
      const rows = await db.select<FiscalConfig[]>(
        `SELECT * FROM fiscal_config WHERE business_id = ?`,
        [businessId]
      );
      setConfig(rows.length > 0 ? rows[0] : null);
    } finally {
      setLoading(false);
    }
  }, [db, businessId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = useCallback(async (
    idOrData: number | Partial<Omit<FiscalConfig, 'id' | 'business_id' | 'updated_at'>>,
    maybeData?: Record<string, unknown>
  ) => {
    // Support both updateConfig(data) and updateConfig(id, data) signatures
    const data = (typeof idOrData === 'number' ? maybeData : idOrData) as Partial<Omit<FiscalConfig, 'id' | 'business_id' | 'updated_at'>> | undefined;
    if (!data) return;
    if (!db) return;

    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.regime !== undefined) { fields.push('regime = ?'); values.push(data.regime); }
    if (data.profitability_coefficient !== undefined) { fields.push('profitability_coefficient = ?'); values.push(data.profitability_coefficient); }
    if (data.tax_rate !== undefined) { fields.push('tax_rate = ?'); values.push(data.tax_rate); }
    if (data.inps_rate !== undefined) { fields.push('inps_rate = ?'); values.push(data.inps_rate); }
    if (data.revenue_cap_cents !== undefined) { fields.push('revenue_cap_cents = ?'); values.push(data.revenue_cap_cents); }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(businessId);

    await db.execute(
      `UPDATE fiscal_config SET ${fields.join(', ')} WHERE business_id = ?`,
      values
    );
    await fetchConfig();
  }, [db, businessId, fetchConfig]);

  const calculateSummary = useCallback((
    totalRevenueCents: number,
    totalExpensesCents: number
  ): FiscalSummary | null => {
    if (!config) return null;
    return calculateFiscalSummary(totalRevenueCents, totalExpensesCents, config);
  }, [config]);

  return {
    config,
    loading,
    updateConfig,
    calculateSummary,
  };
}

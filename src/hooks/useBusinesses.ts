import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Business } from '@/lib/types';
import { useDatabase } from './useDatabase';

interface UseBusinessesReturn {
  businesses: Business[];
  loading: boolean;
  currentBusiness: Business | null;
  updateBusiness: (id: number, data: Partial<Omit<Business, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
}

export function useBusinesses(): UseBusinessesReturn {
  const { db } = useDatabase();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = useCallback(async () => {
    if (!db) return;
    try {
      setLoading(true);
      const rows = await db.select<Business[]>(
        `SELECT * FROM businesses ORDER BY id ASC`
      );
      setBusinesses(rows);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const currentBusiness = useMemo(() => {
    return businesses.length > 0 ? businesses[0] : null;
  }, [businesses]);

  const updateBusiness = useCallback(async (
    id: number,
    data: Partial<Omit<Business, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!db) return;

    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.owner_name !== undefined) { fields.push('owner_name = ?'); values.push(data.owner_name); }
    if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address); }
    if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.opening_date !== undefined) { fields.push('opening_date = ?'); values.push(data.opening_date); }
    if (data.purchase_price_cents !== undefined) { fields.push('purchase_price_cents = ?'); values.push(data.purchase_price_cents); }
    if (data.annual_target_cents !== undefined) { fields.push('annual_target_cents = ?'); values.push(data.annual_target_cents); }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    await db.execute(
      `UPDATE businesses SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    await fetchBusinesses();
  }, [db, fetchBusinesses]);

  return {
    businesses,
    loading,
    currentBusiness,
    updateBusiness,
  };
}

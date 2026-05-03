import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Revenue, RevenueChannel, ChannelBreakdown } from '@/lib/types';
import { MONTHS_IT, FISCAL_EXCLUDED_CHANNELS } from '@/lib/constants';
import { useDatabase } from './useDatabase';

interface RevenueInput {
  channel_id: number;
  month: number;
  year: number;
  amount_cents: number;
  notes?: string;
}

interface UseRevenuesReturn {
  revenues: Revenue[];
  channels: RevenueChannel[];
  loading: boolean;
  addRevenue: (data: RevenueInput) => Promise<void>;
  updateRevenue: (id: number, data: RevenueInput) => Promise<void>;
  deleteRevenue: (id: number) => Promise<void>;
  /** Totale di tutti gli incassi (NEGOZIO + PREVENTIVI + altri canali). Usato in pagina Incassi/Pie chart. */
  totalRevenueCents: number;
  /** Fatturato fiscale: esclude i canali in FISCAL_EXCLUDED_CHANNELS (PREVENTIVI). Usato per calcoli fiscali. */
  fiscalRevenueCents: number;
  /** Incassi dei soli canali esclusi dal fiscale (PREVENTIVI). */
  preventiviRevenueCents: number;
  revenueByChannel: ChannelBreakdown[];
  revenueByMonth: { month: number; month_label: string; total_cents: number }[];
}

export function useRevenues(businessId: number, year: number): UseRevenuesReturn {
  const { db } = useDatabase();
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [channels, setChannels] = useState<RevenueChannel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevenues = useCallback(async () => {
    if (!db) return;
    try {
      setLoading(true);
      const rows = await db.select<Revenue[]>(
        `SELECT r.*, rc.name AS channel_name, rc.color AS channel_color
         FROM revenues r
         JOIN revenue_channels rc ON r.channel_id = rc.id
         WHERE r.business_id = ? AND r.year = ?
         ORDER BY r.month ASC, rc.name ASC`,
        [businessId, year]
      );
      setRevenues(rows);

      const ch = await db.select<RevenueChannel[]>(
        `SELECT * FROM revenue_channels WHERE business_id = ? ORDER BY id ASC`,
        [businessId]
      );
      setChannels(ch);
    } finally {
      setLoading(false);
    }
  }, [db, businessId, year]);

  useEffect(() => {
    fetchRevenues();
  }, [fetchRevenues]);

  const addRevenue = useCallback(async (data: RevenueInput) => {
    if (!db) return;
    await db.execute(
      `INSERT INTO revenues (business_id, channel_id, month, year, amount_cents, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [businessId, data.channel_id, data.month, data.year, data.amount_cents, data.notes ?? '']
    );
    await fetchRevenues();
  }, [db, businessId, fetchRevenues]);

  const updateRevenue = useCallback(async (id: number, data: RevenueInput) => {
    if (!db) return;
    await db.execute(
      `UPDATE revenues
       SET channel_id = ?, month = ?, year = ?, amount_cents = ?, notes = ?, updated_at = datetime('now')
       WHERE id = ? AND business_id = ?`,
      [data.channel_id, data.month, data.year, data.amount_cents, data.notes ?? '', id, businessId]
    );
    await fetchRevenues();
  }, [db, businessId, fetchRevenues]);

  const deleteRevenue = useCallback(async (id: number) => {
    if (!db) return;
    await db.execute(
      `DELETE FROM revenues WHERE id = ? AND business_id = ?`,
      [id, businessId]
    );
    await fetchRevenues();
  }, [db, businessId, fetchRevenues]);

  const totalRevenueCents = useMemo(() => {
    return revenues.reduce((sum, r) => sum + r.amount_cents, 0);
  }, [revenues]);

  const preventiviRevenueCents = useMemo(() => {
    return revenues
      .filter((r) => r.channel_name && FISCAL_EXCLUDED_CHANNELS.includes(r.channel_name))
      .reduce((sum, r) => sum + r.amount_cents, 0);
  }, [revenues]);

  const fiscalRevenueCents = useMemo(
    () => totalRevenueCents - preventiviRevenueCents,
    [totalRevenueCents, preventiviRevenueCents]
  );

  const revenueByChannel = useMemo((): ChannelBreakdown[] => {
    const map = new Map<number, ChannelBreakdown>();
    for (const r of revenues) {
      const existing = map.get(r.channel_id);
      if (existing) {
        existing.total_cents += r.amount_cents;
      } else {
        map.set(r.channel_id, {
          channel_id: r.channel_id,
          channel_name: r.channel_name ?? '',
          channel_color: r.channel_color ?? '#3B82F6',
          total_cents: r.amount_cents,
          percentage: 0,
        });
      }
    }
    const breakdowns = Array.from(map.values());
    for (const b of breakdowns) {
      b.percentage = totalRevenueCents > 0
        ? Math.round((b.total_cents / totalRevenueCents) * 10000) / 100
        : 0;
    }
    return breakdowns;
  }, [revenues, totalRevenueCents]);

  const revenueByMonth = useMemo(() => {
    const monthMap = new Map<number, number>();
    for (const r of revenues) {
      monthMap.set(r.month, (monthMap.get(r.month) ?? 0) + r.amount_cents);
    }
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      month_label: MONTHS_IT[i],
      total_cents: monthMap.get(i + 1) ?? 0,
    }));
  }, [revenues]);

  return {
    revenues,
    channels,
    loading,
    addRevenue,
    updateRevenue,
    deleteRevenue,
    totalRevenueCents,
    fiscalRevenueCents,
    preventiviRevenueCents,
    revenueByChannel,
    revenueByMonth,
  };
}

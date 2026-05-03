import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TaxPayment, TaxPaymentType } from '@/lib/types';
import { useDatabase } from './useDatabase';

export interface TaxPaymentInput {
  year: number;
  type: TaxPaymentType;
  amount_cents: number;
  payment_date: string; // YYYY-MM-DD
  notes?: string;
}

export interface PaidByType {
  inps_fisso: number;
  inps_variabile: number;
  imposta_sostitutiva: number;
  altro: number;
  total: number;
}

interface UseTaxPaymentsReturn {
  payments: TaxPayment[];
  loading: boolean;
  addPayment: (data: TaxPaymentInput) => Promise<void>;
  updatePayment: (id: number, data: TaxPaymentInput) => Promise<void>;
  deletePayment: (id: number) => Promise<void>;
  paidByType: PaidByType;
}

export function useTaxPayments(businessId: number, year: number): UseTaxPaymentsReturn {
  const { db } = useDatabase();
  const [payments, setPayments] = useState<TaxPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    if (!db) return;
    try {
      setLoading(true);
      const rows = await db.select<TaxPayment[]>(
        `SELECT * FROM tax_payments
         WHERE business_id = ? AND year = ?
         ORDER BY payment_date DESC, id DESC`,
        [businessId, year]
      );
      setPayments(rows);
    } finally {
      setLoading(false);
    }
  }, [db, businessId, year]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const addPayment = useCallback(async (data: TaxPaymentInput) => {
    if (!db) return;
    await db.execute(
      `INSERT INTO tax_payments (business_id, year, type, amount_cents, payment_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [businessId, data.year, data.type, data.amount_cents, data.payment_date, data.notes ?? '']
    );
    await fetchPayments();
  }, [db, businessId, fetchPayments]);

  const updatePayment = useCallback(async (id: number, data: TaxPaymentInput) => {
    if (!db) return;
    await db.execute(
      `UPDATE tax_payments
       SET year = ?, type = ?, amount_cents = ?, payment_date = ?, notes = ?
       WHERE id = ? AND business_id = ?`,
      [data.year, data.type, data.amount_cents, data.payment_date, data.notes ?? '', id, businessId]
    );
    await fetchPayments();
  }, [db, businessId, fetchPayments]);

  const deletePayment = useCallback(async (id: number) => {
    if (!db) return;
    await db.execute(
      `DELETE FROM tax_payments WHERE id = ? AND business_id = ?`,
      [id, businessId]
    );
    await fetchPayments();
  }, [db, businessId, fetchPayments]);

  const paidByType = useMemo<PaidByType>(() => {
    const acc: PaidByType = {
      inps_fisso: 0,
      inps_variabile: 0,
      imposta_sostitutiva: 0,
      altro: 0,
      total: 0,
    };
    for (const p of payments) {
      acc[p.type] += p.amount_cents;
      acc.total += p.amount_cents;
    }
    return acc;
  }, [payments]);

  return {
    payments,
    loading,
    addPayment,
    updatePayment,
    deletePayment,
    paidByType,
  };
}

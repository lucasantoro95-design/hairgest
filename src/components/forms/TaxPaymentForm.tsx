import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import type { TaxPayment, TaxPaymentType } from '@/lib/types';

const PAYMENT_TYPES: { value: TaxPaymentType; label: string }[] = [
  { value: 'inps_fisso', label: 'INPS - Contributo fisso (rata trimestrale)' },
  { value: 'inps_variabile', label: 'INPS - Variabile (saldo/acconto IVS)' },
  { value: 'imposta_sostitutiva', label: 'Imposta sostitutiva (saldo/acconto)' },
  { value: 'altro', label: 'Altro' },
];

interface TaxPaymentFormProps {
  defaultYear: number;
  initialData?: TaxPayment | null;
  onSubmit: (data: { year: number; type: TaxPaymentType; amount_cents: number; payment_date: string; notes: string }) => void;
  onCancel?: () => void;
}

export function TaxPaymentForm({ defaultYear, initialData, onSubmit, onCancel }: TaxPaymentFormProps) {
  const [year, setYear] = useState(initialData?.year ?? defaultYear);
  const [type, setType] = useState<TaxPaymentType>(initialData?.type ?? 'inps_fisso');
  const [amountCents, setAmountCents] = useState(initialData?.amount_cents ?? 0);
  const [paymentDate, setPaymentDate] = useState(initialData?.payment_date ?? new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  const years = Array.from({ length: 5 }, (_, i) => defaultYear - 2 + i);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountCents <= 0) return;
    onSubmit({ year, type, amount_cents: amountCents, payment_date: paymentDate, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo pagamento</Label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TaxPaymentType)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {PAYMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Importo</Label>
          <CurrencyInput value={amountCents} onChange={setAmountCents} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data pagamento</Label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label>Anno di riferimento</Label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Note</Label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Es. F24 numero, rata di riferimento, ecc."
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Annulla</Button>
        )}
        <Button type="submit" disabled={amountCents <= 0}>
          {initialData ? 'Aggiorna' : 'Registra Pagamento'}
        </Button>
      </div>
    </form>
  );
}

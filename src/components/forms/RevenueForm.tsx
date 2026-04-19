import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { MONTHS_IT, CURRENT_YEAR } from '@/lib/constants';
import type { Revenue, RevenueChannel } from '@/lib/types';

interface RevenueFormProps {
  channels: RevenueChannel[];
  initialData?: Revenue | null;
  onSubmit: (data: { channel_id: number; month: number; year: number; amount_cents: number; notes: string }) => void;
  onCancel?: () => void;
}

export function RevenueForm({ channels, initialData, onSubmit, onCancel }: RevenueFormProps) {
  const [channelId, setChannelId] = useState(initialData?.channel_id ?? channels[0]?.id ?? 1);
  const [month, setMonth] = useState(initialData?.month ?? new Date().getMonth() + 1);
  const [year, setYear] = useState(initialData?.year ?? CURRENT_YEAR);
  const [amountCents, setAmountCents] = useState(initialData?.amount_cents ?? 0);
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountCents <= 0) return;
    onSubmit({ channel_id: channelId, month, year, amount_cents: amountCents, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Canale</Label>
          <select
            value={channelId}
            onChange={(e) => setChannelId(Number(e.target.value))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>{ch.name}</option>
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
          <Label>Mese</Label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {MONTHS_IT.map((name, idx) => (
              <option key={idx} value={idx + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Anno</Label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - 2 + i).map((y) => (
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
          placeholder="Note opzionali..."
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Annulla</Button>
        )}
        <Button type="submit" disabled={amountCents <= 0}>
          {initialData ? 'Aggiorna' : 'Aggiungi Incasso'}
        </Button>
      </div>
    </form>
  );
}

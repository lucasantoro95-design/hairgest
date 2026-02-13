import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import type { Expense, ExpenseCategory } from '@/lib/types';

interface ExpenseFormProps {
  categories: ExpenseCategory[];
  initialData?: Expense | null;
  onSubmit: (data: { category_id: number; date: string; amount_cents: number; description: string; notes: string }) => void;
  onCancel?: () => void;
}

export function ExpenseForm({ categories, initialData, onSubmit, onCancel }: ExpenseFormProps) {
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? categories[0]?.id ?? 1);
  const [date, setDate] = useState(initialData?.date ?? new Date().toISOString().split('T')[0]);
  const [amountCents, setAmountCents] = useState(initialData?.amount_cents ?? 0);
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountCents <= 0) return;
    onSubmit({ category_id: categoryId, date, amount_cents: amountCents, description, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoria</Label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
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
          <Label>Data</Label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label>Descrizione</Label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrizione spesa..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
          />
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
          {initialData ? 'Aggiorna' : 'Aggiungi Spesa'}
        </Button>
      </div>
    </form>
  );
}

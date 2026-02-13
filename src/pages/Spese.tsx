import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { KpiCard } from '@/components/shared/KpiCard';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useExpenses } from '@/hooks/useExpenses';
import { useBusinesses } from '@/hooks/useBusinesses';
import { formatCurrency, formatDateIT } from '@/lib/utils';
import { CURRENT_YEAR } from '@/lib/constants';
import type { Expense, ExpenseCategory } from '@/lib/types';

export function Spese() {
  const { currentBusiness } = useBusinesses();
  const businessId = currentBusiness?.id ?? 1;
  const {
    expenses,
    totalExpensesCents,
    expensesByCategory,
    addExpense,
    updateExpense,
    deleteExpense,
    categories,
  } = useExpenses(businessId, CURRENT_YEAR);

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<number | 0>(0);

  const filtered = useMemo(() => {
    if (filterCategory === 0) return expenses;
    return expenses.filter((e) => e.category_id === filterCategory);
  }, [expenses, filterCategory]);

  const topCategories = expensesByCategory.slice(0, 3);

  const columns: Column<Expense>[] = [
    {
      key: 'date',
      header: 'Data',
      render: (e) => formatDateIT(e.date),
      sortable: true,
      sortValue: (e) => e.date,
    },
    {
      key: 'category',
      header: 'Categoria',
      render: (e) => (
        <span className="inline-flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: e.category_color }}
          />
          {e.category_name}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Descrizione',
      render: (e) => e.description,
    },
    {
      key: 'amount',
      header: 'Importo',
      render: (e) => <span className="font-medium">{formatCurrency(e.amount_cents)}</span>,
      sortable: true,
      sortValue: (e) => e.amount_cents,
      className: 'text-right',
    },
    {
      key: 'actions',
      header: '',
      render: (e) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(ev) => { ev.stopPropagation(); setEditItem(e); setShowForm(true); }}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(ev) => { ev.stopPropagation(); setDeleteId(e.id); }}
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        </div>
      ),
      className: 'w-20',
    },
  ];

  const handleSubmit = async (data: { category_id: number; date: string; amount_cents: number; description: string; notes: string }) => {
    if (editItem) {
      await updateExpense(editItem.id, data);
    } else {
      await addExpense(data);
    }
    setShowForm(false);
    setEditItem(null);
  };

  return (
    <div>
      <Header title="Spese" description={`Gestione spese ${CURRENT_YEAR}`}>
        <Button onClick={() => { setEditItem(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nuova Spesa
        </Button>
      </Header>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard title="Totale Spese" value={formatCurrency(totalExpensesCents)} />
        {topCategories.map((cat) => (
          <KpiCard
            key={cat.category_id}
            title={cat.category_name}
            value={formatCurrency(cat.total_cents)}
            subtitle={`${new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(cat.percentage)}% del totale`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Table */}
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value={0}>Tutte le categorie</option>
              {(categories as ExpenseCategory[]).map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <DataTable
            data={filtered}
            columns={columns}
            keyExtractor={(e) => e.id}
            emptyMessage="Nessuna spesa registrata"
          />
        </div>

        {/* Pie chart */}
        <div>
          <CategoryPieChart data={expensesByCategory} />
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Modifica Spesa' : 'Nuova Spesa'}</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            categories={categories as ExpenseCategory[]}
            initialData={editItem}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditItem(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Elimina Spesa"
        description="Sei sicuro di voler eliminare questa spesa? L'azione non puo' essere annullata."
        confirmLabel="Elimina"
        onConfirm={() => { if (deleteId) deleteExpense(deleteId); setDeleteId(null); }}
      />
    </div>
  );
}

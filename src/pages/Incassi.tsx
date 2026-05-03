import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { KpiCard } from '@/components/shared/KpiCard';
import { ChannelPieChart } from '@/components/charts/ChannelPieChart';
import { RevenueForm } from '@/components/forms/RevenueForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRevenues } from '@/hooks/useRevenues';
import { useBusinesses } from '@/hooks/useBusinesses';
import { formatCurrency } from '@/lib/utils';
import { CURRENT_YEAR, MONTHS_IT } from '@/lib/constants';
import type { Revenue, RevenueChannel } from '@/lib/types';

export function Incassi() {
  const { currentBusiness } = useBusinesses();
  const businessId = currentBusiness?.id ?? 1;
  const {
    revenues,
    totalRevenueCents,
    fiscalRevenueCents,
    preventiviRevenueCents,
    revenueByChannel,
    addRevenue,
    updateRevenue,
    deleteRevenue,
    channels,
  } = useRevenues(businessId, CURRENT_YEAR);

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Revenue | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterChannel, setFilterChannel] = useState<number | 0>(0);

  const filtered = useMemo(() => {
    if (filterChannel === 0) return revenues;
    return revenues.filter((r) => r.channel_id === filterChannel);
  }, [revenues, filterChannel]);

  const columns: Column<Revenue>[] = [
    {
      key: 'month',
      header: 'Mese',
      render: (r) => MONTHS_IT[r.month - 1],
      sortable: true,
      sortValue: (r) => r.month,
    },
    {
      key: 'channel',
      header: 'Canale',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: r.channel_color }}
          />
          {r.channel_name}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Importo',
      render: (r) => <span className="font-medium">{formatCurrency(r.amount_cents)}</span>,
      sortable: true,
      sortValue: (r) => r.amount_cents,
      className: 'text-right',
    },
    {
      key: 'notes',
      header: 'Note',
      render: (r) => <span className="text-muted-foreground text-xs">{r.notes}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); setEditItem(r); setShowForm(true); }}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }}
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        </div>
      ),
      className: 'w-20',
    },
  ];

  const handleSubmit = async (data: { channel_id: number; month: number; year: number; amount_cents: number; notes: string }) => {
    if (editItem) {
      await updateRevenue(editItem.id, data);
    } else {
      await addRevenue(data);
    }
    setShowForm(false);
    setEditItem(null);
  };

  return (
    <div>
      <Header title="Incassi" description={`Gestione incassi ${CURRENT_YEAR}`}>
        <Button onClick={() => { setEditItem(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nuovo Incasso
        </Button>
      </Header>

      {/* KPI primari (3 a pari livello) */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard
          title="Totale Incassi"
          value={formatCurrency(totalRevenueCents)}
          subtitle="Include preventivi"
        />
        <KpiCard
          title="Fatturato Fiscale"
          value={formatCurrency(fiscalRevenueCents)}
          subtitle="Esclude preventivi (base imponibile)"
        />
        <KpiCard
          title="Preventivi"
          value={formatCurrency(preventiviRevenueCents)}
          subtitle={
            totalRevenueCents > 0
              ? `${formatPercent((preventiviRevenueCents / totalRevenueCents) * 100)} del totale`
              : 'Non concorrono al fiscale'
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Table */}
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value={0}>Tutti i canali</option>
              {(channels as RevenueChannel[]).map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.name}</option>
              ))}
            </select>
          </div>
          <DataTable
            data={filtered}
            columns={columns}
            keyExtractor={(r) => r.id}
            emptyMessage="Nessun incasso registrato"
          />
        </div>

        {/* Pie chart */}
        <div>
          <ChannelPieChart data={revenueByChannel} />
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Modifica Incasso' : 'Nuovo Incasso'}</DialogTitle>
          </DialogHeader>
          <RevenueForm
            channels={channels as RevenueChannel[]}
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
        title="Elimina Incasso"
        description="Sei sicuro di voler eliminare questo incasso? L'azione non puo' essere annullata."
        confirmLabel="Elimina"
        onConfirm={() => { if (deleteId) deleteRevenue(deleteId); setDeleteId(null); }}
      />
    </div>
  );
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value) + '%';
}

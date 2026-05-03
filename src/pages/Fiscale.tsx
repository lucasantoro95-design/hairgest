import { useMemo, useState } from 'react';
import { Calculator, AlertTriangle, PiggyBank, FileText, Plus, Pencil, Trash2, CalendarClock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { KpiCard } from '@/components/shared/KpiCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { TaxPaymentForm } from '@/components/forms/TaxPaymentForm';
import { useRevenues } from '@/hooks/useRevenues';
import { useExpenses } from '@/hooks/useExpenses';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useFiscal } from '@/hooks/useFiscal';
import { useTaxPayments } from '@/hooks/useTaxPayments';
import { formatCurrency, formatDateIT } from '@/lib/utils';
import { calculateFiscalSummary } from '@/lib/calculations';
import { CURRENT_YEAR, INPS_FISSO_DEADLINES_2026 } from '@/lib/constants';
import type { TaxPayment, TaxPaymentType } from '@/lib/types';

const TYPE_LABELS: Record<TaxPaymentType, string> = {
  inps_fisso: 'INPS Fisso',
  inps_variabile: 'INPS Variabile',
  imposta_sostitutiva: 'Imposta Sostitutiva',
  altro: 'Altro',
};

const TYPE_COLORS: Record<TaxPaymentType, string> = {
  inps_fisso: 'bg-blue-100 text-blue-800',
  inps_variabile: 'bg-indigo-100 text-indigo-800',
  imposta_sostitutiva: 'bg-purple-100 text-purple-800',
  altro: 'bg-gray-100 text-gray-800',
};

export function Fiscale() {
  const { currentBusiness } = useBusinesses();
  const businessId = currentBusiness?.id ?? 1;
  const { fiscalRevenueCents, preventiviRevenueCents } = useRevenues(businessId, CURRENT_YEAR);
  const { totalExpensesCents } = useExpenses(businessId, CURRENT_YEAR);
  const { config } = useFiscal(businessId);
  const { payments, addPayment, updatePayment, deletePayment, paidByType } = useTaxPayments(businessId, CURRENT_YEAR);

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<TaxPayment | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fiscal = useMemo(() => {
    if (!config) return null;
    return calculateFiscalSummary(fiscalRevenueCents, totalExpensesCents, config, paidByType);
  }, [fiscalRevenueCents, totalExpensesCents, config, paidByType]);

  // Prossima scadenza INPS fissa
  const nextDeadline = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return INPS_FISSO_DEADLINES_2026.find((d) => d.date >= today);
  }, []);

  if (!config || !fiscal) {
    return (
      <div>
        <Header title="Fiscale" description="Caricamento configurazione fiscale..." />
      </div>
    );
  }

  const handleSubmit = async (data: { year: number; type: TaxPaymentType; amount_cents: number; payment_date: string; notes: string }) => {
    if (editItem) {
      await updatePayment(editItem.id, data);
    } else {
      await addPayment(data);
    }
    setShowForm(false);
    setEditItem(null);
  };

  const paymentColumns: Column<TaxPayment>[] = [
    {
      key: 'date',
      header: 'Data',
      render: (p) => formatDateIT(p.payment_date),
      sortable: true,
      sortValue: (p) => p.payment_date,
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (p) => (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[p.type]}`}>
          {TYPE_LABELS[p.type]}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Importo',
      render: (p) => <span className="font-medium">{formatCurrency(p.amount_cents)}</span>,
      sortable: true,
      sortValue: (p) => p.amount_cents,
      className: 'text-right',
    },
    {
      key: 'notes',
      header: 'Note',
      render: (p) => <span className="text-muted-foreground text-xs">{p.notes}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditItem(p); setShowForm(true); }}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }}>
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        </div>
      ),
      className: 'w-20',
    },
  ];

  return (
    <div>
      <Header
        title="Previsionale Fiscale"
        description={`Regime Forfettario ${CURRENT_YEAR} - Aliquota imposta ${config.tax_rate}% ${fiscal.reduction_35_applied ? '- Riduzione INPS 35% attiva' : ''}`}
      />

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Disclaimer</p>
          <p className="text-xs text-amber-700 mt-1">
            Stime indicative basate sulla Circolare INPS n. 14/2026 (gestione artigiani) e sul regime forfettario.
            I preventivi <strong>non sono inclusi nel fatturato fiscale</strong>. I contributi INPS effettivamente
            pagati nell'anno sono dedotti dall'imponibile prima del calcolo dell'imposta sostitutiva (principio di cassa).
            Consulta sempre il commercialista per la dichiarazione definitiva.
          </p>
        </div>
      </div>

      {preventiviRevenueCents > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-sm text-blue-800">
          <strong>{formatCurrency(preventiviRevenueCents)}</strong> di preventivi esclusi dal calcolo fiscale.
          Vedili in <span className="font-medium">Incassi</span>.
        </div>
      )}

      {/* 85K Warning */}
      {fiscal.near_cap_warning && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Attenzione: avvicinamento al limite di 85.000 EUR</p>
            <p className="text-xs text-red-700 mt-1">
              Il fatturato fiscale si sta avvicinando al limite del regime forfettario. Superato questo limite,
              dovrai passare al regime ordinario dall'anno successivo.
            </p>
          </div>
        </div>
      )}

      {/* Prossima scadenza */}
      {nextDeadline && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6 flex items-center gap-3">
          <CalendarClock className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Prossima scadenza INPS fisso</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {nextDeadline.label} - importo: {formatCurrency(Math.round(fiscal.inps_fixed_due_cents / 4))}
            </p>
          </div>
        </div>
      )}

      {/* KPI principali */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Fatturato Fiscale"
          value={formatCurrency(fiscal.total_revenue_cents)}
          icon={<FileText className="w-5 h-5" />}
          subtitle={`Imponibile lordo: ${formatCurrency(fiscal.taxable_income_gross_cents)}`}
        />
        <KpiCard
          title="Tasse Dovute Totali"
          value={formatCurrency(fiscal.total_due_cents)}
          icon={<Calculator className="w-5 h-5" />}
          subtitle={`Imposta + INPS (anno ${CURRENT_YEAR})`}
        />
        <KpiCard
          title="Già Pagato"
          value={formatCurrency(fiscal.total_paid_cents)}
          icon={<PiggyBank className="w-5 h-5" />}
          subtitle={`${payments.length} pagamenti registrati`}
        />
        <KpiCard
          title="Saldo da Pagare"
          value={formatCurrency(Math.max(0, fiscal.total_balance_cents))}
          icon={<Calculator className="w-5 h-5" />}
          subtitle={fiscal.total_balance_cents <= 0 ? 'Tutto coperto' : 'Residuo dovuto'}
        />
      </div>

      {/* Dettaglio dovuto vs pagato per ogni voce */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* INPS Fisso */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">INPS Fisso</h3>
            <span className="text-xs text-muted-foreground">4 rate trimestrali</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Contributo annuo a prescindere dal reddito{fiscal.reduction_35_applied ? ' (ridotto del 35%)' : ''}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dovuto annuo</span>
              <span className="font-medium">{formatCurrency(fiscal.inps_fixed_due_cents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pagato</span>
              <span className="font-medium text-success">{formatCurrency(paidByType.inps_fisso)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-semibold">Saldo</span>
              <span className={`font-bold ${fiscal.inps_fixed_due_cents - paidByType.inps_fisso > 0 ? 'text-destructive' : 'text-success'}`}>
                {formatCurrency(Math.max(0, fiscal.inps_fixed_due_cents - paidByType.inps_fisso))}
              </span>
            </div>
          </div>
        </div>

        {/* INPS Variabile */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">INPS Variabile (IVS)</h3>
            <span className="text-xs text-muted-foreground">scadenze IRPEF</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Sulla quota di imponibile oltre {formatCurrency(config.inps_minimale_cents)} ({config.inps_rate}% / {config.inps_rate_2}%)
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dovuto stimato</span>
              <span className="font-medium">{formatCurrency(fiscal.inps_variable_due_cents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pagato</span>
              <span className="font-medium text-success">{formatCurrency(paidByType.inps_variabile)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-semibold">Saldo</span>
              <span className={`font-bold ${fiscal.inps_variable_due_cents - paidByType.inps_variabile > 0 ? 'text-destructive' : 'text-success'}`}>
                {formatCurrency(Math.max(0, fiscal.inps_variable_due_cents - paidByType.inps_variabile))}
              </span>
            </div>
          </div>
        </div>

        {/* Imposta sostitutiva */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Imposta Sostitutiva</h3>
            <span className="text-xs text-muted-foreground">{config.tax_rate}%</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Su imponibile netto (dopo deduzione INPS pagato)
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dovuto stimato</span>
              <span className="font-medium">{formatCurrency(fiscal.tax_due_cents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pagato</span>
              <span className="font-medium text-success">{formatCurrency(paidByType.imposta_sostitutiva)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-semibold">Saldo</span>
              <span className={`font-bold ${fiscal.tax_due_cents - paidByType.imposta_sostitutiva > 0 ? 'text-destructive' : 'text-success'}`}>
                {formatCurrency(Math.max(0, fiscal.tax_due_cents - paidByType.imposta_sostitutiva))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Calcolo dettagliato + Riepilogo */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Calcolo Dettagliato</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <p className="text-sm font-medium">Fatturato fiscale</p>
                <p className="text-xs text-muted-foreground">Esclusi preventivi</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(fiscal.total_revenue_cents)}</p>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <p className="text-sm font-medium">× Coefficiente {config.profitability_coefficient}%</p>
                <p className="text-xs text-muted-foreground">= Imponibile lordo</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(fiscal.taxable_income_gross_cents)}</p>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <p className="text-sm font-medium">- INPS pagato (deducibile)</p>
                <p className="text-xs text-muted-foreground">Principio di cassa - {formatCurrency(fiscal.inps_paid_cents)}</p>
              </div>
              <p className="text-lg font-bold text-success">-{formatCurrency(fiscal.inps_paid_cents)}</p>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <p className="text-sm font-medium">= Imponibile netto</p>
                <p className="text-xs text-muted-foreground">Base imposta sostitutiva</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(fiscal.taxable_income_net_cents)}</p>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <p className="text-sm font-medium">Imposta sostitutiva ({config.tax_rate}%)</p>
                <p className="text-xs text-muted-foreground">Imponibile netto × aliquota</p>
              </div>
              <p className="text-lg font-bold text-destructive">{formatCurrency(fiscal.tax_due_cents)}</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">INPS totale dovuto</p>
                <p className="text-xs text-muted-foreground">Fisso + variabile{fiscal.reduction_35_applied ? ' (con riduzione 35%)' : ''}</p>
              </div>
              <p className="text-lg font-bold text-destructive">{formatCurrency(fiscal.inps_total_due_cents)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Riepilogo Annuo</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fatturato fiscale</span>
                <span className="text-sm font-medium">{formatCurrency(fiscal.total_revenue_cents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">- Spese operative</span>
                <span className="text-sm font-medium text-destructive">-{formatCurrency(totalExpensesCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">- Imposta sostitutiva</span>
                <span className="text-sm font-medium text-destructive">-{formatCurrency(fiscal.tax_due_cents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">- INPS totale</span>
                <span className="text-sm font-medium text-destructive">-{formatCurrency(fiscal.inps_total_due_cents)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-sm font-bold">Utile netto stimato</span>
                <span className="text-lg font-bold text-success">{formatCurrency(fiscal.net_profit_cents)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <PiggyBank className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Accantonamento residuo</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {formatCurrency(Math.max(0, fiscal.total_balance_cents))}
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Da accantonare per coprire tasse e contributi ancora da versare nel {CURRENT_YEAR}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sezione Pagamenti registrati */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Pagamenti Registrati {CURRENT_YEAR}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inserisci ogni F24 versato. Gli INPS pagati riducono automaticamente l'imponibile dell'imposta sostitutiva.
            </p>
          </div>
          <Button onClick={() => { setEditItem(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Registra Pagamento
          </Button>
        </div>
        <DataTable
          data={payments}
          columns={paymentColumns}
          keyExtractor={(p) => p.id}
          emptyMessage="Nessun pagamento registrato per questo anno"
        />
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) setEditItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Modifica Pagamento' : 'Registra Pagamento'}</DialogTitle>
          </DialogHeader>
          <TaxPaymentForm
            defaultYear={CURRENT_YEAR}
            initialData={editItem}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditItem(null); }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Elimina Pagamento"
        description="Sei sicuro di voler eliminare questo pagamento? Verra' rimosso dal saldo."
        confirmLabel="Elimina"
        onConfirm={() => { if (deleteId) deletePayment(deleteId); setDeleteId(null); }}
      />
    </div>
  );
}

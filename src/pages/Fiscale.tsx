import { useMemo } from 'react';
import { Calculator, AlertTriangle, PiggyBank, FileText } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { KpiCard } from '@/components/shared/KpiCard';
import { useRevenues } from '@/hooks/useRevenues';
import { useExpenses } from '@/hooks/useExpenses';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useFiscal } from '@/hooks/useFiscal';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { calculateFiscalSummary } from '@/lib/calculations';
import { CURRENT_YEAR } from '@/lib/constants';

export function Fiscale() {
  const { currentBusiness } = useBusinesses();
  const businessId = currentBusiness?.id ?? 1;
  const { totalRevenueCents } = useRevenues(businessId, CURRENT_YEAR);
  const { totalExpensesCents, expensesByCategory } = useExpenses(businessId, CURRENT_YEAR);
  const { config } = useFiscal(businessId);

  const fiscal = useMemo(() => {
    if (!config) return null;
    return calculateFiscalSummary(totalRevenueCents, totalExpensesCents, config);
  }, [totalRevenueCents, totalExpensesCents, config]);

  const stipendioCents = useMemo(
    () => expensesByCategory.find((c) => c.category_name === 'Stipendio')?.total_cents ?? 0,
    [expensesByCategory]
  );
  const finanziamentiCents = useMemo(
    () => expensesByCategory.find((c) => c.category_name === 'Finanziamenti')?.total_cents ?? 0,
    [expensesByCategory]
  );
  const altreSpeseCents = totalExpensesCents - stipendioCents - finanziamentiCents;

  if (!config || !fiscal) {
    return (
      <div>
        <Header title="Fiscale" description="Caricamento configurazione fiscale..." />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Previsionale Fiscale"
        description={`Regime Forfettario ${CURRENT_YEAR} - Aliquota ${config.tax_rate}%`}
      />

      {/* Warning banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Disclaimer</p>
          <p className="text-xs text-amber-700 mt-1">
            Questi calcoli sono stime indicative basate sul regime forfettario. Consulta sempre il tuo
            commercialista per la dichiarazione fiscale definitiva. I contributi INPS effettivi potrebbero
            variare in base alla tua posizione contributiva specifica.
          </p>
        </div>
      </div>

      {/* 85K Warning */}
      {fiscal.near_cap_warning && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Attenzione: Avvicinamento al limite di 85.000 EUR</p>
            <p className="text-xs text-red-700 mt-1">
              Il tuo fatturato si sta avvicinando al limite del regime forfettario. Superato questo limite,
              dovrai passare al regime ordinario dall'anno successivo.
            </p>
          </div>
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Fatturato Totale"
          value={formatCurrency(fiscal.total_revenue_cents)}
          icon={<FileText className="w-5 h-5" />}
        />
        <KpiCard
          title="Reddito Imponibile"
          value={formatCurrency(fiscal.taxable_income_cents)}
          icon={<Calculator className="w-5 h-5" />}
          subtitle={`${config.profitability_coefficient}% del fatturato`}
        />
        <KpiCard
          title="Totale Tasse Stimate"
          value={formatCurrency(fiscal.total_taxes_cents)}
          icon={<Calculator className="w-5 h-5" />}
        />
        <KpiCard
          title="Utile Netto Stimato"
          value={formatCurrency(fiscal.net_profit_cents)}
          icon={<PiggyBank className="w-5 h-5" />}
        />
      </div>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Calcolo Regime Forfettario</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <p className="text-sm font-medium">Fatturato Totale</p>
                <p className="text-xs text-muted-foreground">Somma di tutti gli incassi {CURRENT_YEAR}</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(fiscal.total_revenue_cents)}</p>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <p className="text-sm font-medium">Coefficiente di Redditivita'</p>
                <p className="text-xs text-muted-foreground">Codice ATECO parrucchieri: {config.profitability_coefficient}%</p>
              </div>
              <p className="text-lg font-bold text-primary">{formatPercent(config.profitability_coefficient, 0)}</p>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <p className="text-sm font-medium">Reddito Imponibile</p>
                <p className="text-xs text-muted-foreground">Fatturato x {config.profitability_coefficient}%</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(fiscal.taxable_income_cents)}</p>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <p className="text-sm font-medium">Imposta Sostitutiva ({config.tax_rate}%)</p>
                <p className="text-xs text-muted-foreground">
                  {config.tax_rate === 5 ? 'Aliquota agevolata primi 5 anni' : 'Aliquota ordinaria'}
                </p>
              </div>
              <p className="text-lg font-bold text-destructive">{formatCurrency(fiscal.tax_cents)}</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Contributi INPS ({config.inps_rate}%)</p>
                <p className="text-xs text-muted-foreground">Sul reddito imponibile</p>
              </div>
              <p className="text-lg font-bold text-destructive">{formatCurrency(fiscal.inps_cents)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Riepilogo</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fatturato</span>
                <span className="text-sm font-medium">{formatCurrency(fiscal.total_revenue_cents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">- Spese operative</span>
                <span className="text-sm font-medium text-destructive">-{formatCurrency(altreSpeseCents)}</span>
              </div>
              {stipendioCents > 0 && (
                <div className="flex justify-between pl-3">
                  <span className="text-xs text-muted-foreground">- Stipendio</span>
                  <span className="text-xs font-medium text-destructive">-{formatCurrency(stipendioCents)}</span>
                </div>
              )}
              {finanziamentiCents > 0 && (
                <div className="flex justify-between pl-3">
                  <span className="text-xs text-muted-foreground">- Finanziamenti</span>
                  <span className="text-xs font-medium text-destructive">-{formatCurrency(finanziamentiCents)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">- Imposta sostitutiva</span>
                <span className="text-sm font-medium text-destructive">-{formatCurrency(fiscal.tax_cents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">- Contributi INPS</span>
                <span className="text-sm font-medium text-destructive">-{formatCurrency(fiscal.inps_cents)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-sm font-bold">Utile Netto Stimato</span>
                <span className="text-lg font-bold text-success">{formatCurrency(fiscal.net_profit_cents)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <PiggyBank className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Accantonamento Suggerito</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {formatCurrency(fiscal.suggested_reserve_cents)}
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Importo da accantonare per il pagamento di tasse e contributi.
                  Imposta: {formatCurrency(fiscal.tax_cents)} + INPS: {formatCurrency(fiscal.inps_cents)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

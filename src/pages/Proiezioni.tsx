import { TrendingUp, Target, ArrowRight, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { KpiCard } from '@/components/shared/KpiCard';
import { useRevenues } from '@/hooks/useRevenues';
import { useExpenses } from '@/hooks/useExpenses';
import { useMonthlyData } from '@/hooks/useMonthlyData';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useProjections } from '@/hooks/useProjections';
import { formatCurrency, formatPercent, getCurrentMonth } from '@/lib/utils';
import { CURRENT_YEAR, MONTHS_IT } from '@/lib/constants';

export function Proiezioni() {
  const { currentBusiness } = useBusinesses();
  const businessId = currentBusiness?.id ?? 1;
  const { totalRevenueCents } = useRevenues(businessId, CURRENT_YEAR);
  const { totalExpensesCents } = useExpenses(businessId, CURRENT_YEAR);
  const { monthlyData } = useMonthlyData(businessId, CURRENT_YEAR);
  const targetCents = currentBusiness?.annual_target_cents ?? 0;
  const currentMonth = getCurrentMonth();
  const projections = useProjections(monthlyData, targetCents, currentMonth);

  const remainingMonths = Math.max(0, 12 - currentMonth);

  return (
    <div>
      <Header
        title="Proiezioni Fine Anno"
        description={`Stime basate sui dati fino a ${MONTHS_IT[currentMonth - 1]} ${CURRENT_YEAR}`}
      />

      {/* Status banner */}
      <div className={`rounded-xl p-4 mb-6 flex items-start gap-3 ${
        projections.on_track
          ? 'bg-green-50 border border-green-200'
          : 'bg-amber-50 border border-amber-200'
      }`}>
        {projections.on_track ? (
          <TrendingUp className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        )}
        <div>
          <p className={`text-sm font-medium ${projections.on_track ? 'text-green-800' : 'text-amber-800'}`}>
            {projections.on_track
              ? 'Sei in linea con l\'obiettivo annuale!'
              : 'Attenzione: non sei ancora in linea con l\'obiettivo'}
          </p>
          <p className={`text-xs mt-1 ${projections.on_track ? 'text-green-700' : 'text-amber-700'}`}>
            {projections.on_track
              ? `Al ritmo attuale, raggiungerai ${formatCurrency(projections.projected_annual_revenue_cents)} entro fine anno.`
              : `Ti mancano ${formatCurrency(Math.abs(projections.gap_cents))} per raggiungere l'obiettivo di ${formatCurrency(targetCents)}.`}
          </p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Proiezione Fatturato"
          value={formatCurrency(projections.projected_annual_revenue_cents)}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="Stima fine anno"
        />
        <KpiCard
          title="Obiettivo Annuale"
          value={formatCurrency(targetCents)}
          icon={<Target className="w-5 h-5" />}
          subtitle={`Completamento: ${formatPercent(projections.completion_percentage, 0)}`}
        />
        <KpiCard
          title="Gap da Colmare"
          value={projections.gap_cents > 0 ? formatCurrency(projections.gap_cents) : 'Raggiunto!'}
          icon={<ArrowRight className="w-5 h-5" />}
          subtitle={projections.gap_cents > 0 ? 'Mancante all\'obiettivo' : undefined}
        />
        <KpiCard
          title="Necessario/Mese"
          value={remainingMonths > 0 ? formatCurrency(projections.monthly_needed_cents) : '-'}
          subtitle={remainingMonths > 0 ? `Per i ${remainingMonths} mesi rimanenti` : 'Anno completato'}
        />
      </div>

      {/* Progress bar */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Progresso verso l'Obiettivo</h3>
          <span className="text-2xl font-bold text-primary">{formatPercent(projections.completion_percentage, 0)}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-4 mb-2">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              projections.on_track ? 'bg-success' : 'bg-warning'
            }`}
            style={{ width: `${projections.completion_percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Attuale: {formatCurrency(totalRevenueCents)}</span>
          <span>Obiettivo: {formatCurrency(targetCents)}</span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold mb-4">Dettaglio Proiezioni</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Fatturato attuale</span>
              <span className="text-sm font-medium">{formatCurrency(totalRevenueCents)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Proiezione fine anno</span>
              <span className="text-sm font-medium">{formatCurrency(projections.projected_annual_revenue_cents)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Spese attuali</span>
              <span className="text-sm font-medium">{formatCurrency(totalExpensesCents)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Proiezione spese</span>
              <span className="text-sm font-medium">{formatCurrency(projections.projected_annual_expenses_cents)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm font-bold">Profitto stimato</span>
              <span className="text-sm font-bold text-success">{formatCurrency(projections.projected_annual_profit_cents)}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold mb-4">Piano d'Azione</h3>
          {projections.on_track ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Ottimo lavoro! Mantieni questo ritmo e raggiungerai l'obiettivo annuale.
              </p>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800">
                  Media mensile attuale: {formatCurrency(Math.round(totalRevenueCents / Math.max(1, currentMonth)))}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Continua cosi' per raggiungere {formatCurrency(targetCents)} entro dicembre.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Per raggiungere l'obiettivo, devi aumentare gli incassi mensili.
              </p>
              {remainingMonths > 0 && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-800">
                    Fatturato necessario per mese: {formatCurrency(projections.monthly_needed_cents)}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Per i prossimi {remainingMonths} mesi, per raggiungere {formatCurrency(targetCents)}.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

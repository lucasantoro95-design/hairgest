import { useMemo } from 'react';
import { DollarSign, Receipt, TrendingUp, PiggyBank } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { KpiCard } from '@/components/shared/KpiCard';
import { RevenueExpenseChart } from '@/components/charts/RevenueExpenseChart';
import { TargetVsActualChart } from '@/components/charts/TargetVsActualChart';
import { useRevenues } from '@/hooks/useRevenues';
import { useExpenses } from '@/hooks/useExpenses';
import { useMonthlyData } from '@/hooks/useMonthlyData';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useFiscal } from '@/hooks/useFiscal';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { calculateFiscalSummary } from '@/lib/calculations';
import { CURRENT_YEAR, MONTHS_SHORT_IT } from '@/lib/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function Dashboard() {
  const { currentBusiness } = useBusinesses();
  const businessId = currentBusiness?.id ?? 1;
  const { totalRevenueCents } = useRevenues(businessId, CURRENT_YEAR);
  const { totalExpensesCents } = useExpenses(businessId, CURRENT_YEAR);
  const { monthlyData } = useMonthlyData(businessId, CURRENT_YEAR);
  const { config } = useFiscal(businessId);

  const profitCents = totalRevenueCents - totalExpensesCents;
  const targetCents = currentBusiness?.annual_target_cents ?? 0;
  const progressPct = targetCents > 0 ? Math.min(100, (totalRevenueCents / targetCents) * 100) : 0;

  const fiscal = useMemo(() => {
    if (!config) return null;
    return calculateFiscalSummary(totalRevenueCents, totalExpensesCents, config);
  }, [totalRevenueCents, totalExpensesCents, config]);

  return (
    <div>
      <Header
        title="Dashboard"
        description={`Panoramica ${CURRENT_YEAR} - ${currentBusiness?.name ?? 'Attivita\''}`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Fatturato"
          value={formatCurrency(totalRevenueCents)}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <KpiCard
          title="Spese"
          value={formatCurrency(totalExpensesCents)}
          icon={<Receipt className="w-5 h-5" />}
        />
        <KpiCard
          title="Profitto Lordo"
          value={formatCurrency(profitCents)}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle={totalRevenueCents > 0 ? `Margine ${formatPercent((profitCents / totalRevenueCents) * 100)}` : undefined}
        />
        <KpiCard
          title="Utile Netto (stima)"
          value={fiscal ? formatCurrency(fiscal.net_profit_cents) : '...'}
          icon={<PiggyBank className="w-5 h-5" />}
          subtitle={fiscal ? `Tasse stimate: ${formatCurrency(fiscal.total_taxes_cents)}` : undefined}
        />
      </div>

      {/* Progress bar obiettivo */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Obiettivo Annuale: {formatCurrency(targetCents)}
          </span>
          <span className="text-sm font-semibold text-primary">
            {formatPercent(progressPct, 0)}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {formatCurrency(totalRevenueCents)} di {formatCurrency(targetCents)} raggiunto
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <RevenueExpenseChart data={monthlyData} />
        <TargetVsActualChart data={monthlyData} />
      </div>

      {/* Monthly Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Riepilogo Mensile {CURRENT_YEAR}</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Mese</TableHead>
              <TableHead className="text-right">Incassi</TableHead>
              <TableHead className="text-right">Spese</TableHead>
              <TableHead className="text-right">Profitto</TableHead>
              <TableHead className="text-right">Obiettivo</TableHead>
              <TableHead className="text-right">Differenza</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyData.map((m) => {
              const diff = m.revenue_cents - m.target_cents;
              return (
                <TableRow key={m.month}>
                  <TableCell className="font-medium">{MONTHS_SHORT_IT[m.month - 1]}</TableCell>
                  <TableCell className="text-right">{formatCurrency(m.revenue_cents)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(m.expense_cents)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(m.profit_cents)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(m.target_cents)}</TableCell>
                  <TableCell className={`text-right font-medium ${diff >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Totals row */}
            <TableRow className="bg-muted/50 font-bold">
              <TableCell>TOTALE</TableCell>
              <TableCell className="text-right">{formatCurrency(totalRevenueCents)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totalExpensesCents)}</TableCell>
              <TableCell className="text-right">{formatCurrency(profitCents)}</TableCell>
              <TableCell className="text-right text-muted-foreground">{formatCurrency(targetCents)}</TableCell>
              <TableCell className={`text-right ${totalRevenueCents - targetCents >= 0 ? 'text-success' : 'text-destructive'}`}>
                {totalRevenueCents - targetCents >= 0 ? '+' : ''}{formatCurrency(totalRevenueCents - targetCents)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { KpiCard } from '@/components/shared/KpiCard';
import { RevenueExpenseChart } from '@/components/charts/RevenueExpenseChart';
import { Button } from '@/components/ui/button';
import { useRevenues } from '@/hooks/useRevenues';
import { useExpenses } from '@/hooks/useExpenses';
import { useMonthlyData } from '@/hooks/useMonthlyData';
import { useBusinesses } from '@/hooks/useBusinesses';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { calculateMoMChange } from '@/lib/calculations';
import { CURRENT_YEAR, MONTHS_IT } from '@/lib/constants';

export function Mensile() {
  const { currentBusiness } = useBusinesses();
  const businessId = currentBusiness?.id ?? 1;
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const { monthlyData } = useMonthlyData(businessId, CURRENT_YEAR, currentBusiness?.annual_target_cents ?? 0);
  const { revenues } = useRevenues(businessId, CURRENT_YEAR);
  const { expenses } = useExpenses(businessId, CURRENT_YEAR);

  const currentData = monthlyData.find((m) => m.month === selectedMonth);
  const prevData = monthlyData.find((m) => m.month === selectedMonth - 1);

  const revenueChange = useMemo(() => {
    if (!currentData || !prevData) return null;
    return calculateMoMChange(currentData.revenue_cents, prevData.revenue_cents);
  }, [currentData, prevData]);

  const expenseChange = useMemo(() => {
    if (!currentData || !prevData) return null;
    return calculateMoMChange(currentData.expense_cents, prevData.expense_cents);
  }, [currentData, prevData]);

  const monthRevenues = revenues.filter((r) => r.month === selectedMonth);
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() + 1 === selectedMonth;
  });

  return (
    <div>
      <Header
        title="Panoramica Mensile"
        description={`${MONTHS_IT[selectedMonth - 1]} ${CURRENT_YEAR}`}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedMonth(Math.max(1, selectedMonth - 1))}
            disabled={selectedMonth <= 1}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[100px] text-center">
            {MONTHS_IT[selectedMonth - 1]}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedMonth(Math.min(12, selectedMonth + 1))}
            disabled={selectedMonth >= 12}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Header>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Incassi del Mese"
          value={formatCurrency(currentData?.revenue_cents ?? 0)}
          trend={revenueChange !== null ? (revenueChange >= 0 ? 'up' : 'down') : undefined}
          trendValue={revenueChange !== null ? `${revenueChange >= 0 ? '+' : ''}${formatPercent(revenueChange)} vs mese prec.` : undefined}
        />
        <KpiCard
          title="Spese del Mese"
          value={formatCurrency(currentData?.expense_cents ?? 0)}
          trend={expenseChange !== null ? (expenseChange <= 0 ? 'up' : 'down') : undefined}
          trendValue={expenseChange !== null ? `${expenseChange >= 0 ? '+' : ''}${formatPercent(expenseChange)} vs mese prec.` : undefined}
        />
        <KpiCard
          title="Profitto del Mese"
          value={formatCurrency(currentData?.profit_cents ?? 0)}
        />
        <KpiCard
          title="Obiettivo"
          value={formatCurrency(currentData?.target_cents ?? 0)}
          subtitle={currentData ? `Differenza: ${formatCurrency(currentData.revenue_cents - currentData.target_cents)}` : undefined}
        />
      </div>

      {/* Chart for context */}
      <div className="mb-6">
        <RevenueExpenseChart data={monthlyData} />
      </div>

      {/* Detail lists */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Incassi - {MONTHS_IT[selectedMonth - 1]}</h3>
          {monthRevenues.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun incasso questo mese</p>
          ) : (
            <div className="space-y-2">
              {monthRevenues.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <span className="text-sm font-medium">{r.channel_name}</span>
                    {r.notes && <span className="text-xs text-muted-foreground ml-2">{r.notes}</span>}
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(r.amount_cents)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Spese - {MONTHS_IT[selectedMonth - 1]}</h3>
          {monthExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna spesa questo mese</p>
          ) : (
            <div className="space-y-2">
              {monthExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <span className="text-sm font-medium">{e.description}</span>
                    <span className="text-xs text-muted-foreground ml-2">{e.category_name}</span>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(e.amount_cents)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

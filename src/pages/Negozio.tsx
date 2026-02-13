import { useMemo } from 'react';
import { Store, TrendingUp, Target, PiggyBank } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { KpiCard } from '@/components/shared/KpiCard';
import { ChannelPieChart } from '@/components/charts/ChannelPieChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { TrendLineChart } from '@/components/charts/TrendLineChart';
import { useRevenues } from '@/hooks/useRevenues';
import { useExpenses } from '@/hooks/useExpenses';
import { useMonthlyData } from '@/hooks/useMonthlyData';
import { useBusinesses } from '@/hooks/useBusinesses';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { calculateROI, calculateMargin } from '@/lib/calculations';
import { CURRENT_YEAR } from '@/lib/constants';

export function Negozio() {
  const { currentBusiness } = useBusinesses();
  const businessId = currentBusiness?.id ?? 1;
  const { totalRevenueCents, revenueByChannel } = useRevenues(businessId, CURRENT_YEAR);
  const { totalExpensesCents, expensesByCategory } = useExpenses(businessId, CURRENT_YEAR);
  const { monthlyData } = useMonthlyData(businessId, CURRENT_YEAR);

  const profitCents = totalRevenueCents - totalExpensesCents;
  const purchasePrice = currentBusiness?.purchase_price_cents ?? 0;

  const roi = useMemo(() => calculateROI(profitCents, purchasePrice), [profitCents, purchasePrice]);
  const margin = useMemo(() => calculateMargin(totalRevenueCents, totalExpensesCents), [totalRevenueCents, totalExpensesCents]);

  return (
    <div>
      <Header
        title="Panoramica Negozio"
        description={`${currentBusiness?.name ?? 'Attivita\''} - Analisi ${CURRENT_YEAR}`}
      />

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Fatturato Totale"
          value={formatCurrency(totalRevenueCents)}
          icon={<Store className="w-5 h-5" />}
        />
        <KpiCard
          title="Profitto Lordo"
          value={formatCurrency(profitCents)}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KpiCard
          title="Margine"
          value={formatPercent(margin)}
          icon={<Target className="w-5 h-5" />}
        />
        <KpiCard
          title="ROI Investimento"
          value={formatPercent(roi)}
          icon={<PiggyBank className="w-5 h-5" />}
          subtitle={`Su investimento di ${formatCurrency(purchasePrice)}`}
        />
      </div>

      {/* Trend */}
      <div className="mb-6">
        <TrendLineChart data={monthlyData} title="Trend Incassi e Profitto" />
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-2 gap-6">
        <ChannelPieChart data={revenueByChannel} />
        <CategoryPieChart data={expensesByCategory} />
      </div>
    </div>
  );
}

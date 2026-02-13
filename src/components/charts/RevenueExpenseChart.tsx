import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { MonthlyData } from '@/lib/types';
import { centsToEuro, formatCurrency } from '@/lib/utils';
import { MONTHS_SHORT_IT } from '@/lib/constants';

interface RevenueExpenseChartProps {
  data: MonthlyData[];
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  const chartData = data.map((d) => ({
    name: MONTHS_SHORT_IT[d.month - 1],
    Incassi: centsToEuro(d.revenue_cents),
    Spese: centsToEuro(d.expense_cents),
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Incassi vs Spese</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
          <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `${v.toLocaleString('it-IT')} €`} />
          <Tooltip
            formatter={(value: number | undefined) => value != null ? formatCurrency(Math.round(value * 100)) : ''}
            contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="Incassi" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Spese" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

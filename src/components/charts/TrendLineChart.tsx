import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MonthlyData } from '@/lib/types';
import { centsToEuro, formatCurrency } from '@/lib/utils';
import { MONTHS_SHORT_IT } from '@/lib/constants';

interface TrendLineChartProps {
  data: MonthlyData[];
  title?: string;
}

export function TrendLineChart({ data, title = 'Trend Incassi' }: TrendLineChartProps) {
  const chartData = data
    .filter((d) => d.revenue_cents > 0)
    .map((d) => ({
      name: MONTHS_SHORT_IT[d.month - 1],
      Incassi: centsToEuro(d.revenue_cents),
      Profitto: centsToEuro(d.profit_cents),
    }));

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
          <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `${v.toLocaleString('it-IT')} €`} />
          <Tooltip
            formatter={(value: number | undefined) => value != null ? formatCurrency(Math.round(value * 100)) : ''}
            contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }}
          />
          <Line type="monotone" dataKey="Incassi" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
          <Line type="monotone" dataKey="Profitto" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

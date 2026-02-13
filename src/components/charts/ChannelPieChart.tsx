import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ChannelBreakdown } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ChannelPieChartProps {
  data: ChannelBreakdown[];
  title?: string;
}

export function ChannelPieChart({ data, title = 'Incassi per Canale' }: ChannelPieChartProps) {
  const chartData = data.map((d) => ({
    name: d.channel_name,
    value: d.total_cents,
    color: d.channel_color,
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | undefined) => value != null ? formatCurrency(value) : ''}
            contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => <span className="text-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

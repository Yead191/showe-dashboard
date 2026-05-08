import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CHART_COLORS } from './colors';
import { ChartTooltip } from './ChartTooltip';

interface BarsChartProps {
  data: { date: string; value: number }[];
  formatter?: (v: number) => string;
  height?: number;
  highlight?: number; // index to highlight
}

export function BarsChart({ data, formatter, height = 220, highlight }: BarsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke={CHART_COLORS.line} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: CHART_COLORS.inkFaint }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: CHART_COLORS.inkFaint }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (formatter ? formatter(v) : `${v}`)}
        />
        <Tooltip content={<ChartTooltip formatter={formatter} />} cursor={{ fill: 'rgba(1,75,82,0.05)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i === highlight ? CHART_COLORS.accent : CHART_COLORS.primary}
              opacity={i === highlight ? 1 : 0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

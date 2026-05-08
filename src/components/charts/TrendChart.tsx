import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from './colors';
import { ChartTooltip } from './ChartTooltip';
import type { MetricPoint } from '@/types';

interface TrendChartProps {
  data: MetricPoint[];
  color?: 'primary' | 'accent' | 'info' | 'success' | 'purple';
  formatter?: (v: number) => string;
  height?: number;
  name?: string;
}

const COLORS = {
  primary: CHART_COLORS.primary,
  accent: CHART_COLORS.accent,
  info: CHART_COLORS.info,
  success: CHART_COLORS.success,
  purple: CHART_COLORS.purple,
};

export function TrendChart({
  data,
  color = 'primary',
  formatter,
  height = 220,
  name = 'Value',
}: TrendChartProps) {
  const stroke = COLORS[color];
  const id = `gradient-${color}-${name}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke={CHART_COLORS.line} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: CHART_COLORS.inkFaint }}
          tickLine={false}
          axisLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fontSize: 11, fill: CHART_COLORS.inkFaint }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (formatter ? formatter(v) : `${v}`)}
        />
        <Tooltip content={<ChartTooltip formatter={formatter} />} cursor={{ stroke: stroke, strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Area
          type="monotone"
          dataKey="value"
          name={name}
          stroke={stroke}
          strokeWidth={2.5}
          fill={`url(#${id})`}
          activeDot={{ r: 5, strokeWidth: 2, stroke: '#FBFAF7' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

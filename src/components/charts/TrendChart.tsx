import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CHART_COLORS } from './colors';
import { ChartTooltip } from './ChartTooltip';
import type { MetricPoint } from '@/types';

type ChartColor = 'primary' | 'accent' | 'info' | 'success' | 'purple';

export interface TrendSeries {
  key: string;
  name: string;
  color?: ChartColor;
}

interface TrendChartProps {
  data: Array<MetricPoint | Record<string, string | number>>;
  color?: ChartColor;
  formatter?: (v: number) => string;
  height?: number;
  name?: string;
  /** When provided, renders multiple series instead of a single `value` series. */
  series?: TrendSeries[];
}

const COLORS: Record<ChartColor, string> = {
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
  series,
}: TrendChartProps) {
  const resolvedSeries: TrendSeries[] =
    series && series.length > 0
      ? series
      : [{ key: 'value', name, color }];

  const primaryStroke = COLORS[resolvedSeries[0]?.color ?? color];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {resolvedSeries.map((item) => {
            const stroke = COLORS[item.color ?? color];
            const id = `gradient-${item.key}-${item.color ?? color}`;
            return (
              <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            );
          })}
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
        <Tooltip
          content={<ChartTooltip formatter={formatter} />}
          cursor={{ stroke: primaryStroke, strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        {resolvedSeries.length > 1 && (
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          />
        )}
        {resolvedSeries.map((item) => {
          const stroke = COLORS[item.color ?? color];
          const id = `gradient-${item.key}-${item.color ?? color}`;
          return (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name}
              stroke={stroke}
              strokeWidth={2.5}
              fill={`url(#${id})`}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#FBFAF7' }}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

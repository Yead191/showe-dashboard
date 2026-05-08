import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS } from './colors';

interface DonutDatum {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

const PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.accent,
  CHART_COLORS.info,
  CHART_COLORS.success,
  CHART_COLORS.purple,
];

export function DonutChart({ data, size = 200, thickness = 22, centerLabel, centerValue }: DonutChartProps) {
  const innerRadius = (size - thickness * 2) / 2;
  const outerRadius = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            stroke="#FBFAF7"
            strokeWidth={3}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#FBFAF7',
              border: '1px solid rgba(40,37,29,0.11)',
              borderRadius: 12,
              fontFamily: "'Satoshi', sans-serif",
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && <span className="font-display font-extrabold text-2xl text-ink tabular leading-none">{centerValue}</span>}
          {centerLabel && <span className="text-[11px] uppercase tracking-wider text-ink-faint mt-1.5">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

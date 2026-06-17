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
    <div style={{ position: 'relative' }} className="w-full max-w-[180px] lg:max-w-[220px] aspect-square">
      {/* Center Text — Placed BEFORE the chart so it stays BEHIND the tooltip */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="font-display font-extrabold text-2xl text-ink tabular leading-none">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-[11px] uppercase tracking-wider text-ink-faint mt-1.5">
              {centerLabel}
            </span>
          )}
        </div>
      )}

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
            {data?.map((d, i) => (
              <Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                return (
                  <div className="bg-surface-raised border border-line p-2 rounded-sm shadow-sm backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: item.payload.color ?? item.color }}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                        {item.name}
                      </span>
                    </div>
                    <div className="font-display font-extrabold text-sm text-ink">
                      {typeof item.value === 'number' && item.value > 1000
                        ? `£${(item.value / 1000).toFixed(1)}k`
                        : item.value}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

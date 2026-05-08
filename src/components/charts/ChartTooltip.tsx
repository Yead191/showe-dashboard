import type { TooltipProps } from 'recharts';

interface ChartTooltipProps extends Omit<TooltipProps<number, string>, 'formatter'> {
  formatter?: (value: number) => string;
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: '#FBFAF7',
        border: '1px solid rgba(40, 37, 29, 0.11)',
        borderRadius: 12,
        padding: '10px 14px',
        fontFamily: "'Satoshi', sans-serif",
        boxShadow: '0 12px 32px rgba(40, 37, 29, 0.12)',
        minWidth: 140,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#9A938B',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {payload.map((entry, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            fontSize: 13,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: entry.color,
              }}
            />
            <span style={{ color: '#6C665D' }}>{entry.name}</span>
          </span>
          <strong
            style={{
              fontFamily: "'Satoshi', sans-serif",
              fontVariantNumeric: 'tabular-nums lining-nums',
              color: '#28251D',
            }}
          >
            {formatter ? formatter(entry.value as number) : entry.value}
          </strong>
        </div>
      ))}
    </div>
  );
}

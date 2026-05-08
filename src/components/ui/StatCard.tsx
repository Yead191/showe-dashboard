import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn, formatDelta } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon?: LucideIcon;
  accent?: 'primary' | 'amber' | 'success' | 'info' | 'purple';
  className?: string;
}

const ACCENTS = {
  primary: { bg: 'bg-primary/8', fg: 'text-primary' },
  amber: { bg: 'bg-accent-50', fg: 'text-[#8A5C00]' },
  success: { bg: 'bg-[#43762212]', fg: 'text-success' },
  info: { bg: 'bg-[#00649414]', fg: 'text-info' },
  purple: { bg: 'bg-[#7A39BB14]', fg: 'text-purple' },
};

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  accent = 'primary',
  className,
}: StatCardProps) {
  const a = ACCENTS[accent];
  const isUp = (delta ?? 0) >= 0;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-line bg-surface-raised p-5',
        'transition-all duration-300 ease-smooth hover:shadow-medium hover:-translate-y-0.5',
        className
      )}
    >
      {/* Subtle decorative corner */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-50 blur-2xl transition-opacity group-hover:opacity-80',
          a.bg
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <span className="eyebrow !text-ink-faint">{label}</span>
        {Icon && (
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full w-9 h-9',
              a.bg,
              a.fg
            )}
          >
            <Icon size={16} strokeWidth={2.25} />
          </span>
        )}
      </div>

      <div className="relative mt-4 flex items-baseline gap-3 flex-wrap">
        <span className="display-num text-ink">{value}</span>
        {typeof delta === 'number' && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[12px] font-semibold rounded-full px-2 py-0.5',
              isUp ? 'text-success bg-[#43762212]' : 'text-danger bg-[#B4231812]'
            )}
          >
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {formatDelta(delta)}
          </span>
        )}
      </div>

      {hint && <p className="relative mt-2 text-[13px] text-ink-muted">{hint}</p>}
    </div>
  );
}

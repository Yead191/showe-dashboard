import { cn } from '@/lib/utils';
import { TIER_META } from '@/constants/tiers';
import type { VenueTier } from '@/types/auth';

interface TierBadgeProps {
  tier: VenueTier;
  size?: 'sm' | 'md';
  showFull?: boolean;
  className?: string;
}

export function TierBadge({ tier, size = 'sm', showFull = false, className }: TierBadgeProps) {
  const meta = TIER_META[tier];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold border border-transparent',
        size === 'sm' ? 'text-[10px] px-2 py-0.5 tracking-wider uppercase' : 'text-xs px-2.5 py-1',
        className
      )}
      style={{
        color: meta.color,
        background: `${meta.color}15`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ background: meta.color }}
      />
      {showFull ? meta.label : meta.short}
    </span>
  );
}

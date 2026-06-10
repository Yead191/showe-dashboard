import { Button, Tooltip } from 'antd';
import { Check, Sparkles, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AddOn } from '@/constants/addons';
import { TIER_META } from '@/constants/tiers';
import type { VenueTier } from '@/types/auth';
import { isAddOnAvailable, isAddOnIncludedInTier } from '@/lib/access';
import { ADDON_ICONS } from '@/constants/addon-icons';

interface AddOnCardProps {
  addon: AddOn;
  tier: VenueTier;
  isActive: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

export function AddOnCard({ addon, tier, isActive, onAdd, onRemove }: AddOnCardProps) {
  const Icon = ADDON_ICONS[addon.icon] ?? Sparkles;
  const available = isAddOnAvailable(addon, tier);
  const includedInTier = isAddOnIncludedInTier(addon, tier);
  const isComingSoon = addon.status === 'coming_soon';

  const cta = (() => {
    if (includedInTier) {
      return {
        label: `Included in ${TIER_META[tier].label}`,
        disabled: true,
        action: () => { },
        variant: 'included' as const,
      };
    }
    if (isComingSoon) {
      return { label: 'Coming soon', disabled: true, action: () => { }, variant: 'soon' as const };
    }
    if (!available) {
      return { label: 'Not available on this tier', disabled: true, action: () => { }, variant: 'locked' as const };
    }
    if (isActive) {
      return { label: 'Remove add-on', disabled: false, action: onRemove, variant: 'remove' as const };
    }
    return { label: 'Add to plan', disabled: false, action: onAdd, variant: 'add' as const };
  })();

  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-surface-raised p-5 flex flex-col transition-all duration-300 hover:shadow-medium',
        isActive ? 'border-primary/40 shadow-medium ring-1 ring-primary/15' : 'border-line hover:border-line-strong',
        (isComingSoon || !available) && !includedInTier && 'opacity-90'
      )}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-[0.06] rounded-full"
        style={{ backgroundColor: addon.color }}
      />

      {isActive && (
        <span className="absolute -top-2.5 right-4 chip chip-primary !text-[10px] z-10 backdrop-blur-md">
          Active
        </span>
      )}
      {isComingSoon && (
        <span className="absolute -top-2.5 right-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-warning text-white shadow-sm z-10 flex items-center gap-1">
          <Clock size={10} /> Coming Soon
        </span>
      )}

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center border"
          style={{
            backgroundColor: `${addon.color}15`,
            borderColor: `${addon.color}30`,
            color: addon.color,
          }}
        >
          <Icon size={20} strokeWidth={2.4} />
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-display font-extrabold text-ink tabular">£{addon.price}</span>
            <span className="text-ink-faint text-xs font-medium">/ mo</span>
          </div>
        </div>
      </div>

      <h4 className="font-display font-bold text-lg text-ink leading-tight mb-1.5">{addon.label}</h4>
      <p className="text-[13px] text-ink-muted leading-snug mb-4 line-clamp-2 min-h-[36px]">{addon.description}</p>

      <ul className="space-y-2 mb-5 flex-1">
        {addon.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-[12.5px] text-ink-muted">
            <div
              className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${addon.color}15`, color: addon.color }}
            >
              <Check size={9} strokeWidth={4} />
            </div>
            <span className="leading-snug">{b}</span>
          </li>
        ))}
      </ul>

      {includedInTier ? (
        <Tooltip title={`Module ${addon.linkedModule} is included in your ${TIER_META[tier].label} tier.`}>
          <div className="flex items-center justify-center gap-2 h-11 rounded-xl bg-primary/5 border border-primary/20 text-primary font-bold text-sm">
            <Sparkles size={14} />
            {cta.label}
          </div>
        </Tooltip>
      ) : (
        <Button
          block
          size="large"
          danger={cta.variant === 'remove'}
          type={cta.variant === 'add' ? 'primary' : 'default'}
          disabled={cta.disabled}
          onClick={cta.action}
          className={cn(
            'h-11 rounded-xl font-bold text-sm',
            cta.variant === 'add' && 'shadow-md shadow-primary/15',
            cta.variant === 'locked' && 'cursor-not-allowed'
          )}
          icon={cta.variant === 'locked' ? <Lock size={13} /> : undefined}
        >
          {cta.label}
        </Button>
      )}
    </div>
  );
}

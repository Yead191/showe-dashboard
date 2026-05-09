import { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import { Check, Sparkles, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { Subscription } from '@/types';
import type { VenueTier } from '@/types/auth';
import { TIER_LIST, TIER_META } from '@/constants/tiers';
import { Avatar } from '@/components/ui';
import { cn, formatPence } from '@/lib/utils';

interface ChangeTierModalProps {
  open: boolean;
  subscription: Subscription | null;
  onClose: () => void;
  onConfirm: (subscriptionId: string, newTier: VenueTier) => void;
}

export function ChangeTierModal({
  open,
  subscription,
  onClose,
  onConfirm,
}: ChangeTierModalProps) {
  const [selected, setSelected] = useState<VenueTier | null>(null);

  useEffect(() => {
    if (open && subscription) setSelected(subscription.tier);
  }, [open, subscription]);

  if (!subscription) return null;

  const currentTier = subscription.tier;
  const currentIdx = TIER_LIST.indexOf(currentTier);
  const selectedIdx = selected ? TIER_LIST.indexOf(selected) : currentIdx;
  const direction =
    selectedIdx > currentIdx ? 'upgrade' : selectedIdx < currentIdx ? 'downgrade' : 'same';

  const directionMeta = {
    upgrade: { label: 'Upgrade', icon: ArrowUp, color: 'text-success' },
    downgrade: { label: 'Downgrade', icon: ArrowDown, color: 'text-accent' },
    same: { label: 'Current plan', icon: Minus, color: 'text-ink-faint' },
  }[direction];

  const DirIcon = directionMeta.icon;
  const newPriceMonthly = selected ? TIER_META[selected].priceMonthly : 0;
  const currentPriceMonthly = TIER_META[currentTier].priceMonthly;
  const priceDelta = newPriceMonthly - currentPriceMonthly;

  function handleConfirm() {
    if (!selected || direction === 'same' || !subscription) return;
    onConfirm(subscription.id, selected);
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Change subscription tier"
      width={760}
      centered
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-[12.5px] text-ink-muted">
            {direction === 'same' ? (
              <>Choose a different tier to continue.</>
            ) : (
              <>
                Price change:{' '}
                <span
                  className={cn(
                    'font-display font-bold',
                    priceDelta > 0 ? 'text-success' : 'text-accent'
                  )}
                >
                  {priceDelta > 0 ? '+' : ''}
                  {formatPence(priceDelta * 100)} / mo
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              disabled={direction === 'same'}
              danger={direction === 'downgrade'}
              onClick={handleConfirm}
              icon={<DirIcon size={14} />}
            >
              {direction === 'same' ? 'Same tier' : `Confirm ${directionMeta.label.toLowerCase()}`}
            </Button>
          </div>
        </div>
      }
    >
      {/* Customer header */}
      <div className="flex items-center gap-3 p-3.5  rounded-xl bg-surface-sunken border border-line">
        <Avatar name={subscription.owner_name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-ink truncate">{subscription.owner_name}</div>
          <div className="text-[12.5px] text-ink-faint truncate">{subscription.owner_email}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider font-bold text-ink-faint">
            Currently on
          </div>
          <div className="font-display font-bold text-ink">{TIER_META[currentTier].label}</div>
        </div>
      </div>

      {/* Tier grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-1 -mr-1 py-5 mt-2">
        {TIER_LIST.map((t) => {
          const meta = TIER_META[t];
          const isCurrent = t === currentTier;
          const isSelected = selected === t;
          const idx = TIER_LIST.indexOf(t);
          const dirFromCurrent =
            idx > currentIdx ? 'upgrade' : idx < currentIdx ? 'downgrade' : 'same';

          return (
            <button
              key={t}
              type="button"
              onClick={() => setSelected(t)}
              className={cn(
                'relative text-left rounded-2xl border p-4 transition-all bg-surface-raised',
                isSelected
                  ? 'border-primary shadow-medium ring-2 ring-primary/15'
                  : 'border-line hover:border-line-strong hover:shadow-soft'
              )}
            >
              {isCurrent && (
                <span className="absolute -top-2.5 right-3 chip chip-primary !text-[10px] z-10 backdrop-blur-lg">
                  Current
                </span>
              )}

              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${meta.color}18`, color: meta.color }}
                >
                  <Sparkles size={18} />
                </div>
                {isSelected && !isCurrent && (
                  <span className="w-6 h-6 rounded-full bg-primary text-ink-inverse flex items-center justify-center">
                    <Check size={13} />
                  </span>
                )}
              </div>

              <div className="font-display font-bold text-ink">{meta.label}</div>
              <div className="text-[11.5px] text-ink-faint mt-0.5 mb-3 line-clamp-1">
                {meta.audience}
              </div>

              <div className="flex items-baseline gap-1 mb-3">
                <span className="font-display font-extrabold text-xl text-ink">
                  {formatPence(meta.priceMonthly * 100)}
                </span>
                <span className="text-[11px] text-ink-faint">/ mo</span>
              </div>

              <ul className="space-y-1 text-[12.5px] text-ink-muted">
                <li>{meta.modules.length} of 10 modules</li>
                <li>{meta.can_charge ? 'Can charge for programmes' : 'Free programmes only'}</li>
              </ul>

              {!isCurrent && (
                <div
                  className={cn(
                    'mt-3 pt-3 border-t border-line text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1',
                    dirFromCurrent === 'upgrade' ? 'text-success' : 'text-accent'
                  )}
                >
                  {dirFromCurrent === 'upgrade' ? (
                    <ArrowUp size={11} />
                  ) : (
                    <ArrowDown size={11} />
                  )}
                  {dirFromCurrent === 'upgrade' ? 'Upgrade' : 'Downgrade'}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

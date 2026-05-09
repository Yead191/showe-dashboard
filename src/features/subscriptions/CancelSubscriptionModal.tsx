import { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import { AlertTriangle, Calendar, Zap } from 'lucide-react';
import type { Subscription } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { TIER_META } from '@/constants/tiers';
import { Avatar } from '@/components/ui';

export type CancelMode = 'period_end' | 'immediate';

interface CancelSubscriptionModalProps {
  open: boolean;
  subscription: Subscription | null;
  onClose: () => void;
  onConfirm: (subscriptionId: string, mode: CancelMode) => void;
  loading?: boolean;
}

export function CancelSubscriptionModal({
  open,
  subscription,
  onClose,
  onConfirm,
  loading = false,
}: CancelSubscriptionModalProps) {
  const [mode, setMode] = useState<CancelMode>('period_end');

  useEffect(() => {
    if (open) setMode('period_end');
  }, [open]);

  if (!subscription) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={520}
      centered
      footer={null}
      closable={!loading}
      maskClosable={!loading}
      className="premium-modal"
    >
      <div className="pt-1 pb-2">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-danger/10 text-danger flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-extrabold text-xl text-ink leading-tight">
              Cancel subscription?
            </h3>
            <p className="text-sm text-ink-muted mt-1">
              This will end the customer's access to{' '}
              <span className="text-ink font-semibold">{TIER_META[subscription.tier].label}</span>{' '}
              tier features.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 mb-5 rounded-xl bg-surface-sunken border border-line">
          <Avatar name={subscription.owner_name} size={40} />
          <div className="min-w-0">
            <div className="font-semibold text-ink truncate">{subscription.owner_name}</div>
            <div className="text-[12.5px] text-ink-faint truncate">{subscription.owner_email}</div>
          </div>
        </div>

        <div className="space-y-2.5 mb-6">
          <ModeOption
            checked={mode === 'period_end'}
            onSelect={() => setMode('period_end')}
            icon={Calendar}
            title="Cancel at period end"
            description={`Customer keeps access until ${formatDate(subscription.current_period_end)}. No refund issued.`}
            tone="default"
          />
          <ModeOption
            checked={mode === 'immediate'}
            onSelect={() => setMode('immediate')}
            icon={Zap}
            title="Cancel immediately"
            description="Access is revoked now. The customer drops to Tier 1 and any pro-rata credit is forfeited."
            tone="danger"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button onClick={onClose} disabled={loading}>
            Keep subscription
          </Button>
          <Button
            danger
            type="primary"
            loading={loading}
            onClick={() => onConfirm(subscription.id, mode)}
          >
            {mode === 'immediate' ? 'Cancel now' : 'Cancel at period end'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ModeOption({
  checked,
  onSelect,
  icon: Icon,
  title,
  description,
  tone,
}: {
  checked: boolean;
  onSelect: () => void;
  icon: typeof Calendar;
  title: string;
  description: string;
  tone: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all',
        checked
          ? tone === 'danger'
            ? 'border-danger/40 bg-danger/5 ring-2 ring-danger/15'
            : 'border-primary bg-primary/5 ring-2 ring-primary/15'
          : 'border-line hover:border-line-strong bg-surface-raised'
      )}
    >
      <span
        className={cn(
          'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          checked
            ? tone === 'danger'
              ? 'border-danger'
              : 'border-primary'
            : 'border-line-strong'
        )}
      >
        {checked && (
          <span
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              tone === 'danger' ? 'bg-danger' : 'bg-primary'
            )}
          />
        )}
      </span>
      <span
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
          tone === 'danger' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'
        )}
      >
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-ink text-sm">{title}</span>
        <span className="block text-[12.5px] text-ink-muted leading-relaxed mt-0.5">
          {description}
        </span>
      </span>
    </button>
  );
}

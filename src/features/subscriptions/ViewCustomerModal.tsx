import { Modal, Button } from 'antd';
import { Mail, Calendar, RefreshCw, CreditCard, Hash, User as UserIcon } from 'lucide-react';
import type { Subscription } from '@/types';
import { Avatar, TierBadge, StatusBadge } from '@/components/ui';
import { TIER_META } from '@/constants/tiers';
import { formatDate, formatPence } from '@/lib/utils';

interface ViewCustomerModalProps {
  open: boolean;
  subscription: Subscription | null;
  onClose: () => void;
}

export function ViewCustomerModal({ open, subscription, onClose }: ViewCustomerModalProps) {
  if (!subscription) return null;
  const meta = TIER_META[subscription.tier];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Customer details"
      width={560}
      centered
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={subscription.owner_name} size={56} ring />
        <div className="min-w-0">
          <h3 className="font-display font-extrabold text-xl text-ink leading-tight truncate">
            {subscription.owner_name}
          </h3>
          <a
            href={`mailto:${subscription.owner_email}`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-primary mt-0.5 truncate"
          >
            <Mail size={13} />
            {subscription.owner_email}
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface-sunken p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="eyebrow !text-ink-faint">Plan</span>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <TierBadge tier={subscription.tier} showFull />
          <StatusBadge status={subscription.status} />
        </div>
        <p className="text-[13px] text-ink-muted leading-relaxed">{meta.description}</p>
      </div>

      <ul className="space-y-3">
        <Row icon={CreditCard} label="Billing">
          <span className="capitalize text-ink font-medium">{subscription.interval}</span>
          <span className="text-ink-muted"> · </span>
          <span className="font-display font-bold text-ink">
            {formatPence(subscription.amount_pence)}
          </span>
        </Row>
        <Row icon={RefreshCw} label="Current period">
          {formatDate(subscription.current_period_start)} →{' '}
          {formatDate(subscription.current_period_end)}
        </Row>
        <Row icon={Calendar} label="Next billing">
          {subscription.status === 'cancelled' || subscription.cancel_at_period_end ? (
            <span className="text-ink-muted">
              {subscription.cancel_at_period_end
                ? `Cancels on ${formatDate(subscription.current_period_end)}`
                : 'No upcoming billing'}
            </span>
          ) : (
            formatDate(subscription.next_billing_at)
          )}
        </Row>
        <Row icon={UserIcon} label="Owner ID" mono>
          {subscription.owner_id}
        </Row>
        <Row icon={Hash} label="Subscription ID" mono>
          {subscription.id}
        </Row>
        <Row icon={Calendar} label="Customer since">
          {formatDate(subscription.created_at)}
        </Row>
      </ul>
    </Modal>
  );
}

function Row({
  icon: Icon,
  label,
  mono,
  children,
}: {
  icon: typeof Mail;
  label: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-full bg-primary/8 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider font-bold text-ink-faint mb-0.5">
          {label}
        </div>
        <div className={mono ? 'font-mono text-[13px] text-ink' : 'text-sm text-ink'}>
          {children}
        </div>
      </div>
    </li>
  );
}

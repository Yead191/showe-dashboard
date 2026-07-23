import { Modal, Button } from 'antd';
import {
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Hash,
  Layers,
  Puzzle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Avatar, StatusBadge } from '@/components/ui';
import { MODULE_CATALOGUE } from '@/constants/module-blocks';
import { formatDate, formatGBP } from '@/lib/utils';
import { useGetAddOnsQuery } from '@/store/api/addOnsApi';
import type { ApiSubscribedUser } from '@/store/api/subscribedUserApi';

interface SubscriptionDetailsModalProps {
  open: boolean;
  subscription: ApiSubscribedUser | null;
  onClose: () => void;
}

function moduleLabel(moduleNumber: number): string {
  const meta = MODULE_CATALOGUE.find((m) => m.number === moduleNumber);
  return meta?.label ?? `Module ${moduleNumber}`;
}

export function SubscriptionDetailsModal({
  open,
  subscription,
  onClose,
}: SubscriptionDetailsModalProps) {
  const { data: addOns = [], isLoading: addOnsLoading } = useGetAddOnsQuery(undefined, {
    skip: !open,
  });

  if (!subscription) return null;

  const modules = [...(subscription.modules ?? [])].sort((a, b) => a - b);
  const addonIds = subscription.addons ?? [];
  const hasAddOns = addonIds.length > 0;

  const resolvedAddOns = addonIds.map((id) => {
    const match = addOns.find((addon) => addon._id === id);
    return {
      id,
      label: match?.label ?? id,
      short: match?.short,
      priceMonthly: match?.priceMonthly,
      color: match?.color,
    };
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Subscription details"
      width={640}
      centered
      className="premium-modal"
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="flex items-center gap-4 mb-5">
        <Avatar name={subscription.user.name} size={56} ring />
        <div className="min-w-0">
          <h3 className="font-display font-extrabold text-xl text-ink leading-tight truncate">
            {subscription.user.name}
          </h3>
          <a
            href={`mailto:${subscription.user.email}`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-primary mt-0.5 truncate"
          >
            <Mail size={13} />
            {subscription.user.email}
          </a>
          {subscription.user.phone && (
            <div className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint mt-0.5">
              <Phone size={12} />
              {subscription.user.phone}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface-sunken p-4 mb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="chip capitalize">{subscription.name}</span>
          <StatusBadge status={subscription.status === 'active' ? 'active' : 'cancelled'} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Meta label="Price" value={formatGBP(subscription.price)} />
          <Meta label="Start" value={formatDate(subscription.startDate)} />
          <Meta
            label="Renews"
            value={subscription.status === 'inactive' ? '—' : formatDate(subscription.endDate)}
          />
          <Meta label="Venues" value={String(subscription.vanues ?? '—')} />
          <Meta label="Programmes" value={String(subscription.programmes ?? '—')} />
          <Meta
            label="Programme sell"
            value={subscription.is_proggramme_sell ? 'Enabled' : 'Disabled'}
          />
        </div>
      </div>

      <ul className="space-y-3 mb-5">
        <Row icon={Hash} label="Transaction ID" mono>
          {subscription.txId || '—'}
        </Row>
        <Row icon={Hash} label="Subscription ID" mono>
          {subscription._id}
        </Row>
        <Row icon={CreditCard} label="Package ID" mono>
          {subscription.package?._id || '—'}
        </Row>
        <Row icon={Calendar} label="Created">
          {formatDate(subscription.createdAt)}
        </Row>
      </ul>

      <section className="mb-5 rounded-xl border border-line p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={15} className="text-primary" />
          <h4 className="text-sm font-bold text-ink">
            Modules access ({modules.length}/10)
          </h4>
        </div>
        {modules.length === 0 ? (
          <p className="text-[13px] text-ink-muted">No modules unlocked on this subscription.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {modules.map((moduleNumber) => (
              <span
                key={moduleNumber}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-[12px] font-semibold text-ink"
              >
                <span className="text-primary font-bold">{moduleNumber}</span>
                {moduleLabel(moduleNumber)}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-line p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Puzzle size={15} className="text-accent" />
            <h4 className="text-sm font-bold text-ink">Add-ons</h4>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
              hasAddOns
                ? 'bg-[rgba(67,122,34,0.12)] text-[#437A22]'
                : 'bg-[rgba(40,37,29,0.08)] text-[#6C665D]'
            }`}
          >
            {hasAddOns ? (
              <>
                <CheckCircle2 size={11} /> Yes · {addonIds.length}
              </>
            ) : (
              <>
                <XCircle size={11} /> None
              </>
            )}
          </span>
        </div>

        {!hasAddOns ? (
          <p className="text-[13px] text-ink-muted">No add-ons purchased on this subscription.</p>
        ) : addOnsLoading ? (
          <p className="text-[13px] text-ink-muted">Loading add-on details…</p>
        ) : (
          <ul className="space-y-2">
            {resolvedAddOns.map((addon) => (
              <li
                key={addon.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-raised px-3 py-2.5"
              >
                <div className="min-w-0 flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: addon.color || '#6C665D' }}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">{addon.label}</div>
                    {addon.short && (
                      <div className="text-[11px] text-ink-faint uppercase tracking-wider">
                        {addon.short}
                      </div>
                    )}
                  </div>
                </div>
                {typeof addon.priceMonthly === 'number' && (
                  <span className="text-sm font-display font-bold text-ink shrink-0">
                    {formatGBP(addon.priceMonthly)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </Modal>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-bold text-ink-faint">{label}</div>
      <div className="text-sm font-semibold text-ink mt-0.5">{value}</div>
    </div>
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
        <div className={mono ? 'font-mono text-[13px] text-ink break-all' : 'text-sm text-ink'}>
          {children}
        </div>
      </div>
    </li>
  );
}

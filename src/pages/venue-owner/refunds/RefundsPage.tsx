import { useMemo, useState } from 'react';
import { Tabs, Button, Modal } from 'antd';
import { Check, X, AlertTriangle, RefreshCcw, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, StatusBadge, Avatar, EmptyState } from '@/components/ui';
import { useScopedVenueData } from '@/hooks/useScopedVenueData';
import type { RefundRequest, RefundStatus } from '@/types';
import { formatPence, timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

const REASON_LABEL: Record<string, string> = {
  event_cancelled: 'Event cancelled',
  duplicate_purchase: 'Duplicate purchase',
  technical_issue: 'Technical issue',
  changed_mind: 'Changed mind',
  not_as_described: 'Not as described',
  other: 'Other',
};

export default function RefundsPage() {
  const { refunds } = useScopedVenueData();
  const [statusKey, setStatusKey] = useState<RefundStatus | 'all'>('pending');
  const [selected, setSelected] = useState<RefundRequest | null>(null);
  const [action, setAction] = useState<'approve' | 'decline' | null>(null);
  const [responseNote, setResponseNote] = useState('');

  const filtered = useMemo(() => {
    if (statusKey === 'all') return refunds;
    return refunds.filter((r) => r.status === statusKey);
  }, [refunds, statusKey]);

  const counts = useMemo(() => {
    const acc: Record<string, number> = { all: refunds.length };
    for (const r of refunds) acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, [refunds]);

  function openAction(r: RefundRequest, type: 'approve' | 'decline') {
    setSelected(r);
    setAction(type);
    setResponseNote('');
  }

  function confirmAction() {
    if (!selected || !action) return;
    toast.success(
      action === 'approve' ? 'Refund approved and processed.' : 'Refund declined and customer notified.'
    );
    setSelected(null);
    setAction(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="Refunds"
        title="Refund inbox"
        description="Audience refund requests for your programmes. Pending requests escalate to SHOWE admin if unanswered for 7 days."
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 stagger">
        <SummaryCard
          icon={RefreshCcw}
          label="Pending"
          value={counts.pending ?? 0}
          tone="amber"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Auto-escalated"
          value={counts.auto_escalated ?? 0}
          tone="danger"
        />
        <SummaryCard icon={Check} label="Approved" value={counts.approved ?? 0} tone="success" />
        <SummaryCard icon={X} label="Declined" value={counts.declined ?? 0} tone="muted" />
      </div>

      <Panel padded={false} className="overflow-hidden">
        <div className="px-5 pt-4 border-b border-line">
          <Tabs
            activeKey={statusKey}
            onChange={(k) => setStatusKey(k as RefundStatus | 'all')}
            items={[
              { key: 'pending', label: tabLabel('Pending', counts.pending) },
              { key: 'auto_escalated', label: tabLabel('Escalated', counts.auto_escalated) },
              { key: 'approved', label: tabLabel('Approved', counts.approved) },
              { key: 'declined', label: tabLabel('Declined', counts.declined) },
              { key: 'all', label: tabLabel('All', counts.all) },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={RefreshCcw}
            title="No refunds in this view"
            description="When users request refunds, you’ll see them here."
          />
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((r) => {
              const isPending = r.status === 'pending';
              const isEscalated = r.status === 'auto_escalated';
              const daysToEscalate = Math.max(
                0,
                Math.ceil(
                  (new Date(r.escalate_at).getTime() - new Date('2026-05-08T10:00:00Z').getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              );

              return (
                <li key={r.id} className="p-5 hover:bg-surface-sunken/60 transition-colors">
                  <div className="flex items-start gap-4">
                    <Avatar src={r.user_avatar} name={r.user_name} size={44} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink">{r.user_name}</span>
                        <span className="text-ink-faint text-sm">requested a refund of</span>
                        <span className="font-display font-bold tabular text-ink">
                          {formatPence(r.amount_pence)}
                        </span>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="mt-1 text-sm text-ink-muted">
                        For{' '}
                        <span className="text-ink font-medium">{r.programme_title}</span> ·{' '}
                        {r.venue_name}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] text-ink-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="chip">{REASON_LABEL[r.reason] ?? r.reason}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} className="text-ink-faint" /> {timeAgo(r.requested_at)}
                        </span>
                        {isPending && (
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5',
                              daysToEscalate <= 1 ? 'text-danger' : 'text-warning'
                            )}
                          >
                            <AlertTriangle size={11} />
                            Escalates in {daysToEscalate} day{daysToEscalate !== 1 ? 's' : ''}
                          </span>
                        )}
                        {isEscalated && (
                          <span className="text-danger font-semibold">
                            Awaiting SHOWE admin
                          </span>
                        )}
                      </div>

                      {r.reason_note && (
                        <div className="mt-3 rounded-lg bg-surface-sunken px-3 py-2 text-[13px] text-ink-muted border-l-2 border-primary/30">
                          <MessageSquare size={11} className="inline mr-1.5 text-ink-faint" />
                          {r.reason_note}
                        </div>
                      )}

                      {r.response_note && (
                        <div className="mt-3 text-[13px] text-ink-muted">
                          <span className="font-semibold text-ink">{r.responded_by}:</span>{' '}
                          {r.response_note}
                        </div>
                      )}
                    </div>

                    {(isPending || isEscalated) && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          type="primary"
                          size="small"
                          icon={<Check size={13} />}
                          onClick={() => openAction(r, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          icon={<X size={13} />}
                          onClick={() => openAction(r, 'decline')}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Modal
        open={!!action}
        onCancel={() => setAction(null)}
        title={action === 'approve' ? 'Approve refund' : 'Decline refund'}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setAction(null)}>Cancel</Button>
            <Button
              type="primary"
              danger={action === 'decline'}
              onClick={confirmAction}
            >
              {action === 'approve' ? 'Approve & refund' : 'Decline refund'}
            </Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-lg bg-surface-sunken p-3">
              <div className="text-[12px] uppercase tracking-wider text-ink-faint font-bold">
                Customer
              </div>
              <div className="font-semibold text-ink mt-1">{selected.user_name}</div>
              <div className="text-[13px] text-ink-muted">{selected.user_email}</div>
              <div className="mt-2 text-sm">
                <span className="text-ink-muted">Programme: </span>
                <span className="font-semibold text-ink">{selected.programme_title}</span>
              </div>
              <div className="mt-1 text-sm">
                <span className="text-ink-muted">Amount: </span>
                <span className="font-display font-bold tabular text-ink">
                  {formatPence(selected.amount_pence)}
                </span>
              </div>
            </div>

            <div>
              <label className="field-label">
                {action === 'approve' ? 'Note to customer (optional)' : 'Reason for declining'}
              </label>
              <textarea
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                rows={3}
                className="input-base !h-auto py-2.5"
                placeholder={
                  action === 'approve'
                    ? 'e.g. Sorry the show was cancelled — refund processed.'
                    : 'e.g. Outside the cancellation window.'
                }
              />
            </div>

            {action === 'approve' && (
              <div className="rounded-lg bg-success/8 border border-success/20 px-3 py-2.5 text-[13px] text-success">
                The customer will receive {formatPence(selected.amount_pence)} via their original
                payment method within 5–10 business days.
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

function tabLabel(label: string, count = 0) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
        {count}
      </span>
    </span>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Check;
  label: string;
  value: number;
  tone: 'amber' | 'danger' | 'success' | 'muted';
}) {
  const styles = {
    amber: { bg: 'bg-accent-50', fg: 'text-[#8A5C00]', dot: '#F5A800' },
    danger: { bg: 'bg-[#B4231812]', fg: 'text-danger', dot: '#B42318' },
    success: { bg: 'bg-[#43762212]', fg: 'text-success', dot: '#437A22' },
    muted: { bg: 'bg-surface-sunken', fg: 'text-ink-muted', dot: '#9A938B' },
  }[tone];
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-4">
      <div className="flex items-start justify-between">
        <span className={cn('inline-flex w-9 h-9 rounded-full items-center justify-center', styles.bg, styles.fg)}>
          <Icon size={15} />
        </span>
        <span className="status-dot relative" style={{ color: styles.dot, background: styles.dot }} />
      </div>
      <div className="font-display font-extrabold tabular text-3xl text-ink mt-3 leading-none">
        {value}
      </div>
      <div className="text-[12px] uppercase tracking-wider font-bold text-ink-faint mt-1.5">
        {label}
      </div>
    </div>
  );
}

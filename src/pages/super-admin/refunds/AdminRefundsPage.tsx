import { useState, useMemo } from 'react';
import { Tabs, Button } from 'antd';
import { Check, X, AlertTriangle, RefreshCcw, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, Avatar, StatusBadge, EmptyState } from '@/components/ui';
import type { RefundRequest } from '@/types';
import { mockRefundRequests } from '@/constants/mock-data';
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

export default function AdminRefundsPage() {
  const [tab, setTab] = useState<'auto_escalated' | 'pending' | 'all'>('auto_escalated');

  const filtered = useMemo(() => {
    if (tab === 'all') return mockRefundRequests;
    return mockRefundRequests.filter((r) => r.status === tab);
  }, [tab]);

  return (
    <>
      <PageHeader
        eyebrow="Money"
        title="Refunds oversight"
        description="Auto-escalated and platform-level refunds. You can override any decision and process refunds directly."
      />

      <Panel padded={false} className="overflow-hidden">
        <div className="px-5 pt-4 border-b border-line">
          <Tabs
            activeKey={tab}
            onChange={(k) => setTab(k as typeof tab)}
            items={[
              { key: 'auto_escalated', label: tabLabel('Escalated', mockRefundRequests.filter((r) => r.status === 'auto_escalated').length) },
              { key: 'pending', label: tabLabel('Venue pending', mockRefundRequests.filter((r) => r.status === 'pending').length) },
              { key: 'all', label: tabLabel('All', mockRefundRequests.length) },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={RefreshCcw} title="No refunds in this view" description="Auto-escalated refunds will appear here." />
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((r) => <RefundRow key={r.id} r={r} />)}
          </ul>
        )}
      </Panel>
    </>
  );
}

function RefundRow({ r }: { r: RefundRequest }) {
  const isEscalated = r.status === 'auto_escalated';
  return (
    <li className={cn('p-5 transition-colors', isEscalated ? 'bg-warning/5' : 'hover:bg-surface-sunken/50')}>
      <div className="flex items-start gap-4">
        <Avatar src={r.user_avatar} name={r.user_name} size={44} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-ink">{r.user_name}</span>
            <span className="text-ink-faint text-sm">refund of</span>
            <span className="font-display font-bold tabular text-ink">{formatPence(r.amount_pence)}</span>
            <StatusBadge status={r.status} />
            {isEscalated && (
              <span className="chip chip-danger">
                <AlertTriangle size={10} />
                Awaiting admin
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-ink-muted">
            <span className="text-ink font-medium">{r.programme_title}</span> · {r.venue_name}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] text-ink-muted">
            <span className="chip">{REASON_LABEL[r.reason] ?? r.reason}</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={11} className="text-ink-faint" /> Requested {timeAgo(r.requested_at)}
            </span>
          </div>
          {r.reason_note && (
            <div className="mt-3 rounded-lg bg-surface-sunken px-3 py-2 text-[13px] text-ink-muted border-l-2 border-primary/30">
              {r.reason_note}
            </div>
          )}
        </div>
        {(r.status === 'pending' || isEscalated) && (
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              type="primary"
              size="small"
              icon={<Check size={13} />}
              onClick={() => toast.success('Refund approved (admin override).')}
            >
              Approve
            </Button>
            <Button size="small" icon={<X size={13} />} onClick={() => toast.success('Refund declined.')}>
              Decline
            </Button>
          </div>
        )}
      </div>
    </li>
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

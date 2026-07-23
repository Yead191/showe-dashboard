import { cn } from '@/lib/utils';

type Status =
  | 'active'
  | 'inactive'
  | 'published'
  | 'draft'
  | 'archived'
  | 'cancelled'
  | 'pending'
  | 'suspended'
  | 'past_due'
  | 'trialing'
  | 'succeeded'
  | 'failed'
  | 'approved'
  | 'declined'
  | 'auto_escalated'
  | 'resolved_by_admin'
  | 'refunded';

interface StatusBadgeProps {
  status: Status | string | null | undefined;
  className?: string;
}

const STATUS_STYLES: Record<Status, { label: string; bg: string; fg: string; dot: string }> = {
  active: { label: 'Active', bg: 'rgba(67,122,34,0.12)', fg: '#437A22', dot: '#437A22' },
  inactive: { label: 'Inactive', bg: 'rgba(40,37,29,0.08)', fg: '#6C665D', dot: '#9A938B' },
  published: { label: 'Published', bg: 'rgba(67,122,34,0.12)', fg: '#437A22', dot: '#437A22' },
  draft: { label: 'Draft', bg: 'rgba(40,37,29,0.08)', fg: '#6C665D', dot: '#9A938B' },
  archived: { label: 'Archived', bg: 'rgba(40,37,29,0.08)', fg: '#6C665D', dot: '#6C665D' },
  cancelled: { label: 'Cancelled', bg: 'rgba(180,35,24,0.10)', fg: '#B42318', dot: '#B42318' },
  pending: { label: 'Pending', bg: 'rgba(218,113,1,0.12)', fg: '#DA7101', dot: '#DA7101' },
  suspended: { label: 'Suspended', bg: 'rgba(180,35,24,0.10)', fg: '#B42318', dot: '#B42318' },
  past_due: { label: 'Past due', bg: 'rgba(218,113,1,0.14)', fg: '#DA7101', dot: '#DA7101' },
  trialing: { label: 'Trial', bg: 'rgba(0,100,148,0.10)', fg: '#006494', dot: '#006494' },
  succeeded: { label: 'Succeeded', bg: 'rgba(67,122,34,0.12)', fg: '#437A22', dot: '#437A22' },
  failed: { label: 'Failed', bg: 'rgba(180,35,24,0.10)', fg: '#B42318', dot: '#B42318' },
  approved: { label: 'Approved', bg: 'rgba(67,122,34,0.12)', fg: '#437A22', dot: '#437A22' },
  declined: { label: 'Declined', bg: 'rgba(40,37,29,0.08)', fg: '#6C665D', dot: '#9A938B' },
  auto_escalated: { label: 'Escalated', bg: 'rgba(218,113,1,0.14)', fg: '#DA7101', dot: '#DA7101' },
  resolved_by_admin: { label: 'Resolved by admin', bg: 'rgba(0,100,148,0.10)', fg: '#006494', dot: '#006494' },
  refunded: { label: 'Refunded', bg: 'rgba(122,57,187,0.10)', fg: '#7A39BB', dot: '#7A39BB' },
};

function formatUnknownStatus(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  return status
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s =
    status && status in STATUS_STYLES
      ? STATUS_STYLES[status as Status]
      : {
          label: formatUnknownStatus(status),
          bg: 'rgba(40,37,29,0.08)',
          fg: '#6C665D',
          dot: '#9A938B',
        };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider',
        'px-2.5 py-1',
        className
      )}
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

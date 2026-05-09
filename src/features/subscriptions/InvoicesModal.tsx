import { useMemo } from 'react';
import { Modal, Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { Subscription } from '@/types';
import { formatDate, formatPence, cn } from '@/lib/utils';
import { Avatar } from '@/components/ui';
import { TIER_META } from '@/constants/tiers';
import { buildMockInvoices, type Invoice, type InvoiceStatus } from './types';

interface InvoicesModalProps {
  open: boolean;
  subscription: Subscription | null;
  onClose: () => void;
}

const STATUS_STYLE: Record<InvoiceStatus, { label: string; bg: string; fg: string }> = {
  paid: { label: 'Paid', bg: 'bg-success/12', fg: 'text-success' },
  open: { label: 'Open', bg: 'bg-accent/12', fg: 'text-accent' },
  void: { label: 'Void', bg: 'bg-surface-sunken', fg: 'text-ink-faint' },
  uncollectible: { label: 'Uncollectible', bg: 'bg-danger/10', fg: 'text-danger' },
};

export function InvoicesModal({ open, subscription, onClose }: InvoicesModalProps) {
  const invoices = useMemo(
    () => (subscription ? buildMockInvoices(subscription) : []),
    [subscription]
  );

  if (!subscription) return null;

  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount_pence, 0);

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Invoice',
      dataIndex: 'number',
      render: (n) => (
        <span className="inline-flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-surface-sunken flex items-center justify-center text-ink-muted">
            <FileText size={13} />
          </span>
          <span className="font-mono text-[12.5px] text-ink">{n}</span>
        </span>
      ),
    },
    {
      title: 'Issued',
      dataIndex: 'issued_at',
      width: 130,
      render: (d) => <span className="text-[12.5px] text-ink-muted">{formatDate(d)}</span>,
    },
    {
      title: 'Period',
      width: 200,
      render: (_, r) => (
        <span className="text-[12.5px] text-ink-muted">
          {formatDate(r.period_start)} — {formatDate(r.period_end)}
        </span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount_pence',
      width: 110,
      render: (v) => (
        <span className="font-display font-bold tabular text-ink">{formatPence(v)}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (s: InvoiceStatus) => {
        const style = STATUS_STYLE[s];
        return (
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider',
              style.bg,
              style.fg
            )}
          >
            {style.label}
          </span>
        );
      },
    },
    {
      title: '',
      width: 100,
      align: 'right',
      render: (_, r) => (
        <Button
          size="small"
          type="text"
          icon={<Download size={13} />}
          onClick={() => toast.success(`Downloading ${r.number} (mock)`)}
        >
          PDF
        </Button>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Invoices"
      width={820}
      centered
      footer={
        <div className="flex items-center justify-between">
          <div className="text-[12.5px] text-ink-muted">
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} ·{' '}
            <span className="text-ink font-semibold">{formatPence(totalPaid)}</span> paid lifetime
          </div>
          <Button onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="flex items-center gap-3 p-3.5 mb-5 rounded-xl bg-surface-sunken border border-line">
        <Avatar name={subscription.owner_name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-ink truncate">{subscription.owner_name}</div>
          <div className="text-[12.5px] text-ink-faint truncate">{subscription.owner_email}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider font-bold text-ink-faint">
            Plan · {subscription.interval}
          </div>
          <div className="font-display font-bold text-ink">
            {TIER_META[subscription.tier].label}
          </div>
        </div>
      </div>

      <Table
        rowKey="id"
        size="small"
        dataSource={invoices}
        columns={columns}
        pagination={false}
        scroll={{ x: 720, y: 360 }}
      />
    </Modal>
  );
}

import { Table, Button, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { Search, Download, TrendingUp, Banknote, RefreshCcw, ArrowDownToLine } from 'lucide-react';
import { PageHeader, Panel, StatCard, StatusBadge } from '@/components/ui';
import { mockTransactions } from '@/constants/mock-data';
import type { Transaction } from '@/types';
import { formatPence, formatDateTime } from '@/lib/utils';

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | Transaction['type']>('all');

  const filtered = useMemo(() => {
    return mockTransactions.filter((t) => {
      if (tab !== 'all' && t.type !== tab) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.user_name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tab, search]);

  const totals = useMemo(() => {
    const succeeded = mockTransactions.filter((t) => t.status === 'succeeded');
    return {
      gross: succeeded.reduce((s, t) => s + t.amount_pence, 0),
      fees: succeeded.reduce((s, t) => s + t.fee_pence, 0),
      net: succeeded.reduce((s, t) => s + t.net_pence, 0),
      failed: mockTransactions.filter((t) => t.status === 'failed').length,
    };
  }, []);

  const columns: ColumnsType<Transaction> = [
    {
      title: 'Description',
      dataIndex: 'description',
      render: (_, r) => (
        <div>
          <div className="font-semibold text-ink truncate">{r.description}</div>
          <div className="text-[12.5px] text-ink-faint">{r.id}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 130,
      render: (t: string) => <span className="chip capitalize">{t.replace('_', ' ')}</span>,
    },
    { title: 'User', dataIndex: 'user_name', width: 150, render: (v) => <span className="text-sm">{v ?? '—'}</span> },
    { title: 'Venue', dataIndex: 'venue_name', width: 200, render: (v) => <span className="text-sm text-ink-muted">{v ?? '—'}</span> },
    {
      title: 'Amount',
      dataIndex: 'amount_pence',
      width: 100,
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{formatPence(v)}</span>,
    },
    {
      title: 'SHOWE fee',
      dataIndex: 'fee_pence',
      width: 100,
      render: (v: number) => (
        <span className="font-display tabular text-ink-muted">{v > 0 ? formatPence(v) : '—'}</span>
      ),
    },
    {
      title: 'Net',
      dataIndex: 'net_pence',
      width: 100,
      render: (v: number) => <span className="font-display font-bold tabular text-success">{formatPence(v)}</span>,
    },
    { title: 'Status', dataIndex: 'status', width: 110, render: (s) => <StatusBadge status={s as 'succeeded' | 'failed'} /> },
    { title: 'Date', dataIndex: 'created_at', width: 160, render: (d) => <span className="text-[12.5px] text-ink-muted">{formatDateTime(d)}</span> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Money"
        title="Payments"
        description="Every transaction across the platform — programme purchases (with 10% commission split) and subscription renewals."
        actions={<Button icon={<Download size={14} />}>Export</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7 stagger">
        <StatCard label="Gross volume" value={formatPence(totals.gross)} delta={14.4} icon={Banknote} accent="primary" />
        <StatCard label="SHOWE commission" value={formatPence(totals.fees)} delta={12.8} icon={TrendingUp} accent="amber" />
        <StatCard label="Venue payouts" value={formatPence(totals.net)} delta={14.0} icon={ArrowDownToLine} accent="success" />
        <StatCard label="Failed payments" value={String(totals.failed)} icon={RefreshCcw} accent="info" />
      </div>

      <Panel padded={false} className="overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-line">
          <Tabs
            activeKey={tab}
            onChange={(k) => setTab(k as typeof tab)}
            items={[
              { key: 'all', label: 'All' },
              { key: 'programme_purchase', label: 'Programmes' },
              { key: 'subscription', label: 'Subscriptions' },
              { key: 'refund', label: 'Refunds' },
              { key: 'payout', label: 'Payouts' },
            ]}
          />
          <div className="ml-auto relative max-w-xs w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions"
              className="input-base !h-10 pl-10"
            />
          </div>
        </div>

        <Table rowKey="id" dataSource={filtered} columns={columns} pagination={{ pageSize: 8, showSizeChanger: false }} scroll={{ x: 1200 }} />
      </Panel>
    </>
  );
}

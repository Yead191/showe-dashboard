import { Table, Button, Dropdown, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState, useMemo } from 'react';
import { MoreHorizontal, Search, ArrowUpDown, CreditCard, TrendingUp } from 'lucide-react';
import { PageHeader, Panel, StatCard, TierBadge, StatusBadge, Avatar } from '@/components/ui';
import { mockSubscriptions } from '@/constants/mock-data';
import type { Subscription } from '@/types';
import { formatPence, formatDate } from '@/lib/utils';

export default function AdminSubscriptionsPage() {
  const [search, setSearch] = useState('');
  const [statusKey, setStatusKey] = useState('all');

  const filtered = useMemo(() => {
    return mockSubscriptions.filter((s) => {
      if (statusKey !== 'all' && s.status !== statusKey) return false;
      if (search && !s.owner_name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, statusKey]);

  const totals = useMemo(() => {
    const active = mockSubscriptions.filter((s) => s.status === 'active');
    const mrr = active.reduce((sum, s) => sum + (s.interval === 'annual' ? s.amount_pence / 12 : s.amount_pence), 0);
    return {
      mrr,
      active: active.length,
      pastDue: mockSubscriptions.filter((s) => s.status === 'past_due').length,
      trialing: mockSubscriptions.filter((s) => s.status === 'trialing').length,
    };
  }, []);

  const columns: ColumnsType<Subscription> = [
    {
      title: 'Owner',
      dataIndex: 'owner_name',
      render: (_, r) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={r.owner_name} size={36} />
          <div className="min-w-0">
            <div className="font-semibold text-ink truncate">{r.owner_name}</div>
            <div className="text-[12.5px] text-ink-faint truncate">{r.owner_email}</div>
          </div>
        </div>
      ),
    },
    { title: 'Tier', dataIndex: 'tier', width: 110, render: (t) => <TierBadge tier={t} /> },
    {
      title: 'Billing',
      dataIndex: 'interval',
      width: 100,
      render: (i: string) => <span className="capitalize text-sm text-ink-muted">{i}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount_pence',
      width: 110,
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{formatPence(v)}</span>,
    },
    { title: 'Status', dataIndex: 'status', width: 130, render: (s) => <StatusBadge status={s as 'active' | 'past_due' | 'trialing' | 'cancelled'} /> },
    {
      title: 'Renews',
      dataIndex: 'next_billing_at',
      width: 130,
      render: (d) => <span className="text-[12.5px] text-ink-muted">{formatDate(d)}</span>,
    },
    {
      title: '',
      width: 50,
      align: 'right',
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View customer' },
              { key: 'change-tier', label: 'Change tier' },
              { key: 'invoice', label: 'View invoices' },
              { type: 'divider' },
              { key: 'cancel', label: 'Cancel subscription', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreHorizontal size={15} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Money"
        title="Subscriptions"
        description="All venue subscriptions across the platform."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7 stagger">
        <StatCard label="MRR" value={formatPence(totals.mrr)} delta={6.2} icon={TrendingUp} accent="primary" />
        <StatCard label="Active" value={String(totals.active)} icon={CreditCard} accent="success" />
        <StatCard label="Past due" value={String(totals.pastDue)} icon={ArrowUpDown} accent="amber" />
        <StatCard label="Trialing" value={String(totals.trialing)} icon={CreditCard} accent="info" />
      </div>

      <Panel padded={false} className="overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-line">
          <Tabs
            activeKey={statusKey}
            onChange={setStatusKey}
            items={[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'past_due', label: 'Past due' },
              { key: 'trialing', label: 'Trialing' },
              { key: 'cancelled', label: 'Cancelled' },
            ]}
          />
          <div className="ml-auto relative max-w-xs w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search owner"
              className="input-base !h-10 pl-10"
            />
          </div>
        </div>

        <Table rowKey="id" dataSource={filtered} columns={columns} pagination={{ pageSize: 8, showSizeChanger: false }} scroll={{ x: 900 }} />
      </Panel>
    </>
  );
}

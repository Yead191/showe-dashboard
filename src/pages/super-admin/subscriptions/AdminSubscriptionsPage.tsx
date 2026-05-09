import { Table, Button, Dropdown, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState, useMemo } from 'react';
import {
  MoreHorizontal,
  Search,
  ArrowUpDown,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, StatCard, TierBadge, StatusBadge, Avatar } from '@/components/ui';
import { mockSubscriptions } from '@/constants/mock-data';
import type { Subscription } from '@/types';
import type { VenueTier } from '@/types/auth';
import { TIER_META } from '@/constants/tiers';
import { formatPence, formatDate } from '@/lib/utils';
import { ViewCustomerModal } from '@/features/subscriptions/ViewCustomerModal';
import { ChangeTierModal } from '@/features/subscriptions/ChangeTierModal';
import { InvoicesModal } from '@/features/subscriptions/InvoicesModal';
import {
  CancelSubscriptionModal,
  type CancelMode,
} from '@/features/subscriptions/CancelSubscriptionModal';

type ModalKind = 'view' | 'tier' | 'invoices' | 'cancel' | null;

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [search, setSearch] = useState('');
  const [statusKey, setStatusKey] = useState('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const activeSubscription = useMemo(
    () => subscriptions.find((s) => s.id === activeId) ?? null,
    [subscriptions, activeId]
  );

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      if (statusKey !== 'all' && s.status !== statusKey) return false;
      if (search && !s.owner_name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [subscriptions, search, statusKey]);

  const totals = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === 'active');
    const mrr = active.reduce(
      (sum, s) => sum + (s.interval === 'annual' ? s.amount_pence / 12 : s.amount_pence),
      0
    );
    return {
      mrr,
      active: active.length,
      pastDue: subscriptions.filter((s) => s.status === 'past_due').length,
      trialing: subscriptions.filter((s) => s.status === 'trialing').length,
    };
  }, [subscriptions]);

  function openModal(id: string, kind: Exclude<ModalKind, null>) {
    setActiveId(id);
    setModal(kind);
  }

  function closeModal() {
    setModal(null);
    setActiveId(null);
  }

  function handleChangeTier(subscriptionId: string, newTier: VenueTier) {
    const sub = subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) return;
    const meta = TIER_META[newTier];
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subscriptionId
          ? {
              ...s,
              tier: newTier,
              amount_pence:
                s.interval === 'annual' ? meta.priceMonthly * 12 * 100 : meta.priceMonthly * 100,
            }
          : s
      )
    );
    toast.success(`${sub.owner_name} moved to ${meta.label}.`);
    closeModal();
  }

  function handleCancel(subscriptionId: string, mode: CancelMode) {
    setCancelLoading(true);
    setTimeout(() => {
      setSubscriptions((prev) =>
        prev.map((s) => {
          if (s.id !== subscriptionId) return s;
          if (mode === 'immediate') {
            return { ...s, status: 'cancelled', cancel_at_period_end: false };
          }
          return { ...s, cancel_at_period_end: true };
        })
      );
      const sub = subscriptions.find((s) => s.id === subscriptionId);
      toast.success(
        mode === 'immediate'
          ? `${sub?.owner_name ?? 'Subscription'} cancelled immediately.`
          : `${sub?.owner_name ?? 'Subscription'} will cancel at period end.`
      );
      setCancelLoading(false);
      closeModal();
    }, 600);
  }

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
      render: (v: number) => (
        <span className="font-display font-bold tabular text-ink">{formatPence(v)}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 130,
      render: (s, r) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={s} />
          {r.cancel_at_period_end && r.status !== 'cancelled' && (
            <span className="text-[10.5px] uppercase tracking-wider font-bold text-accent">
              Cancels at period end
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Renews',
      dataIndex: 'next_billing_at',
      width: 130,
      render: (d, r) => (
        <span className="text-[12.5px] text-ink-muted">
          {r.status === 'cancelled' ? '—' : formatDate(d)}
        </span>
      ),
    },
    {
      title: '',
      width: 50,
      align: 'right',
      render: (_, r) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View customer' },
              {
                key: 'change-tier',
                label: 'Change tier',
                disabled: r.status === 'cancelled',
              },
              { key: 'invoice', label: 'View invoices' },
              { type: 'divider' },
              {
                key: 'cancel',
                label: 'Cancel subscription',
                danger: true,
                disabled: r.status === 'cancelled',
              },
            ],
            onClick: ({ key }) => {
              if (key === 'view') openModal(r.id, 'view');
              else if (key === 'change-tier') openModal(r.id, 'tier');
              else if (key === 'invoice') openModal(r.id, 'invoices');
              else if (key === 'cancel') openModal(r.id, 'cancel');
            },
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
        <StatCard
          label="MRR"
          value={formatPence(totals.mrr)}
          delta={6.2}
          icon={TrendingUp}
          accent="primary"
        />
        <StatCard label="Active" value={String(totals.active)} icon={CreditCard} accent="success" />
        <StatCard
          label="Past due"
          value={String(totals.pastDue)}
          icon={ArrowUpDown}
          accent="amber"
        />
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
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search owner"
              className="input-base !h-10 pl-10"
            />
          </div>
        </div>

        <Table
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 900 }}
        />
      </Panel>

      <ViewCustomerModal
        open={modal === 'view'}
        subscription={activeSubscription}
        onClose={closeModal}
      />
      <ChangeTierModal
        open={modal === 'tier'}
        subscription={activeSubscription}
        onClose={closeModal}
        onConfirm={handleChangeTier}
      />
      <InvoicesModal
        open={modal === 'invoices'}
        subscription={activeSubscription}
        onClose={closeModal}
      />
      <CancelSubscriptionModal
        open={modal === 'cancel'}
        subscription={activeSubscription}
        onClose={closeModal}
        onConfirm={handleCancel}
        loading={cancelLoading}
      />
    </>
  );
}

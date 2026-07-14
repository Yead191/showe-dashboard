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
import { PageHeader, Panel, StatCard, StatusBadge, Avatar } from '@/components/ui';
import type { Subscription } from '@/types';
import { formatDate, formatGBP } from '@/lib/utils';
import { ViewCustomerModal } from '@/features/subscriptions/ViewCustomerModal';
import { ChangeTierModal } from '@/features/subscriptions/ChangeTierModal';
import { InvoicesModal } from '@/features/subscriptions/InvoicesModal';
import {
  CancelSubscriptionModal,
  type CancelMode,
} from '@/features/subscriptions/CancelSubscriptionModal';
import {
  useCancelSubscriptionMutation,
  useGetSubscribedUsersQuery,
  type ApiSubscribedUser,
} from '@/store/api/subscribedUserApi';

type ModalKind = 'view' | 'tier' | 'invoices' | 'cancel' | null;

function toSubscription(sub: ApiSubscribedUser): Subscription {
  return {
    id: sub._id,
    owner_id: sub.user._id,
    owner_name: sub.user.name,
    owner_email: sub.user.email,
    tier: 'tier_1',
    interval: 'monthly',
    status: sub.status === 'active' ? 'active' : 'cancelled',
    amount_pence: sub.price * 100,
    current_period_start: sub.startDate,
    current_period_end: sub.endDate,
    next_billing_at: sub.endDate,
    cancel_at_period_end: false,
    created_at: sub.createdAt,
  };
}

export default function AdminSubscriptionsPage() {
  const [search, setSearch] = useState('');
  const [statusKey, setStatusKey] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);

  const { data: subscribedData, isLoading, isFetching } = useGetSubscribedUsersQuery({
    page,
    limit: pageSize,
  });
  const [cancelSubscription, { isLoading: cancelLoading }] = useCancelSubscriptionMutation();

  const subscriptions = subscribedData?.subscriptions ?? [];

  const activeSubscription = useMemo(() => {
    const sub = subscriptions.find((s) => s._id === activeId);
    return sub ? toSubscription(sub) : null;
  }, [subscriptions, activeId]);

  const filtered = useMemo(() => {
    return subscriptions.filter((sub) => {
      if (statusKey !== 'all' && sub.status !== statusKey) return false;
      const term = search.toLowerCase();
      if (
        search &&
        !sub.user.name.toLowerCase().includes(term) &&
        !sub.user.email.toLowerCase().includes(term) &&
        !sub.name.toLowerCase().includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [subscriptions, search, statusKey]);

  const totals = useMemo(() => {
    const active = subscriptions.filter((sub) => sub.status === 'active');
    const mrr = active.reduce((sum, sub) => sum + sub.price, 0);
    return {
      mrr,
      active: active.length,
      inactive: subscriptions.filter((sub) => sub.status === 'inactive').length,
      total: subscriptions.length,
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

  function handleChangeTier(subscriptionId: string) {
    const sub = subscriptions.find((s) => s._id === subscriptionId);
    if (!sub) return;
    toast.success(`${sub.user.name} tier change requested for ${sub.name}.`);
    closeModal();
  }

  async function handleCancel(subscriptionId: string, _mode: CancelMode) {
    try {
      const sub = subscriptions.find((s) => s._id === subscriptionId);
      const response = await cancelSubscription(subscriptionId).unwrap();
      toast.success(response.message || `${sub?.user.name ?? 'Subscription'} cancelled successfully.`);
      closeModal();
    } catch (err) {
      const errorMessage =
        typeof err === 'object' && err !== null && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ?? 'Failed to cancel subscription.')
          : 'Failed to cancel subscription.';
      toast.error(errorMessage);
    }
  }

  const columns: ColumnsType<ApiSubscribedUser> = [
    {
      title: 'Owner',
      dataIndex: ['user', 'name'],
      render: (_, sub) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={sub.user.name} size={36} />
          <div className="min-w-0">
            <div className="font-semibold text-ink truncate">{sub.user.name}</div>
            <div className="text-[12.5px] text-ink-faint truncate">{sub.user.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Plan',
      dataIndex: 'name',
      width: 130,
      render: (name: string) => <span className="chip capitalize">{name}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'price',
      width: 110,
      render: (price: number) => (
        <span className="font-display font-bold tabular text-ink">{formatGBP(price)}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 130,
      render: (status) => (
        <StatusBadge status={status === 'active' ? 'active' : 'cancelled'} />
      ),
    },
    {
      title: 'Start',
      dataIndex: 'startDate',
      width: 130,
      render: (date) => <span className="text-[12.5px] text-ink-muted">{formatDate(date)}</span>,
    },
    {
      title: 'Renews',
      dataIndex: 'endDate',
      width: 130,
      render: (date, sub) => (
        <span className="text-[12.5px] text-ink-muted">
          {sub.status === 'inactive' ? '—' : formatDate(date)}
        </span>
      ),
    },
    {
      title: 'Transaction',
      dataIndex: 'txId',
      width: 180,
      render: (txId: string) => (
        <span className="text-[12px] text-ink-muted font-mono truncate block max-w-[160px]">{txId}</span>
      ),
    },
    {
      title: '',
      width: 50,
      align: 'right',
      render: (_, sub) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View customer' },
              {
                key: 'change-tier',
                label: 'Change tier',
                disabled: sub.status === 'inactive',
              },
              { key: 'invoice', label: 'View invoices' },
              { type: 'divider' },
              {
                key: 'cancel',
                label: 'Cancel subscription',
                danger: true,
                disabled: sub.status === 'inactive',
              },
            ],
            onClick: ({ key }) => {
              if (key === 'view') openModal(sub._id, 'view');
              else if (key === 'change-tier') openModal(sub._id, 'tier');
              else if (key === 'invoice') openModal(sub._id, 'invoices');
              else if (key === 'cancel') openModal(sub._id, 'cancel');
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
          value={formatGBP(totals.mrr)}
          delta={6.2}
          icon={TrendingUp}
          accent="primary"
        />
        <StatCard label="Active" value={String(totals.active)} icon={CreditCard} accent="success" />
        <StatCard
          label="Inactive"
          value={String(totals.inactive)}
          icon={ArrowUpDown}
          accent="amber"
        />
        <StatCard label="Total" value={String(totals.total)} icon={CreditCard} accent="info" />
      </div>

      <Panel padded={false} className="overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-line">
          <Tabs
            activeKey={statusKey}
            onChange={setStatusKey}
            items={[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'inactive', label: 'Inactive' },
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
          rowKey="_id"
          dataSource={filtered}
          columns={columns}
          loading={isLoading || isFetching}
          pagination={{
            current: subscribedData?.pagination.page ?? page,
            pageSize: subscribedData?.pagination.limit ?? pageSize,
            total: subscribedData?.pagination.total ?? 0,
            showSizeChanger: true,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
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
        onConfirm={(subscriptionId, newTier) => {
          void newTier;
          handleChangeTier(subscriptionId);
        }}
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

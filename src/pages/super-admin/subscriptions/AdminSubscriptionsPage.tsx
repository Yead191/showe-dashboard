import { Table, Button, Dropdown, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';import {
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
import { SubscriptionDetailsModal } from '@/features/subscriptions/SubscriptionDetailsModal';
import { ChangeTierModal } from '@/features/subscriptions/ChangeTierModal';
import {
  CancelSubscriptionModal,
  type CancelMode,
} from '@/features/subscriptions/CancelSubscriptionModal';
import {
  useCancelSubscriptionMutation,
  useChangeSubscriptionPackageMutation,
  useGetSubscribedUsersQuery,
  type ApiSubscribedUser,
} from '@/store/api/subscribedUserApi';
import { useGetSubscriptionPackagesQuery } from '@/store/api/subscriptionPackageApi';
import { getImageUrl } from '@/helpers/getImageUrl';
import { getApiErrorMessage } from '@/lib/api-error';

type SubscriptionsTab = 'all' | 'active' | 'inactive';

const SEARCH_DEBOUNCE_MS = 300;

function isSubscriptionsTab(value: string | null): value is SubscriptionsTab {
  return value === 'all' || value === 'active' || value === 'inactive';
}

function tabToStatus(tab: SubscriptionsTab): string | undefined {
  return tab === 'all' ? undefined : tab;
}

type ModalKind = 'details' | 'tier' | 'cancel' | null;

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
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') ?? '';
  const tabFromUrl = searchParams.get('tabs');
  const tab: SubscriptionsTab = isSubscriptionsTab(tabFromUrl) ? tabFromUrl : 'all';

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);

  useEffect(() => {
    setSearchInput(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    if (isSubscriptionsTab(tabFromUrl)) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tabs', 'all');
        return next;
      },
      { replace: true }
    );
  }, [tabFromUrl, setSearchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      setDebouncedSearch(trimmed);
      setPage(1);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) next.set('search', trimmed);
          else next.delete('search');
          if (!isSubscriptionsTab(next.get('tabs'))) {
            next.set('tabs', tab);
          }
          return next;
        },
        { replace: true }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, setSearchParams, tab]);

  const { data: subscribedData, isLoading, isFetching } = useGetSubscribedUsersQuery({
    page,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
    status: tabToStatus(tab),
  });
  const { data: packages = [], isLoading: packagesLoading } = useGetSubscriptionPackagesQuery(
    undefined,
    { skip: modal !== 'tier' },
  );
  const [cancelSubscription, { isLoading: cancelLoading }] = useCancelSubscriptionMutation();
  const [changePackage, { isLoading: changePackageLoading }] =
    useChangeSubscriptionPackageMutation();

  const subscriptions = subscribedData?.subscriptions ?? [];
  const totalCount = subscribedData?.pagination?.total ?? subscriptions.length;

  function setTab(nextTab: SubscriptionsTab) {
    setPage(1);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tabs', nextTab);
        const trimmed = searchInput.trim();
        if (trimmed) next.set('search', trimmed);
        else next.delete('search');
        return next;
      },
      { replace: true }
    );
  }

  const activeSubscription = useMemo(() => {
    const sub = subscriptions.find((s) => s._id === activeId);
    return sub ? toSubscription(sub) : null;
  }, [subscriptions, activeId]);

  const activeApiSubscription = useMemo(
    () => subscriptions.find((s) => s._id === activeId) ?? null,
    [subscriptions, activeId]
  );

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

  async function handleChangeTier(userId: string, packageId: string) {
    const sub = subscriptions.find((s) => s._id === activeId);
    if (sub?.package?._id && sub.package._id === packageId) {
      toast.error('This user is already on the selected tier.');
      return;
    }

    try {
      const response = await changePackage({ userId, packageId }).unwrap();
      toast.success(
        response.message ||
          `${sub?.user.name ?? 'Subscription'} tier updated successfully.`,
      );
      closeModal();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to change subscription tier.'));
    }
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
          <Avatar src={getImageUrl(sub.user.image)} name={sub.user.name} size={36} />
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
              { key: 'details', label: 'View details' },
              {
                key: 'change-tier',
                label: 'Change tier',
                disabled: sub.status === 'inactive',
              },
              { type: 'divider' },
              {
                key: 'cancel',
                label: 'Cancel subscription',
                danger: true,
                disabled: sub.status === 'inactive',
              },
            ],
            onClick: ({ key }) => {
              if (key === 'details') openModal(sub._id, 'details');
              else if (key === 'change-tier') openModal(sub._id, 'tier');
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
            activeKey={tab}
            onChange={(k) => setTab(k as SubscriptionsTab)}
            items={[
              {
                key: 'all',
                label: tabLabel('All', tab === 'all' ? totalCount : undefined),
              },
              {
                key: 'active',
                label: tabLabel('Active', tab === 'active' ? totalCount : undefined),
              },
              {
                key: 'inactive',
                label: tabLabel('Inactive', tab === 'inactive' ? totalCount : undefined),
              },
            ]}
          />
          <div className="ml-auto relative max-w-xs w-full">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search owner"
              className="input-base !h-10 pl-10"
            />
          </div>
        </div>

        <Table
          rowKey="_id"
          dataSource={subscriptions}
          locale={{
            emptyText: debouncedSearch
              ? `No subscriptions match "${debouncedSearch}".`
              : 'No subscriptions in this category.',
          }}
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

      <SubscriptionDetailsModal
        open={modal === 'details'}
        subscription={activeApiSubscription}
        onClose={closeModal}
      />
      <ChangeTierModal
        open={modal === 'tier'}
        subscription={activeApiSubscription}
        packages={packages}
        packagesLoading={packagesLoading}
        confirmLoading={changePackageLoading}
        onClose={closeModal}
        onConfirm={(userId, packageId) => {
          void handleChangeTier(userId, packageId);
        }}
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

function tabLabel(label: string, count?: number) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      {typeof count === 'number' && (
        <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
          {count}
        </span>
      )}
    </span>
  );
}

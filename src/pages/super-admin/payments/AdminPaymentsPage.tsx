import { Table, Button, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Download, TrendingUp, Banknote, RefreshCcw, ArrowDownToLine } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, StatCard, StatusBadge, Avatar } from '@/components/ui';
import { formatGBP, formatDateTime } from '@/lib/utils';
import { useGetPaymentsQuery, type ApiPayment } from '@/store/api/paymentApi';

type TabKey = 'all' | 'Payment' | 'Subscription';

const SEARCH_DEBOUNCE_MS = 300;

function isPaymentsTab(value: string | null): value is TabKey {
  return value === 'all' || value === 'Payment' || value === 'Subscription';
}

function tabToType(tab: TabKey): string | undefined {
  return tab === 'all' ? undefined : tab;
}

function mapStatus(status: string): 'succeeded' | 'failed' | 'pending' {
  const value = status.toLowerCase();
  if (value === 'completed' || value === 'success' || value === 'succeeded') return 'succeeded';
  if (value === 'failed') return 'failed';
  return 'pending';
}

export default function AdminPaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') ?? '';
  const tabFromUrl = searchParams.get('tabs');
  const tab: TabKey = isPaymentsTab(tabFromUrl) ? tabFromUrl : 'all';

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setSearchInput(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    if (isPaymentsTab(tabFromUrl)) return;
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
          if (!isPaymentsTab(next.get('tabs'))) {
            next.set('tabs', tab);
          }
          return next;
        },
        { replace: true }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, setSearchParams, tab]);

  const { data, isLoading, isFetching } = useGetPaymentsQuery({
    page,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
    type: tabToType(tab),
  });
  const payments = data?.payments ?? [];
  const totalCount = data?.pagination?.total ?? payments.length;

  function setTab(nextTab: TabKey) {
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

  const totals = useMemo(() => {
    const completed = payments.filter((payment) => mapStatus(payment.status) === 'succeeded');
    return {
      gross: completed.reduce((sum, payment) => sum + payment.amount, 0),
      fees: completed.reduce((sum, payment) => sum + payment.platform_charge, 0),
      count: totalCount,
      failed: payments.filter((payment) => mapStatus(payment.status) === 'failed').length,
    };
  }, [payments, totalCount]);

  const handleExport = () => {
    if (payments.length === 0) {
      toast.error('No transactions to export.');
      return;
    }
    const rowsData = payments.map((payment) => ({
      ID: payment.trx_id,
      Date: new Date(payment.createdAt).toLocaleString(),
      Type: payment.type,
      Title: payment.title,
      Owner: payment.owner.name,
      Amount: payment.amount.toFixed(2),
      PlatformCharge: payment.platform_charge.toFixed(2),
      PaymentStatus: payment.payment_status,
      Status: payment.status,
    }));

    const headers = Object.keys(rowsData[0]).join(',');
    const rows = rowsData.map((obj) => Object.values(obj).map((v) => `"${v}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `showe-payments-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully');
  };

  const columns: ColumnsType<ApiPayment> = [
    {
      title: 'Description',
      dataIndex: 'title',
      render: (_, payment) => (
        <div>
          <div className="font-semibold text-ink truncate">{payment.title}</div>
          <div className="text-[12.5px] text-ink-faint">{payment.trx_id}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 130,
      render: (type: string) => <span className="chip capitalize">{type}</span>,
    },
    {
      title: 'Owner',
      dataIndex: ['owner', 'name'],
      width: 200,
      render: (_, payment) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar src={payment.owner.image} name={payment.owner.name} size={30} />
          <div className="min-w-0">
            <div className="text-sm font-medium text-ink truncate">{payment.owner.name}</div>
            <div className="text-[12px] text-ink-faint truncate">{payment.owner.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 110,
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{formatGBP(v)}</span>,
    },
    {
      title: 'Platform charge',
      dataIndex: 'platform_charge',
      width: 130,
      render: (v: number) => (
        <span className="font-display tabular text-ink-muted">{v > 0 ? formatGBP(v) : '—'}</span>
      ),
    },
    {
      title: 'Flow',
      dataIndex: 'payment_status',
      width: 100,
      render: (paymentStatus: ApiPayment['payment_status']) => (
        <span
          className={
            paymentStatus === 'Credit'
              ? 'text-success font-semibold text-sm'
              : 'text-warning font-semibold text-sm'
          }
        >
          {paymentStatus}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (status: string) => <StatusBadge status={mapStatus(status)} />,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      width: 160,
      render: (d) => <span className="text-[12.5px] text-ink-muted">{formatDateTime(d)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Money"
        title="Payments"
        description="Every transaction across the platform — programme purchases (with commission split) and subscription renewals."
        actions={<Button icon={<Download size={14} />} onClick={handleExport}>Export</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7 stagger">
        <StatCard label="Gross volume" value={formatGBP(totals.gross)} icon={Banknote} accent="primary" />
        <StatCard label="Platform charge" value={formatGBP(totals.fees)} icon={TrendingUp} accent="amber" />
        <StatCard label="Transactions" value={String(totals.count)} icon={ArrowDownToLine} accent="success" />
        <StatCard label="Failed payments" value={String(totals.failed)} icon={RefreshCcw} accent="info" />
      </div>

      <Panel padded={false} className="overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-line">
          <Tabs
            activeKey={tab}
            onChange={(k) => setTab(k as TabKey)}
            items={[
              {
                key: 'all',
                label: tabLabel('All', tab === 'all' ? totalCount : undefined),
              },
              {
                key: 'Payment',
                label: tabLabel('Payments', tab === 'Payment' ? totalCount : undefined),
              },
              {
                key: 'Subscription',
                label: tabLabel('Subscriptions', tab === 'Subscription' ? totalCount : undefined),
              },
            ]}
          />
          <div className="ml-auto relative max-w-xs w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search transactions"
              className="input-base !h-10 pl-10"
            />
          </div>
        </div>

        <Table
          rowKey="_id"
          dataSource={payments}
          locale={{
            emptyText: debouncedSearch
              ? `No transactions match "${debouncedSearch}".`
              : 'No transactions in this category.',
          }}
          columns={columns}
          loading={isLoading || isFetching}
          pagination={{
            current: data?.pagination.page ?? page,
            pageSize: data?.pagination.limit ?? pageSize,
            total: data?.pagination.total ?? 0,
            showSizeChanger: true,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Panel>
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

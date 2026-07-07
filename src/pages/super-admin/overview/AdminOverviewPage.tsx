import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  RefreshCcw,
  Banknote,
  Printer,
} from 'lucide-react';
import { Button } from 'antd';
import { PageHeader, StatCard, Panel, StatusBadge, Avatar, TierBadge } from '@/components/ui';
import { TrendChart } from '@/components/charts/TrendChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { mockVenueOwners, mockTransactions, mockRevenueTrend } from '@/constants';
import { TIER_META } from '@/constants/tiers';
import { formatGBP, formatNumber } from '@/lib/utils';
import {
  useGetAdminDashboardStatsQuery,
  useGetAdminRevenueGraphQuery,
} from '@/store/api/adminOverviewApi';

export default function AdminOverviewPage() {
  const { data: dashboardStats, isLoading: isStatsLoading } = useGetAdminDashboardStatsQuery();
  const { data: revenueGraphData, isLoading: isRevenueLoading } = useGetAdminRevenueGraphQuery();

  const totalRevenue = mockTransactions
    .filter((t) => t.status === 'succeeded')
    .reduce((s, t) => s + t.fee_pence, 0);
  const resolvedTotalRevenue = dashboardStats?.totalRevenue ?? 0;
  const resolvedTotalVenues = dashboardStats?.totalVanues ?? mockVenueOwners.length;
  const resolvedTotalActiveUsers = dashboardStats?.totalActiveUsers ?? 0;
  const resolvedTotalCommission = dashboardStats?.totalCommission ?? totalRevenue / 100;
  const chartData =
    revenueGraphData?.map((point) => ({
      date: point.label,
      value: point.revenue,
    })) ?? mockRevenueTrend;

  const tierCounts: Record<string, number> = {};
  for (const o of mockVenueOwners) tierCounts[o.tier] = (tierCounts[o.tier] ?? 0) + 1;
  const tierData = Object.entries(tierCounts).map(([k, v]) => ({
    name: TIER_META[k as keyof typeof TIER_META].short,
    value: v,
    color: TIER_META[k as keyof typeof TIER_META].color,
  }));

  const recentSignups = mockVenueOwners.slice(0, 4);

  const handleExport = () => {
    window.print();
  };

  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title={
          <span>
            Network at a glance<span className="text-accent">.</span>
          </span>
        }
        description="The shape of SHOWE today — venues, users, money, health."
        actions={
          <>
            <Button icon={<Printer size={14} />} onClick={handleExport}>
              Print report
            </Button>
            <Link to="/admin/analytics">
              <Button type="primary" icon={<TrendingUp size={14} />}>
                Open analytics
              </Button>
            </Link>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard
          label="MRR"
          value={isStatsLoading ? '...' : formatGBP(resolvedTotalRevenue)}
          delta={6.2}
          icon={Banknote}
          accent="primary"
          hint="Monthly recurring revenue"
        />
        <StatCard
          label="Total venues"
          value={isStatsLoading ? '...' : formatNumber(resolvedTotalVenues)}
          delta={8.0}
          icon={Building2}
          accent="amber"
          hint="2 pending approval"
        />
        <StatCard
          label="Active end-users"
          value={isStatsLoading ? '...' : formatNumber(resolvedTotalActiveUsers)}
          delta={12.4}
          icon={Users}
          accent="info"
          hint="Past 28 days"
        />
        <StatCard
          label="SHOWE commission"
          value={isStatsLoading ? '...' : formatGBP(resolvedTotalCommission)}
          delta={14.8}
          icon={TrendingUp}
          accent="success"
          hint="10% of paid programmes"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Panel className="lg:col-span-2" eyebrow="Year to date" title="Platform revenue">
          <TrendChart
            data={chartData}
            formatter={(v) => formatGBP(v)}
            height={260}
            color="primary"
            name={isRevenueLoading ? 'Revenue (loading...)' : 'Revenue'}
          />
        </Panel>

        <Panel eyebrow="Distribution" title="Tier mix">
          <div className="flex items-center justify-center mb-2">
            <DonutChart
              data={tierData}
              centerLabel="Venues"
              centerValue={String(mockVenueOwners.length)}
              size={220}
            />
          </div>
          <ul className="space-y-1.5 mt-2">
            {tierData.map((t) => (
              <li key={t.name} className="flex items-center justify-between text-[12.5px]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-ink-muted">{t.name}</span>
                </span>
                <span className="font-display font-bold tabular text-ink">{t.value}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* Recent signups */}
        <Panel
          className="lg:col-span-2"
          title="Newest Organiser"
          description="Sign-ups in the last 30 days"
          action={
            <Link to="/admin/venues" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-1.5 transition-all">
              See all <ArrowUpRight size={14} />
            </Link>
          }
        >
          <ul className="divide-y divide-line -m-1">
            {recentSignups.map((o) => (
              <li key={o.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-sunken transition-colors">
                <Avatar src={o.avatar_url} name={o.name} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink truncate">{o.name}</div>
                  <div className="text-[12.5px] text-ink-faint truncate">
                    {o.email} · {o.org_type}
                  </div>
                </div>
                <TierBadge tier={o.tier} />
                <StatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        </Panel>

        {/* Health */}
        <Panel title="Network health">
          <ul className="space-y-3">
            <Health icon={CheckCircle2} tone="success" label="API uptime" value="99.98%" />
            <Health icon={CheckCircle2} tone="success" label="Payment success rate" value="99.2%" />
            <Health icon={AlertTriangle} tone="warning" label="Refund auto-escalations" value="1 active" />
            <Health icon={RefreshCcw} tone="info" label="Programmes published, 7d" value="14" />
            <Health icon={CreditCard} tone="warning" label="Past-due subscriptions" value="1" />
          </ul>
        </Panel>
      </div>
    </>
  );
}

function Health({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof CheckCircle2;
  tone: 'success' | 'warning' | 'info';
  label: string;
  value: string;
}) {
  const styles = {
    success: { bg: 'bg-[#43762212]', fg: 'text-success' },
    warning: { bg: 'bg-[#DA710115]', fg: 'text-warning' },
    info: { bg: 'bg-[#00649414]', fg: 'text-info' },
  }[tone];
  return (
    <li className="flex items-center gap-3">
      <span className={`w-9 h-9 rounded-full ${styles.bg} ${styles.fg} flex items-center justify-center`}>
        <Icon size={14} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-ink-muted">{label}</div>
      </div>
      <div className="font-display font-bold tabular text-ink">{value}</div>
    </li>
  );
}

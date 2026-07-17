import { useMemo, useState } from 'react';
import { Eye, MousePointerClick, Download } from 'lucide-react';
import { PageHeader, Panel, StatCard } from '@/components/ui';
import { TrendChart } from '@/components/charts/TrendChart';
import { BarsChart } from '@/components/charts/BarsChart';
import { formatGBP, formatNumber } from '@/lib/utils';
import { useGetProgrammesQuery } from '@/store/api/programmesApi';
import { Select } from 'antd';
import {
  useGetOrganizationAnalyticsRevenueGraphQuery,
  useGetOrganizationAnalyticsStatsQuery,
  useGetOrganizationAnalyticsViewAndClickGraphQuery,
  type AnalyticsDateRange,
  type AnalyticsGraphPoint,
  type RevenueGraphPoint,
} from '@/store/api/organizationApi/organizationAnalyticsApi';

type TimeframeOption = '7d' | '30d' | '1y';

function toApiRange(timeframe: TimeframeOption): AnalyticsDateRange {
  if (timeframe === '30d') return 'last30Days';
  if (timeframe === '1y') return 'thisYear';
  return 'last7Days';
}

function mapViewAndClickChart(data: AnalyticsGraphPoint[]) {
  return data.map((point) => ({
    date: point.label,
    views: point.views,
    clicks: point.clicks,
  }));
}

function mapRevenueChart(data: RevenueGraphPoint[]) {
  return data.map((point) => ({
    date: point.label,
    value: point.revenue,
  }));
}

function sumRevenue(data: RevenueGraphPoint[]) {
  return data.reduce((total, point) => total + point.revenue, 0);
}

export default function AnalyticsPage() {
  const { data: allProgrammesData } = useGetProgrammesQuery();
  const allProgrammes = allProgrammesData || [];
  const [programmeId, setProgrammeId] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('7d');

  const programmeOptions = [
    { label: 'All programmes', value: 'all' },
    ...allProgrammes.map(p => ({ label: p.title, value: p.id }))
  ];

  const timeframeOptions = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'This year', value: '1y' }
  ];

  const timeframeLabel = timeframeOptions.find(t => t.value === timeframe)?.label.toLowerCase();
  const analyticsParams = useMemo(
    () => ({
      date_range: toApiRange(timeframe),
      ids: programmeId === 'all' ? undefined : [programmeId],
    }),
    [programmeId, timeframe]
  );

  const { data: stats, isLoading: isStatsLoading } = useGetOrganizationAnalyticsStatsQuery(analyticsParams);
  const { data: viewAndClickGraph = [] } =
    useGetOrganizationAnalyticsViewAndClickGraphQuery(analyticsParams);
  const { data: revenueGraph = [], isLoading: isRevenueLoading } =
    useGetOrganizationAnalyticsRevenueGraphQuery(analyticsParams);

  const chartData = useMemo(() => mapViewAndClickChart(viewAndClickGraph), [viewAndClickGraph]);
  const revenueChartData = useMemo(() => mapRevenueChart(revenueGraph), [revenueGraph]);
  const totalRevenue = useMemo(() => sumRevenue(revenueGraph), [revenueGraph]);

  return (
    <>
      <PageHeader
        eyebrow="Insight"
        title="Analytics"
        description="Audience behaviour across your live programmes. Advanced metrics unlock with Tier 2 Engage and above."
        actions={
          <>
            <Select
              value={programmeId}
              onChange={setProgrammeId}
              options={programmeOptions}
              className="w-48"
              popupMatchSelectWidth={false}
            />
            <Select
              value={timeframe}
              onChange={setTimeframe}
              options={timeframeOptions}
              className="w-36"
            />
          </>
        }
      />

      <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          <StatCard
            label="Views"
            value={isStatsLoading ? '...' : formatNumber(stats?.totalViews ?? 0)}
            icon={Eye}
            accent="primary"
          />
          <StatCard
            label="Clicks"
            value={isStatsLoading ? '...' : formatNumber(stats?.totalClicks ?? 0)}
            icon={MousePointerClick}
            accent="success"
          />
          <StatCard
            label="Total Sold"
            value={isStatsLoading ? '...' : formatNumber(stats?.totalSolds ?? 0)}
            icon={Download}
            accent="amber"
          />
          <StatCard
            label="Revenue"
            value={isRevenueLoading ? '...' : formatGBP(totalRevenue)}
            icon={Download}
            accent="info"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mt-6">
          <Panel className="lg:col-span-2" title={`Views & clicks, ${timeframeLabel}`}>
            <TrendChart
              data={chartData}
              formatter={formatNumber}
              height={260}
              series={[
                { key: 'views', name: 'Views', color: 'primary' },
                { key: 'clicks', name: 'Clicks', color: 'accent' },
              ]}
            />
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-6">
          <Panel title={`Programme revenue, ${timeframeLabel}`}>
            <BarsChart data={revenueChartData} formatter={(v) => formatGBP(v)} height={260} />
          </Panel>
        </div>
      </>
    </>
  );
}


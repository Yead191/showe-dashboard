import { useEffect, useMemo, useState } from 'react';
import { Eye, MousePointerClick, Download, Clock, Banknote } from 'lucide-react';
import { PageHeader, Panel, StatCard } from '@/components/ui';
import { TrendChart } from '@/components/charts/TrendChart';
import { BarsChart } from '@/components/charts/BarsChart';
import { formatDwell, formatGBP, formatNumber } from '@/lib/utils';
import { useGetProgrammesQuery } from '@/store/api/programmesApi';
import { Select } from 'antd';
import {
  useGetOrganizationAnalyticsDwellTimeGraphQuery,
  useGetOrganizationAnalyticsRevenueGraphQuery,
  useGetOrganizationAnalyticsStatsQuery,
  useGetOrganizationAnalyticsViewAndClickGraphQuery,
  type AnalyticsDateRange,
  type AnalyticsGraphPoint,
  type DwellTimeGraphPoint,
  type RevenueGraphPoint,
} from '@/store/api/organizationApi/organizationAnalyticsApi';

type TimeframeOption = '7d' | '30d' | '1y';

function toApiRange(timeframe: TimeframeOption): AnalyticsDateRange {
  if (timeframe === '30d') return 'last30Days';
  if (timeframe === '1y') return 'thisYear';
  return 'last7Days';
}

/** API dwell values are fractional days (e.g. 0.0128 ≈ 18m 28s). */
function toDwellSeconds(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 24 * 60 * 60);
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

function mapDwellChart(data: DwellTimeGraphPoint[]) {
  return data.map((point) => ({
    date: point.label,
    value: toDwellSeconds(point.dwellTime),
  }));
}

function sumRevenue(data: RevenueGraphPoint[]) {
  return data.reduce((total, point) => total + point.revenue, 0);
}

export default function AnalyticsPage() {
  const { data: allProgrammesData, isLoading: isProgrammesLoading } = useGetProgrammesQuery();
  const allProgrammes = allProgrammesData || [];
  const [programmeId, setProgrammeId] = useState<string>('');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('7d');

  useEffect(() => {
    if (!allProgrammes.length) return;
    const stillValid = allProgrammes.some((p) => p.id === programmeId);
    if (!programmeId || !stillValid) {
      setProgrammeId(allProgrammes[0].id);
    }
  }, [allProgrammes, programmeId]);

  const programmeOptions = allProgrammes.map((p) => ({ label: p.title, value: p.id }));

  const timeframeOptions = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'This year', value: '1y' },
  ];

  const timeframeLabel = timeframeOptions.find((t) => t.value === timeframe)?.label.toLowerCase();
  const analyticsParams = useMemo(
    () => ({
      date_range: toApiRange(timeframe),
      ids: programmeId,
    }),
    [programmeId, timeframe],
  );
  const skipAnalytics = !programmeId;

  const { data: stats, isLoading: isStatsLoading } = useGetOrganizationAnalyticsStatsQuery(
    analyticsParams,
    { skip: skipAnalytics },
  );
  const { data: viewAndClickGraph = [] } = useGetOrganizationAnalyticsViewAndClickGraphQuery(
    analyticsParams,
    { skip: skipAnalytics },
  );
  const { data: revenueGraph = [], isLoading: isRevenueLoading } =
    useGetOrganizationAnalyticsRevenueGraphQuery(analyticsParams, { skip: skipAnalytics });
  const { data: dwellGraph = [], isLoading: isDwellLoading } =
    useGetOrganizationAnalyticsDwellTimeGraphQuery(analyticsParams, { skip: skipAnalytics });

  const chartData = useMemo(() => mapViewAndClickChart(viewAndClickGraph), [viewAndClickGraph]);
  const revenueChartData = useMemo(() => mapRevenueChart(revenueGraph), [revenueGraph]);
  const dwellChartData = useMemo(() => mapDwellChart(dwellGraph), [dwellGraph]);
  const totalRevenue = useMemo(() => sumRevenue(revenueGraph), [revenueGraph]);
  const avgDwellSeconds = toDwellSeconds(stats?.avgDwellTime ?? 0);

  return (
    <>
      <PageHeader
        eyebrow="Insight"
        title="Analytics"
        description="Audience behaviour across your live programmes. Advanced metrics unlock with Tier 2 Engage and above."
        actions={
          <>
            <Select
              value={programmeId || undefined}
              onChange={setProgrammeId}
              options={programmeOptions}
              loading={isProgrammesLoading}
              placeholder="Select programme"
              disabled={!programmeOptions.length}
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger">
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
            label="Avg dwell time"
            value={isStatsLoading ? '...' : formatDwell(avgDwellSeconds)}
            icon={Clock}
            accent="purple"
          />
          <StatCard
            label="Revenue"
            value={isRevenueLoading ? '...' : formatGBP(totalRevenue)}
            icon={Banknote}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <Panel title={`Avg dwell time, ${timeframeLabel}`}>
            {isDwellLoading ? (
              <div className="h-[260px] flex items-center justify-center text-ink-faint text-sm">
                Loading…
              </div>
            ) : (
              <TrendChart
                data={dwellChartData}
                name="Avg dwell"
                color="info"
                formatter={(v) => formatDwell(v)}
                height={260}
              />
            )}
          </Panel>
          <Panel title={`Programme revenue, ${timeframeLabel}`}>
            <BarsChart data={revenueChartData} formatter={(v) => formatGBP(v)} height={260} />
          </Panel>
        </div>
      </>
    </>
  );
}

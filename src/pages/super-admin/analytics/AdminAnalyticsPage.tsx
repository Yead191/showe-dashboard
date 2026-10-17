import { Eye, Users, ShoppingBag, Sparkles, Globe } from "lucide-react";
import { useMemo } from "react";
import { PageHeader, Panel, StatCard } from "@/components/ui";
import { TrendChart } from "@/components/charts/TrendChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { mockVenueOwners } from "@/constants";
import { TIER_META } from "@/constants/tiers";
import { formatGBP, formatNumber } from "@/lib/utils";
import {
  useGetAnalyticsStatsQuery,
  useGetAnalyticsViewGraphQuery,
} from "@/store/api/analyticsApi";
import { useGetAddressWiseInfoQuery } from "@/store/api/bookingApi";

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading: isStatsLoading } =
    useGetAnalyticsStatsQuery();
  const { data: graphData, isLoading: isGraphLoading } =
    useGetAnalyticsViewGraphQuery();
  const { data: addressInfo, isLoading: isAddressLoading } =
    useGetAddressWiseInfoQuery();

  const chartData = useMemo(
    () =>
      (graphData ?? []).map((point) => ({
        date: point.label,
        views: point.views,
        clicks: point.clicks,
      })),
    [graphData],
  );

  const totalRevenue =
    addressInfo?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;

  const tierCounts: Record<string, number> = {};
  for (const o of mockVenueOwners)
    tierCounts[o.tier] = (tierCounts[o.tier] ?? 0) + 1;
  const tierData = Object.entries(tierCounts).map(([k, v]) => ({
    name: TIER_META[k as keyof typeof TIER_META].short,
    value: v,
    color: TIER_META[k as keyof typeof TIER_META].color,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Insight"
        title="Platform analytics"
        description="Behaviour and growth across every venue and end-user on SHOWE."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard
          label="Active end-users"
          value={isStatsLoading ? "..." : formatNumber(stats?.active_user ?? 0)}
          icon={Users}
          accent="primary"
        />
        <StatCard
          label="Programme views"
          value={isStatsLoading ? "..." : formatNumber(stats?.total_views ?? 0)}
          icon={Eye}
          accent="info"
        />
        <StatCard
          label="Programmes sold"
          value={
            isStatsLoading ? "..." : formatNumber(stats?.proggrammes_solds ?? 0)
          }
          icon={ShoppingBag}
          accent="amber"
        />
        <StatCard
          label="Avg downloads/event"
          value={
            isStatsLoading ? "..." : String(stats?.avg_download_per_event ?? 0)
          }
          icon={Sparkles}
          accent="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Panel
          className="lg:col-span-2"
          eyebrow="Year to date"
          title={
            isGraphLoading
              ? "Views & clicks (loading...)"
              : "Views & clicks, network-wide"
          }
        >
          <TrendChart
            data={chartData}
            formatter={formatNumber}
            height={260}
            series={[
              { key: "views", name: "Views", color: "primary" },
              { key: "clicks", name: "Clicks", color: "accent" },
            ]}
          />
        </Panel>

        <Panel eyebrow="Distribution" title="Tier mix">
          <div className="flex items-center justify-center mb-2">
            <DonutChart
              data={tierData}
              centerLabel="Venues"
              centerValue={String(mockVenueOwners.length)}
              size={210}
            />
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Panel
          className="lg:col-span-2"
          eyebrow="By location"
          title="Top performing locations"
        >
          {isAddressLoading ? (
            <div className="space-y-4 py-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-surface-sunken rounded w-1/3" />
                    <div className="h-4 bg-surface-sunken rounded w-16" />
                  </div>
                  <div className="h-2 bg-surface-sunken rounded-full" />
                </div>
              ))}
            </div>
          ) : !addressInfo || addressInfo.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink-muted">
              No location data available yet.
            </div>
          ) : (
            <ul className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {addressInfo?.map((item, index) => {
                const share =
                  totalRevenue > 0
                    ? Math.round(((item.totalPrice || 0) / totalRevenue) * 100)
                    : 0;
                return (
                  <li key={item?.eventId || `${item.eventAddress}-${index}`}>
                    <div className="flex items-center justify-between text-sm mb-1 gap-3">
                      <span className="inline-flex items-center gap-2 truncate min-w-0">
                        <Globe size={12} className="text-ink-faint shrink-0" />
                        <span
                          className="font-medium text-ink truncate"
                          title={item.eventAddress}
                        >
                          {item.eventAddress}
                        </span>
                      </span>
                      <span className="font-display font-bold tabular text-ink shrink-0">
                        {formatGBP(item.totalPrice || 0)}
                      </span>
                    </div>
                    <div className="h-2 bg-surface-sunken rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel eyebrow="Revenue mix" title="Where money comes from">
          <DonutChart
            data={[
              { name: "Subscriptions", value: 6840, color: "#014B52" },
              { name: "Programme fees", value: 1240, color: "#F5A800" },
              { name: "Sponsor revenue", value: 720, color: "#7A39BB" },
            ]}
            centerLabel="MRR + fees"
            centerValue={formatGBP(8800, { compact: true })}
            size={210}
          />
        </Panel>
      </div>
    </>
  );
}

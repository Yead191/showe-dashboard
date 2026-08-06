import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Clock,
  MousePointerClick,
  Download,
  ArrowUpRight,
  Calendar,
  Plus,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  ScanLine,
  ScrollText,
} from "lucide-react";
import { Button, Spin } from "antd";
import {
  PageHeader,
  StatCard,
  Panel,
  SectionTitle,
  StatusBadge,
} from "@/components/ui";
import { TrendChart } from "@/components/charts/TrendChart";
import { BarsChart } from "@/components/charts/BarsChart";
import { useScopedVenueData } from "@/hooks/useScopedVenueData";
import {
  formatGBP,
  formatNumber,
  formatDwell,
  formatDateShort,
  formatDate,
} from "@/lib/utils";
import { getImageUrl } from "@/helpers/getImageUrl";
import {
  useGetOrganizationDashboardStatsQuery,
  useGetOrganizationRevenueGraphQuery,
  useGetOrganizationViewGraphQuery,
} from "@/store/api/organizationApi/organizationOverviewApi";
import {
  mapApiEventToEventListItem,
  useGetOrganizationEventsQuery,
} from "@/store/api/organizationApi/eventApi";
import { useGetOrganizationActivitiesQuery } from "@/store/api/organizationApi/activitiesApi";
import { useGetProfileQuery } from "@/store/api/authApi";

export default function OverviewPage() {
  const { data: user } = useGetProfileQuery();
  const { activeVenue, isAggregate, totals, programmes } = useScopedVenueData();

  const { data: stats, isLoading: isStatsLoading } =
    useGetOrganizationDashboardStatsQuery();
  const { data: viewGraph, isLoading: isViewLoading } =
    useGetOrganizationViewGraphQuery();
  const { data: revenueGraph, isLoading: isRevenueLoading } =
    useGetOrganizationRevenueGraphQuery();
  const { data: eventsData, isLoading: isEventsLoading } =
    useGetOrganizationEventsQuery({
      page: 1,
      limit: 20,
    });
  const { data: activitiesData, isLoading: isActivitiesLoading } =
    useGetOrganizationActivitiesQuery({
      page: 1,
      limit: 5,
    });

  const viewsChartData = useMemo(
    () =>
      (viewGraph ?? []).map((point) => ({
        date: point.label,
        views: point.views,
        clicks: point.clicks,
      })),
    [viewGraph],
  );

  const revenueChartData = useMemo(
    () =>
      (revenueGraph ?? []).map((point) => ({
        date: point.label,
        value: point.revenue,
      })),
    [revenueGraph],
  );

  const revenueYearTotal = useMemo(
    () =>
      (revenueGraph ?? []).reduce(
        (sum, point) => sum + (point.revenue ?? 0),
        0,
      ),
    [revenueGraph],
  );

  const peakRevenueIndex = useMemo(() => {
    if (!revenueChartData.length) return undefined;
    let maxIdx = 0;
    for (let i = 1; i < revenueChartData.length; i += 1) {
      if (revenueChartData[i].value > revenueChartData[maxIdx].value)
        maxIdx = i;
    }
    return maxIdx;
  }, [revenueChartData]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const published = (eventsData?.events ?? [])
      .map(mapApiEventToEventListItem)
      .filter((e) => e.status === "published" && e.performances[0]?.date)
      .sort((a, b) => {
        const aDate = new Date(a.performances[0]?.date ?? 0).getTime();
        const bDate = new Date(b.performances[0]?.date ?? 0).getTime();
        return aDate - bDate;
      });

    const future = published.filter(
      (e) => new Date(e.performances[0].date) >= today,
    );
    return (future.length > 0 ? future : published).slice(0, 5);
  }, [eventsData?.events]);

  const recentActivities = activitiesData?.activities ?? [];

  const topProgrammes = [...programmes]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 4);

  const totalDownloads = stats?.total_downloads ?? totals.downloads;
  const totalRevenue = stats?.total_revenue ?? totals.revenue;
  const totalEvents = eventsData?.events?.length ?? 0;

  return (
    <>
      <PageHeader
        eyebrow={isAggregate ? "All venues · aggregate" : activeVenue?.name}
        title={
          <span>
            {isAggregate
              ? `Hello, ${user?.name?.split(" ")[0]}`
              : activeVenue?.name}
            <span className="text-accent">.</span>
          </span>
        }
        description={
          isAggregate
            ? `You’ve got ${totalEvents} active event${totalEvents !== 1 ? "s" : ""}. Here’s what’s moving today.`
            : `Activity for ${activeVenue?.city ?? ""}. Switch to “All venues” to see aggregate metrics.`
        }
        actions={
          <>
            <Link to="/owner/events">
              <Button icon={<Calendar size={15} />}>New event</Button>
            </Link>
            <Link to="/owner/programmes">
              <Button type="primary" icon={<Plus size={15} />}>
                New programme
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard
          label="Total downloads"
          value={isStatsLoading ? "..." : formatNumber(totalDownloads)}
          icon={Download}
          accent="primary"
          hint="Across all published programmes"
        />
        <StatCard
          label="Revenue"
          value={
            isStatsLoading ? "..." : formatGBP(totalRevenue, { compact: true })
          }
          icon={TrendingUp}
          accent="amber"
          hint="Net of SHOWE 10% commission"
        />
        <StatCard
          label="Events live"
          value={isStatsLoading ? "..." : String(totalEvents)}
          icon={Calendar}
          accent="info"
          hint={`${totals.programmes} programmes attached`}
        />
        <StatCard
          label="Pending refunds"
          value={String(totals.pending_refunds)}
          icon={ShoppingBag}
          accent="purple"
          hint={
            totals.pending_refunds > 0
              ? "Action recommended"
              : "You’re all clear"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6">
        <Panel
          className="lg:col-span-2"
          eyebrow="Year to date"
          title="Programme views"
          description="Monthly views and clicks across your programmes"
          action={
            <div className="flex items-center gap-3 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" /> Views
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent" /> Clicks
              </span>
            </div>
          }
        >
          {isViewLoading ? (
            <div className="flex justify-center py-16">
              <Spin />
            </div>
          ) : (
            <TrendChart
              data={viewsChartData}
              formatter={(v) => formatNumber(v)}
              height={240}
              series={[
                { key: "views", name: "Views", color: "primary" },
                { key: "clicks", name: "Clicks", color: "accent" },
              ]}
            />
          )}
        </Panel>

        <Panel
          eyebrow="Year to date"
          title="Revenue"
          description="Monthly programme purchases"
          className="lg:col-span-2"
        >
          {isRevenueLoading ? (
            <div className="flex justify-center py-16">
              <Spin />
            </div>
          ) : (
            <>
              <BarsChart
                data={revenueChartData}
                formatter={(v) => formatGBP(v, { compact: true })}
                height={240}
                highlight={peakRevenueIndex}
              />
              <div className="mt-4 pt-4 border-t border-line flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-ink-faint font-bold">
                    Year total
                  </div>
                  <div className="font-display font-extrabold text-2xl text-ink tabular leading-none mt-1">
                    {formatGBP(revenueYearTotal)}
                  </div>
                </div>
              </div>
            </>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Panel
          className="lg:col-span-2"
          title="Upcoming events"
          description="Next five scheduled performances"
          action={
            <Link
              to="/owner/events"
              className="text-sm font-semibold text-primary hover:text-primary-700 inline-flex items-center gap-1"
            >
              See all <ArrowUpRight size={14} />
            </Link>
          }
        >
          {isEventsLoading ? (
            <div className="flex justify-center py-12">
              <Spin />
            </div>
          ) : (
            <ul className="divide-y divide-line -m-1">
              {upcomingEvents.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-ink-muted">
                  No upcoming events. Create your next event to start selling
                  programmes.
                </li>
              )}
              {upcomingEvents.map((e) => {
                const next = e.performances[0];
                const cover = e.cover_image ? getImageUrl(e.cover_image) : "";
                return (
                  <li
                    key={e.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-sunken transition-colors"
                  >
                    <div className="relative shrink-0">
                      {cover ? (
                        <img
                          src={cover}
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover bg-surface-sunken"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-surface-sunken" />
                      )}
                      {e.is_featured && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center text-ink shadow-soft">
                          <Sparkles size={10} />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-[15px] text-ink truncate">
                          {e.title}
                        </h4>
                        <StatusBadge status={e.status} />
                      </div>
                      {next && (
                        <div className="flex items-center gap-3 mt-1 text-[12.5px] text-ink-muted">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDateShort(next.date)} · {next.start_time}
                          </span>
                          <span>·</span>
                          <span className="capitalize">
                            {next.type.replace("_", " ")}
                          </span>
                          {e.performances.length > 1 && (
                            <>
                              <span>·</span>
                              <span>
                                +{e.performances.length - 1} more shows
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-[11px] uppercase tracking-wider text-ink-faint font-bold">
                        Sold
                      </div>
                      <div className="font-display font-extrabold text-base text-ink tabular leading-tight">
                        {formatNumber(e.programme_downloads)}
                      </div>
                    </div>
                    <Link to="/owner/events">
                      <Button type="text" icon={<ArrowUpRight size={14} />} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel eyebrow="Realtime · 24h" title="Programme performance">
          <div className="grid grid-cols-2 gap-3">
            <Metric icon={Eye} label="Views" value="2,480" delta={12.4} />
            <Metric
              icon={Clock}
              label="Avg dwell"
              value={formatDwell(142)}
              delta={4.8}
            />
            <Metric
              icon={MousePointerClick}
              label="Taps"
              value="892"
              delta={18.1}
            />
            <Metric icon={ScanLine} label="QR scans" value="312" delta={6.0} />
          </div>
          <div className="mt-5 pt-5 border-t border-line">
            <SectionTitle title="Top programmes" className="!mb-3" />
            <ul className="space-y-2.5">
              {topProgrammes.map((p) => (
                <li key={p.id} className="flex items-center gap-3 text-sm">
                  <img
                    src={p.cover_image}
                    alt=""
                    className="w-8 h-8 rounded-md object-cover"
                  />
                  <span className="font-medium text-ink truncate flex-1 max-w-[150px]">
                    {p.title}
                  </span>
                  <span className="font-display font-bold text-ink tabular text-sm">
                    {formatNumber(p.downloads)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel
          className="lg:col-span-2"
          title="Recent activity"
          description="Latest changes across your venues, events and programmes"
          action={
            <Link
              to="/owner/settings"
              className="text-sm font-semibold text-primary hover:text-primary-700"
            >
              View audit log
            </Link>
          }
        >
          {isActivitiesLoading ? (
            <div className="flex justify-center py-12">
              <Spin />
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink-muted">
              No recent activity yet.
            </div>
          ) : (
            <ul className="space-y-1">
              {recentActivities.map((activity) => (
                <li
                  key={activity._id}
                  className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-surface-sunken transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-surface-sunken text-ink-muted flex items-center justify-center shrink-0">
                    <ScrollText size={14} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">
                      {activity.title}
                    </div>
                    <div className="text-[11.5px] text-ink-faint mt-0.5 truncate">
                      {activity.description}
                    </div>
                  </div>
                  <span className="chip chip-primary">{activity.type}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          variant="deep"
          eyebrow="Subscription"
          title={`You’re on ${user?.subscription?.name ?? "-"}`}
        >
          <p className="text-ink-inverse/75 text-sm">
            Your subscription unlocks {user?.subscription?.modules?.length}{" "}
            programme builder modules. Renews{" "}
            {user?.subscription?.endDate
              ? formatDate(user.subscription.endDate)
              : "-"}
            .
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-accent-300 font-bold">
                Modules
              </div>
              <div className="font-display font-extrabold text-2xl text-ink-inverse tabular mt-1">
                {user?.subscription?.modules?.length}/10
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-accent-300 font-bold">
                Renews
              </div>
              <div className="font-display font-extrabold text-base text-ink-inverse mt-1">
                {user?.subscription?.endDate
                  ? formatDate(user.subscription.endDate)
                  : "-"}
              </div>
            </div>
          </div>
          <Link
            to="/owner/subscription"
            className="mt-5 inline-flex items-center gap-1.5 text-accent text-sm font-semibold hover:gap-2 transition-all"
          >
            Manage subscription <ArrowUpRight size={14} />
          </Link>
        </Panel>
      </div>
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  delta: number;
}) {
  return (
    <div className="rounded-xl bg-surface-sunken p-3">
      <div className="flex items-center gap-1.5 text-ink-faint text-[11px] uppercase tracking-wider font-bold">
        <Icon size={12} /> {label}
      </div>
      <div className="font-display font-extrabold text-xl text-ink tabular mt-1.5 leading-tight">
        {value}
      </div>
      <div className="text-[11px] text-success font-semibold mt-0.5">
        +{delta}%
      </div>
    </div>
  );
}

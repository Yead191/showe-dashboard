import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Tabs, Button, Table, Dropdown, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Utensils,
  Hotel,
  Wine,
  MapPin,
  Plus,
  MoreHorizontal,
  Search,
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
  MousePointerClick,
  Trophy,
  PoundSterling,
  Star,
  MapPin as MapPinIcon,
  LayoutGrid,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, EmptyState, DeleteConfirmModal, StatCard } from '@/components/ui';
import { formatNumber, formatGBP } from '@/lib/utils';
import { getImageUrl } from '@/helpers/getImageUrl';
import type { Recommendation, RecommendationType } from '@/constants/mock-recommendation';
import {
  mapApiRecommendationToRecommendation,
  useDeleteOrganizationRecommendationMutation,
  useGetOrganizationRecommendationsQuery,
} from '@/store/api/organizationApi/recommendationApi';
import { RecommendationFormModal, TAB_TO_API_CATEGORY } from './RecommendationFormModal';
import { ViewRecommendationModal } from './ViewRecommendationModal';
import { getApiErrorMessage } from '@/lib/api-error';
import { useGetProfileQuery } from '@/store/api/authApi';
import { isModuleUnlocked } from '@/constants/module-blocks';

const RECOMMENDATIONS_MODULE = 8;

type PlanTripTab = 'all' | RecommendationType;

const TAB_META: Record<PlanTripTab, { label: string; icon: typeof Utensils }> = {
  all: { label: 'All', icon: LayoutGrid },
  restaurants: { label: 'Restaurants', icon: Utensils },
  hotels: { label: 'Hotels', icon: Hotel },
  bars: { label: 'Bars', icon: Wine },
};

const TAB_ORDER: PlanTripTab[] = ['all', 'restaurants', 'hotels', 'bars'];
const SEARCH_DEBOUNCE_MS = 300;

function isPlanTripTab(value: string | null): value is PlanTripTab {
  return value === 'all' || value === 'restaurants' || value === 'hotels' || value === 'bars';
}

function tabToCategory(tab: PlanTripTab): string | undefined {
  if (tab === 'all') return undefined;
  return TAB_TO_API_CATEGORY[tab];
}

export default function PlanTripPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery();
  const unlockedModules = profile?.subscription?.modules;
  const hasRecommendationsModule = isModuleUnlocked(
    RECOMMENDATIONS_MODULE,
    unlockedModules
  );

  const tabFromUrl = searchParams.get('tabs');
  const searchFromUrl = searchParams.get('search') ?? '';
  const tab: PlanTripTab = isPlanTripTab(tabFromUrl) ? tabFromUrl : 'all';

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);

  useEffect(() => {
    setSearchInput(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    if (isPlanTripTab(tabFromUrl)) return;
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
      setDebouncedSearch(searchInput);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const trimmed = searchInput.trim();
          if (trimmed) next.set('search', trimmed);
          else next.delete('search');
          if (!isPlanTripTab(next.get('tabs'))) {
            next.set('tabs', tab);
          }
          return next;
        },
        { replace: true }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, setSearchParams, tab]);

  const queryParams = useMemo(
    () => ({
      page: 1,
      limit: 50,
      searchTerm: debouncedSearch.trim() || undefined,
      category: tabToCategory(tab),
    }),
    [debouncedSearch, tab]
  );

  const { data, isLoading, isError, isFetching } =
    useGetOrganizationRecommendationsQuery(queryParams, {
      skip: !hasRecommendationsModule,
    });
  const [deleteRecommendation, { isLoading: isDeleting }] =
    useDeleteOrganizationRecommendationMutation();

  const items = useMemo(
    () => (data?.recommendations ?? []).map(mapApiRecommendationToRecommendation),
    [data?.recommendations]
  );
  const totalCount = data?.pagination?.total ?? items.length;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Recommendation | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Recommendation | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Recommendation | null>(null);

  const meta = TAB_META[tab];
  const formTab: RecommendationType = tab === 'all' ? 'restaurants' : tab;

  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalClicks = items.reduce((acc, item) => acc + item.total_clicks, 0);
    const totalRevenue = items.reduce((acc, item) => acc + item.revenue, 0);
    const averageRating =
      totalItems > 0 ? items.reduce((acc, item) => acc + item.rating, 0) / totalItems : 0;
    const topRecommendation =
      totalItems > 0
        ? items.reduce((best, item) => (item.rating > best.rating ? item : best), items[0])
        : null;

    return { totalItems: totalCount, totalClicks, totalRevenue, averageRating, topRecommendation };
  }, [items, totalCount]);

  function setTab(nextTab: PlanTripTab) {
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

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: Recommendation) {
    setEditing(item);
    setViewOpen(false);
    setFormOpen(true);
  }

  function openView(item: Recommendation) {
    setViewing(item);
    setViewOpen(true);
  }

  function requestDelete(item: Recommendation) {
    setPendingDelete(item);
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      const result = await deleteRecommendation(pendingDelete.id).unwrap();
      toast.success(result.message || `"${pendingDelete.name}" deleted.`);
      setDeleteOpen(false);
      setPendingDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete recommendation.'));
    }
  }

  const columns: ColumnsType<Recommendation> = [
    {
      title: 'Place',
      key: 'place',
      width: '40%',
      render: (_, record) => {
        const imageSrc = record.image ? getImageUrl(record.image) : '';
        return (
          <div className="flex items-center gap-3 min-w-0">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt=""
                className="w-12 h-12 rounded-lg object-cover bg-surface-sunken shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-surface-sunken shrink-0" />
            )}
            <div className="min-w-0">
              <div className="font-semibold text-ink truncate">{record.name}</div>
              <div className="text-[12.5px] text-ink-faint truncate inline-flex items-center gap-1">
                <MapPin size={11} /> {record.location}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: '15%',
      render: (v: string) => <span className="chip">{formatCategoryLabel(v)}</span>,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: '11%',
      sorter: (a, b) => a.rating - b.rating,
      render: (v: number) => (
        <span className="inline-flex items-center gap-1">
          <Star size={12} className="text-accent fill-accent" />
          <span className="font-display font-bold tabular text-ink">{v.toFixed(1)}</span>
        </span>
      ),
    },
    {
      title: 'Distance',
      dataIndex: 'distance',
      key: 'distance',
      width: '11%',
      render: (v: string) => <span className="text-sm text-ink-muted">{v}</span>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: '8%',
      render: (v: string) => <span className="font-display font-bold text-ink">{v}</span>,
    },
    {
      title: 'Views',
      dataIndex: 'total_views',
      key: 'total_views',
      width: '8%',
      sorter: (a, b) => a.total_views - b.total_views,
      render: (v: number) => (
        <span className="inline-flex items-center gap-1 tabular text-sm text-ink">
          <Eye size={12} className="text-ink-faint" />
          {formatNumber(v)}
        </span>
      ),
    },
    {
      title: 'Clicks',
      dataIndex: 'total_clicks',
      key: 'total_clicks',
      width: '8%',
      sorter: (a, b) => a.total_clicks - b.total_clicks,
      render: (v: number) => (
        <span className="inline-flex items-center gap-1 tabular text-sm text-ink">
          <MousePointerClick size={12} className="text-ink-faint" />
          {formatNumber(v)}
        </span>
      ),
    },
    {
      title: 'Link',
      dataIndex: 'url',
      key: 'url',
      width: '7%',
      render: (v: string | undefined) =>
        v ? (
          <a
            href={v}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-primary text-[12.5px] font-semibold hover:underline"
          >
            <ExternalLink size={12} /> Open
          </a>
        ) : (
          <span className="text-ink-faint text-[12.5px]">—</span>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '5%',
      align: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <Eye size={13} />, label: 'View details' },
              { key: 'edit', icon: <Pencil size={13} />, label: 'Edit' },
              { type: 'divider' },
              { key: 'delete', icon: <Trash2 size={13} />, label: 'Delete', danger: true },
            ],
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              if (key === 'view') openView(record);
              if (key === 'edit') openEdit(record);
              if (key === 'delete') requestDelete(record);
            },
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<MoreHorizontal size={15} />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  if (!hasRecommendationsModule) {
    return (
      <>
        <PageHeader
          eyebrow="Recommendations"
          title="Plan your trip"
          description="Curate places near your venue. These appear in Module 8 of your programmes and on event pages."
        />
        <Panel padded>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-[#8A5C00] flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div className="flex-1">
              <div className="eyebrow mb-2">Module 8</div>
              <h2 className="font-display font-extrabold text-2xl text-ink">
                Recommendations require Module 8
              </h2>
              <p className="mt-2 text-ink-muted max-w-xl">
                This page is only available for organisations with Module 8 unlocked in their
                subscription.
                {profile?.subscription?.name ? (
                  <>
                    {' '}
                    You're currently on{' '}
                    <span className="font-semibold text-ink">{profile.subscription.name}</span>.
                  </>
                ) : null}
              </p>
              <div className="mt-5 flex gap-2">
                <Link to="/owner/subscription">
                  <Button type="primary">View subscription</Button>
                </Link>
              </div>
            </div>
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Recommendations"
        title="Plan your trip"
        description="Curate places near your venue. These appear in Module 8 of your programmes and on event pages."
        actions={
          <Button type="primary" icon={<Plus size={14} />} onClick={openAdd}>
            Add recommendation
          </Button>
        }
      />

      <Panel padded={false} className="overflow-hidden">
        <div className="px-5 pt-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5 stagger">
            <StatCard
              label="Total places"
              value={stats.totalItems.toString()}
              icon={MapPinIcon}
              accent="primary"
            />
            <StatCard
              label="Total clicks"
              value={formatNumber(stats.totalClicks)}
              icon={MousePointerClick}
              accent="amber"
            />
            <StatCard
              label="Average rating"
              value={stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
              icon={Star}
              accent="success"
            />
            <StatCard
              label="Total revenue"
              value={formatGBP(stats.totalRevenue)}
              icon={PoundSterling}
              accent="info"
            />
            <StatCard
              label="Top rated"
              value={stats.topRecommendation ? stats.topRecommendation.rating.toFixed(1) : '0'}
              icon={Trophy}
              accent="purple"
            />
          </div>
          {stats.topRecommendation && (
            <div className="rounded-2xl border border-line bg-surface-raised p-4 mb-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300 hover:shadow-medium hover:-translate-y-0.5">
              <span className="inline-flex items-center justify-center rounded-full w-10 h-10 bg-[#FFB30014] text-[#8A5C00] shrink-0">
                <Trophy size={18} strokeWidth={2.25} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="eyebrow !text-ink-faint mb-0.5">Top rated recommendation</p>
                <p className="font-semibold text-ink truncate">{stats.topRecommendation.name}</p>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-right shrink-0">
                <TopStat label="Rating" value={stats.topRecommendation.rating.toFixed(1)} />
                <TopStat label="Distance" value={stats.topRecommendation.distance} />
                <TopStat label="Price" value={stats.topRecommendation.price} />
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-3 border-b border-line">
          <Tabs
            activeKey={tab}
            onChange={(k) => setTab(k as PlanTripTab)}
            items={TAB_ORDER.map((key) => {
              const m = TAB_META[key];
              const Icon = m.icon;
              return {
                key,
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon size={13} />
                    {m.label}
                    {key === tab && (
                      <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
                        {totalCount}
                      </span>
                    )}
                  </span>
                ),
              };
            })}
          />
          <div className="ml-auto relative max-w-xs w-full">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={
                tab === 'all' ? 'Search all recommendations' : `Search ${meta.label.toLowerCase()}`
              }
              className="input-base !h-10 pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={MapPin}
            title="Couldn’t load recommendations"
            description="Something went wrong fetching your places. Please try again."
          />
        ) : items.length === 0 && !debouncedSearch.trim() ? (
          <EmptyState
            icon={MapPin}
            title={tab === 'all' ? 'No recommendations yet' : `No ${meta.label.toLowerCase()} yet`}
            description="Add nearby spots to recommend to programme holders."
            action={
              <Button type="primary" icon={<Plus size={14} />} onClick={openAdd}>
                Add first recommendation
              </Button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matches"
            description={
              tab === 'all'
                ? `No recommendations match "${debouncedSearch}".`
                : `No ${meta.label.toLowerCase()} match "${debouncedSearch}".`
            }
          />
        ) : (
          <Table
            rowKey="id"
            dataSource={items}
            columns={columns}
            loading={isFetching}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            rowClassName="cursor-pointer"
            onRow={(record) => ({
              onClick: () => openView(record),
            })}
            scroll={{ x: 900 }}
          />
        )}
      </Panel>

      <RecommendationFormModal
        open={formOpen}
        tab={formTab}
        editing={editing}
        onCancel={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <ViewRecommendationModal
        open={viewOpen}
        recommendation={viewing}
        onCancel={() => setViewOpen(false)}
        onEdit={(item) => openEdit(item)}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onCancel={() => {
          setDeleteOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        title="Delete recommendation?"
        description="This will permanently remove the recommendation from this list. It will no longer appear in your programmes or event pages."
        targetName={pendingDelete?.name}
      />
    </>
  );
}

function TopStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[80px]">
      <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">{label}</div>
      <div className="font-display font-bold tabular text-ink text-sm leading-tight mt-0.5">{value}</div>
    </div>
  );
}

function formatCategoryLabel(category: string): string {
  const normalized = category.trim().toLowerCase();
  if (normalized.startsWith('restrudant') || normalized === 'restaurants') return 'Restaurant';
  if (normalized === 'hotel' || normalized === 'hotels') return 'Hotel';
  if (normalized === 'bar' || normalized === 'bars') return 'Bar';
  if (normalized === 'other') return 'Other';
  return category;
}

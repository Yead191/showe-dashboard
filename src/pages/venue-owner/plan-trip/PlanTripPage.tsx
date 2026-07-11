import { useMemo, useState } from 'react';
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

const TAB_META: Record<
  RecommendationType,
  { label: string; icon: typeof Utensils }
> = {
  restaurants: { label: 'Restaurants', icon: Utensils },
  hotels: { label: 'Hotels', icon: Hotel },
  bars: { label: 'Bars', icon: Wine },
};

const TAB_ORDER: RecommendationType[] = ['restaurants', 'hotels', 'bars'];

function matchesTab(category: string, tab: RecommendationType): boolean {
  const normalized = category.trim().toLowerCase();
  const expected = TAB_TO_API_CATEGORY[tab];
  if (normalized === expected) return true;
  if (tab === 'restaurants') {
    return normalized.startsWith('restrudant') || normalized === 'restaurant' || normalized === 'restaurants';
  }
  if (tab === 'hotels') return normalized === 'hotel' || normalized === 'hotels';
  if (tab === 'bars') return normalized === 'bar' || normalized === 'bars';
  return false;
}

export default function PlanTripPage() {
  const [tab, setTab] = useState<RecommendationType>('restaurants');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, isFetching } = useGetOrganizationRecommendationsQuery({
    page: 1,
    limit: 50,
  });
  const [deleteRecommendation, { isLoading: isDeleting }] =
    useDeleteOrganizationRecommendationMutation();

  const allItems = useMemo(
    () => (data?.recommendations ?? []).map(mapApiRecommendationToRecommendation),
    [data?.recommendations]
  );

  const byTab = useMemo(() => {
    return {
      restaurants: allItems.filter((i) => matchesTab(i.category, 'restaurants')),
      hotels: allItems.filter((i) => matchesTab(i.category, 'hotels')),
      bars: allItems.filter((i) => matchesTab(i.category, 'bars')),
    } satisfies Record<RecommendationType, Recommendation[]>;
  }, [allItems]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Recommendation | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Recommendation | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Recommendation | null>(null);

  const items = byTab[tab];
  const meta = TAB_META[tab];

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q),
    );
  }, [items, search]);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalClicks = items.reduce((acc, item) => acc + item.total_clicks, 0);
    const totalRevenue = items.reduce((acc, item) => acc + item.revenue, 0);
    const averageRating = totalItems > 0 ? items.reduce((acc, item) => acc + item.rating, 0) / totalItems : 0;
    const topRecommendation = totalItems > 0
      ? items.reduce((best, item) => (item.rating > best.rating ? item : best), items[0])
      : null;

    return { totalItems, totalClicks, totalRevenue, averageRating, topRecommendation };
  }, [items]);

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
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message || 'Failed to delete recommendation.');
    }
  }

  const columns: ColumnsType<Recommendation> = [
    {
      title: 'Place',
      key: 'place',
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
      width: 150,
      render: (v: string) => <span className="chip">{formatCategoryLabel(v)}</span>,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 110,
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
      width: 110,
      render: (v: string) => <span className="text-sm text-ink-muted">{v}</span>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (v: string) => <span className="font-display font-bold text-ink">{v}</span>,
    },
    {
      title: 'Link',
      dataIndex: 'url',
      key: 'url',
      width: 80,
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
      title: '',
      key: 'actions',
      width: 50,
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
            onChange={(k) => {
              setTab(k as RecommendationType);
              setSearch('');
            }}
            items={TAB_ORDER.map((key) => {
              const m = TAB_META[key];
              const Icon = m.icon;
              return {
                key,
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon size={13} />
                    {m.label}
                    <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
                      {byTab[key].length}
                    </span>
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${meta.label.toLowerCase()}`}
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
        ) : items.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={`No ${meta.label.toLowerCase()} yet`}
            description="Add nearby spots to recommend to programme holders."
            action={
              <Button type="primary" icon={<Plus size={14} />} onClick={openAdd}>
                Add first recommendation
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matches"
            description={`No ${meta.label.toLowerCase()} match "${search}".`}
          />
        ) : (
          <Table
            rowKey="id"
            dataSource={filtered}
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
        tab={tab}
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

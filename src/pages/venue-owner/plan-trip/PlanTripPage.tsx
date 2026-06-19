import { useMemo, useState } from 'react';
import { Tabs, Button, Table, Dropdown } from 'antd';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { Star, MapPin as MapPinIcon } from 'lucide-react';
import { PageHeader, Panel, EmptyState, DeleteConfirmModal, StatCard } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import {
  MOCK_RECOMMENDATION,
  type Recommendation,
  type RecommendationType,
} from '@/constants/mock-recommendation';
import { RecommendationFormModal } from './RecommendationFormModal';
import { ViewRecommendationModal } from './ViewRecommendationModal';

const TAB_META: Record<
  RecommendationType,
  { label: string; icon: typeof Utensils; storeKey: 'nearby_restaurants' | 'nearby_hotels' | 'nearby_bars' }
> = {
  restaurants: { label: 'Restaurants', icon: Utensils, storeKey: 'nearby_restaurants' },
  hotels: { label: 'Hotels', icon: Hotel, storeKey: 'nearby_hotels' },
  bars: { label: 'Bars', icon: Wine, storeKey: 'nearby_bars' },
};

const TAB_ORDER: RecommendationType[] = ['restaurants', 'hotels', 'bars'];

type RecommendationsState = Record<RecommendationType, Recommendation[]>;

export default function PlanTripPage() {
  const [tab, setTab] = useState<RecommendationType>('restaurants');
  const [search, setSearch] = useState('');

  const [data, setData] = useState<RecommendationsState>({
    restaurants: MOCK_RECOMMENDATION.nearby_restaurants,
    hotels: MOCK_RECOMMENDATION.nearby_hotels,
    bars: MOCK_RECOMMENDATION.nearby_bars,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Recommendation | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Recommendation | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Recommendation | null>(null);

  const items = data[tab];
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
    const averageRating = totalItems > 0 ? items.reduce((acc, item) => acc + item.rating, 0) / totalItems : 0;
    const topRecommendation = totalItems > 0
      ? items.reduce((best, item) => (item.total_clicks > best.total_clicks ? item : best), items[0])
      : null;

    return { totalItems, totalClicks, averageRating, topRecommendation };
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

  function handleSave(values: Recommendation) {
    setData((prev) => {
      const list = prev[tab];
      const exists = list.some((i) => i.id === values.id);
      return {
        ...prev,
        [tab]: exists
          ? list.map((i) => (i.id === values.id ? values : i))
          : [values, ...list],
      };
    });
    toast.success(editing ? 'Recommendation updated.' : 'Recommendation added.');
    setFormOpen(false);
    setEditing(null);
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    setData((prev) => ({
      ...prev,
      [tab]: prev[tab].filter((i) => i.id !== pendingDelete.id),
    }));
    toast.success(`"${pendingDelete.name}" deleted.`);
    setDeleteOpen(false);
    setPendingDelete(null);
  }

  const columns: ColumnsType<Recommendation> = [
    {
      title: 'Place',
      key: 'place',
      render: (_, record) => (
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={record.image}
            alt=""
            className="w-12 h-12 rounded-lg object-cover bg-surface-sunken shrink-0"
          />
          <div className="min-w-0">
            <div className="font-semibold text-ink truncate">{record.name}</div>
            <div className="text-[12.5px] text-ink-faint truncate inline-flex items-center gap-1">
              <MapPin size={11} /> {record.location}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (v: string) => <span className="chip">{v}</span>,
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
      title: 'Clicks',
      dataIndex: 'total_clicks',
      key: 'total_clicks',
      width: 110,
      sorter: (a, b) => a.total_clicks - b.total_clicks,
      render: (v: number) => (
        <span className="font-display font-bold tabular text-ink">{v.toLocaleString()}</span>
      ),
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5 stagger">
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
              label="Most clicked"
              value={stats.topRecommendation ? formatNumber(stats.topRecommendation.total_clicks) : '0'}
              icon={Trophy}
              accent="info"
            />
          </div>
          {stats.topRecommendation && (
            <div className="rounded-2xl border border-line bg-surface-raised p-4 mb-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300 hover:shadow-medium hover:-translate-y-0.5">
              <span className="inline-flex items-center justify-center rounded-full w-10 h-10 bg-[#FFB30014] text-[#8A5C00] shrink-0">
                <Trophy size={18} strokeWidth={2.25} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="eyebrow !text-ink-faint mb-0.5">Top performing recommendation · most clicks</p>
                <p className="font-semibold text-ink truncate">{stats.topRecommendation.name}</p>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-right shrink-0">
                <TopStat label="Clicks" value={formatNumber(stats.topRecommendation.total_clicks)} />
                <TopStat label="Rating" value={stats.topRecommendation.rating.toFixed(1)} />
                <TopStat label="Distance" value={stats.topRecommendation.distance} />
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
                      {data[key].length}
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

        {items.length === 0 ? (
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
            pagination={{ pageSize: 8, showSizeChanger: false }}
            rowClassName="cursor-pointer"
            onRow={(record) => ({
              onClick: () => openView(record),
            })}
            scroll={{ x: 1080 }}
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
        onSave={handleSave}
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

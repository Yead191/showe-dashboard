import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Button, Dropdown, Tabs, Drawer, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Sparkles,
  MoreHorizontal,
  Sun,
  Moon,
  ScanLine,

  Pencil,
  Trash2,

  CalendarPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, StatusBadge, EmptyState } from '@/components/ui';
import type { EventListItem, EventStatus } from '@/types/event';
import { formatNumber, formatDateShort } from '@/lib/utils';
import { getImageUrl } from '@/helpers/getImageUrl';
import { EventFormDrawer } from '@/features/events/EventFormDrawer';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import {
  mapApiEventToEventListItem,
  useDeleteOrganizationEventMutation,
  useGetOrganizationEventsQuery,
} from '@/store/api/organizationApi/eventApi';
import { getApiErrorMessage } from '@/lib/api-error';

type EventsTab = EventStatus | 'all';

const STATUS_FILTERS: { key: EventsTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
  { key: 'cancelled', label: 'Cancelled' },
];

const SEARCH_DEBOUNCE_MS = 300;

function isEventsTab(value: string | null): value is EventsTab {
  return (
    value === 'all' ||
    value === 'published' ||
    value === 'draft' ||
    value === 'cancelled' ||
    value === 'archived'
  );
}

function tabToStatus(tab: EventsTab): string | undefined {
  return tab === 'all' ? undefined : tab;
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get('tabs');
  const searchFromUrl = searchParams.get('search') ?? '';
  const tab: EventsTab = isEventsTab(tabFromUrl) ? tabFromUrl : 'all';

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EventListItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventListItem | null>(null);

  useEffect(() => {
    setSearchInput(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    if (isEventsTab(tabFromUrl)) return;
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
      setPage(1);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const trimmed = searchInput.trim();
          if (trimmed) next.set('search', trimmed);
          else next.delete('search');
          if (!isEventsTab(next.get('tabs'))) {
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
      status: tabToStatus(tab),
    }),
    [debouncedSearch, tab]
  );

  const { data, isLoading, isError, isFetching } = useGetOrganizationEventsQuery(queryParams);
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteOrganizationEventMutation();

  const events = useMemo(
    () => (data?.events ?? []).map(mapApiEventToEventListItem),
    [data?.events]
  );
  const totalCount = data?.pagination?.total ?? events.length;

  function setTab(nextTab: EventsTab) {
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

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(e: EventListItem) {
    setEditing(e);
    setDrawerOpen(true);
  }

  function handleDeleteClick(e: EventListItem) {
    setEventToDelete(e);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!eventToDelete) return;
    try {
      const result = await deleteEvent(eventToDelete.id).unwrap();
      toast.success(result.message || `"${eventToDelete.title}" deleted.`);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete event.'));
    }
  }

  const columns: ColumnsType<EventListItem> = [
    {
      title: 'Event',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => {
        const cover = record.cover_image ? getImageUrl(record.cover_image) : '';
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {cover ? (
                <img src={cover} alt="" className="w-11 h-11 rounded-lg object-cover bg-surface-sunken" />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-surface-sunken" />
              )}
              {record.is_featured && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                  <Sparkles size={9} className="text-ink" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-ink truncate">{record.title}</div>
              <div className="text-[12.5px] text-ink-faint truncate">
                {record.venue_name} · {record.category}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Performances',
      key: 'performances',
      width: 220,
      render: (_, record) => (
        <div>
          <div className="text-sm text-ink font-medium">
            {record.performances.length} show{record.performances.length !== 1 ? 's' : ''}
          </div>
          {record.performances[0]?.date && (
            <div className="text-[12px] text-ink-faint mt-0.5 flex items-center gap-2">
              <Calendar size={11} /> Next {formatDateShort(record.performances[0].date)} ·{' '}
              {record.performances[0].start_time}
            </div>
          )}
          <div className="flex items-center gap-1 mt-1.5">
            {record.performances.slice(0, 4).map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px]"
                style={{
                  background: p.type === 'matinee' ? 'rgba(218, 113, 1, 0.10)' : 'rgba(1, 75, 82, 0.08)',
                  color: p.type === 'matinee' ? '#DA7101' : '#014B52',
                }}
                title={p.type}
              >
                {p.type === 'matinee' ? <Sun size={11} /> : <Moon size={11} />}
              </span>
            ))}
            {record.performances.length > 4 && (
              <span className="text-[11px] text-ink-faint">+{record.performances.length - 4}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      width: 140,
      render: (_, record) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin size={12} className="text-ink-faint" /> {record.location_city}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: EventStatus) => <StatusBadge status={status} />,
    },
    {
      title: 'QR scans',
      dataIndex: 'qr_scans',
      key: 'qr_scans',
      width: 110,
      render: (v: number) => (
        <div className="inline-flex items-center gap-1.5 font-display font-bold tabular text-ink">
          <ScanLine size={12} className="text-ink-faint" />
          {formatNumber(v)}
        </div>
      ),
    },
    {
      title: 'Downloads',
      dataIndex: 'programme_downloads',
      key: 'downloads',
      width: 110,
      render: (v: number) => (
        <span className="font-display font-bold tabular text-ink">{formatNumber(v)}</span>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 120,
      render: (_: any, record: any) => (
        <span className="font-display font-bold tabular text-ink">
          £{record.revenue}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 50,
      align: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              // { key: 'view', icon: <Eye size={13} />, label: 'View on app' },
              { key: 'edit', icon: <Pencil size={13} />, label: 'Edit event' },
              // { key: 'duplicate', icon: <Copy size={13} />, label: 'Duplicate' },
              // { type: 'divider' },
              { key: 'delete', icon: <Trash2 size={13} />, label: 'Delete', danger: true },
            ],
            onClick: ({ key }) => {
              if (key === 'edit') openEdit(record);
              if (key === 'duplicate') toast.message('Duplicate is not available yet.');
              if (key === 'delete') handleDeleteClick(record);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreHorizontal size={15} />} />
        </Dropdown>
      ),
    },
  ];
// console.log(events)
  return (
    <>
      <PageHeader
        eyebrow="Programming"
        title="Events"
        description="Each event has its own QR code and one or more performances. Programmes are linked to events."
        actions={
          <Button type="primary" icon={<Plus size={15} />} onClick={openCreate}>
            New event
          </Button>
        }
      />

      <Panel padded={false} className="overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex flex-wrap items-center gap-3 border-b border-line">
          <Tabs
            activeKey={tab}
            onChange={(k) => setTab(k as EventsTab)}
            items={STATUS_FILTERS.map((s) => ({
              key: s.key,
              label: (
                <span className="inline-flex items-center gap-1.5">
                  {s.label}
                  {s.key === tab && (
                    <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
                      {totalCount}
                    </span>
                  )}
                </span>
              ),
            }))}
          />
          <div className="ml-auto relative max-w-xs w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search events"
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
            icon={CalendarPlus}
            title="Couldn’t load events"
            description="Something went wrong fetching your events. Please try again."
          />
        ) : events.length === 0 && !debouncedSearch.trim() ? (
          <EmptyState
            icon={CalendarPlus}
            title="No events here yet"
            description="Schedule a new event to start selling programmes."
            action={
              <Button type="primary" icon={<Plus size={14} />} onClick={openCreate}>
                Create event
              </Button>
            }
          />
        ) : events.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matches"
            description={`No events match "${debouncedSearch}".`}
          />
        ) : (
          <Table
            rowKey="id"
            dataSource={events}
            columns={columns}
            loading={isFetching}
            pagination={{
              current: page,
              pageSize: 8,
              showSizeChanger: false,
              onChange: setPage,
            }}
            rowClassName="cursor-pointer"
            scroll={{ x: 1080 }}
          />
        )}
      </Panel>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={820}
        title={editing ? 'Edit event' : 'Create new event'}
        styles={{ body: { padding: 0, background: '#F6F4EF' } }}
        destroyOnHidden
      >
        <EventFormDrawer
          key={editing?.id || 'new'}
          event={editing}
          onSave={() => setDrawerOpen(false)}
          onCancel={() => setDrawerOpen(false)}
        />
      </Drawer>

      <DeleteConfirmModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        title="Delete event?"
        description="This will permanently remove the event and all associated performance data."
        targetName={eventToDelete?.title}
      />
    </>
  );
}

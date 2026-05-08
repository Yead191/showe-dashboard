import { useMemo, useState } from 'react';
import { Table, Button, Dropdown, Tabs, Modal, Drawer } from 'antd';
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
  Eye,
  Pencil,
  Trash2,
  Copy,
  CalendarPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, StatusBadge, EmptyState } from '@/components/ui';
import { useScopedVenueData } from '@/hooks/useScopedVenueData';
import type { EventListItem, EventStatus } from '@/types/event';
import { formatGBP, formatNumber, formatDateShort } from '@/lib/utils';
import { EventFormDrawer } from '@/features/events/EventFormDrawer';

const STATUS_FILTERS: { key: EventStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
  { key: 'archived', label: 'Archived' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function EventsPage() {
  const { events } = useScopedVenueData();
  const [search, setSearch] = useState('');
  const [statusKey, setStatusKey] = useState<EventStatus | 'all'>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EventListItem | null>(null);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (statusKey !== 'all' && e.status !== statusKey) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [events, search, statusKey]);

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(e: EventListItem) {
    setEditing(e);
    setDrawerOpen(true);
  }

  const counts = useMemo(() => {
    const acc: Record<string, number> = { all: events.length };
    for (const e of events) acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, [events]);

  const columns: ColumnsType<EventListItem> = [
    {
      title: 'Event',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img src={record.cover_image} alt="" className="w-11 h-11 rounded-lg object-cover bg-surface-sunken" />
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
      ),
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
          <div className="text-[12px] text-ink-faint mt-0.5 flex items-center gap-2">
            <Calendar size={11} /> Next {formatDateShort(record.performances[0].date)} · {record.performances[0].start_time}
          </div>
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
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{formatNumber(v)}</span>,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 120,
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{formatGBP(v, { compact: true })}</span>,
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
              { key: 'view', icon: <Eye size={13} />, label: 'View on app' },
              { key: 'edit', icon: <Pencil size={13} />, label: 'Edit event' },
              { key: 'duplicate', icon: <Copy size={13} />, label: 'Duplicate' },
              { type: 'divider' },
              { key: 'delete', icon: <Trash2 size={13} />, label: 'Delete', danger: true },
            ],
            onClick: ({ key }) => {
              if (key === 'edit') openEdit(record);
              if (key === 'duplicate') toast.success('Event duplicated.');
              if (key === 'delete')
                Modal.confirm({
                  title: 'Delete event?',
                  content: `“${record.title}” will be removed permanently.`,
                  okText: 'Delete',
                  okButtonProps: { danger: true },
                  onOk: () => toast.success('Event deleted (mock).'),
                });
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreHorizontal size={15} />} />
        </Dropdown>
      ),
    },
  ];

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
        {/* Toolbar */}
        <div className="px-5 pt-5 pb-3 flex flex-wrap items-center gap-3 border-b border-line">
          <Tabs
            activeKey={statusKey}
            onChange={(k) => setStatusKey(k as EventStatus | 'all')}
            items={STATUS_FILTERS.map((s) => ({
              key: s.key,
              label: (
                <span className="inline-flex items-center gap-1.5">
                  {s.label}
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
                    {counts[s.key] ?? 0}
                  </span>
                </span>
              ),
            }))}
          />
          <div className="ml-auto relative max-w-xs w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events"
              className="input-base !h-10 pl-10"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
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
        ) : (
          <Table
            rowKey="id"
            dataSource={filtered}
            columns={columns}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            onRow={(record) => ({ onClick: () => openEdit(record) })}
            scroll={{ x: 1080 }}
            rowClassName="cursor-pointer"
          />
        )}
      </Panel>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={720}
        title={editing ? 'Edit event' : 'Create new event'}
        styles={{ body: { padding: 0, background: '#F6F4EF' } }}
      >
        <EventFormDrawer
          event={editing}
          onSave={() => {
            toast.success(editing ? 'Event updated.' : 'Event created.');
            setDrawerOpen(false);
          }}
          onCancel={() => setDrawerOpen(false)}
        />
      </Drawer>
    </>
  );
}

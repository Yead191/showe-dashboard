import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Button, Dropdown, Tabs, Drawer, Form, Grid } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  Crown,
  CheckCircle2,
  Settings,
  Trash2,
  Building2,
  Mail,
  Phone,
  Calendar,
  Zap,
  BarChart3,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, TierBadge, StatusBadge, Avatar, SectionTitle, DeleteConfirmModal } from '@/components/ui';
import { mockProgrammes } from '@/constants/mock-data';
import type { VenueOwner } from '@/types/venue';
import { formatGBP, formatDate, } from '@/lib/utils';
import UpdateProfileModal from './UpdateProfileModal';
import TierOverrideModal from './TierOverrideModal';
import SuspendModal from './SuspendModal';
import { imageUrl } from '@/store/api/baseApi';
import {
  useDeleteVenueMutation,
  useGetVenuesQuery,
  type ApiVenue,
} from '@/store/api/venuesApi';

type VenuesTab = 'all' | 'active' | 'pending' | 'suspended';

const SEARCH_DEBOUNCE_MS = 300;

function isVenuesTab(value: string | null): value is VenuesTab {
  return value === 'all' || value === 'active' || value === 'pending' || value === 'suspended';
}

function tabToStatus(tab: VenuesTab): string | undefined {
  return tab === 'all' ? undefined : tab;
}

function venueToOwner(venue: ApiVenue): VenueOwner {
  return {
    id: venue.owner._id,
    name: venue.owner.name,
    email: venue.owner.email,
    org_name: venue.name,
    org_type: 'venue',
    tier: 'tier_1',
    status: venue.status,
    venues_count: 1,
    total_revenue: venue.total_revenue,
    joined_at: venue.createdAt,
    avatar_url: venue.owner.image,
    subscription_status: 'active',
  };
}

export default function AdminVenuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') ?? '';
  const tabFromUrl = searchParams.get('tabs');
  const tab: VenuesTab = isVenuesTab(tabFromUrl) ? tabFromUrl : 'all';

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { xxl } = Grid.useBreakpoint();

  useEffect(() => {
    setSearchInput(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    if (isVenuesTab(tabFromUrl)) return;
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
      const trimmed = searchInput.trim();
      setDebouncedSearch(trimmed);
      setPage(1);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) next.set('search', trimmed);
          else next.delete('search');
          if (!isVenuesTab(next.get('tabs'))) {
            next.set('tabs', tab);
          }
          return next;
        },
        { replace: true }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, setSearchParams, tab]);

  const { data: venuesData, isLoading, isFetching } = useGetVenuesQuery({
    page,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
    status: tabToStatus(tab),
  });
  const [deleteVenue, { isLoading: isDeleting }] = useDeleteVenueMutation();

  const venues = venuesData?.venues ?? [];
  const totalCount = venuesData?.pagination?.total ?? venues.length;

  function setTab(nextTab: VenuesTab) {
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

  // Interaction states
  const [selectedOwner, setSelectedOwner] = useState<VenueOwner | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<ApiVenue | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [form] = Form.useForm();
  const [tierForm] = Form.useForm();
  const [suspendForm] = Form.useForm();

  const handleEdit = (venue: ApiVenue) => {
    const owner = venueToOwner(venue);
    setSelectedVenue(venue);
    setSelectedOwner(owner);
    form.setFieldsValue(owner);
    setIsUpdateModalOpen(true);
  };

  const handleTierOverride = (venue: ApiVenue) => {
    const owner = venueToOwner(venue);
    setSelectedVenue(venue);
    setSelectedOwner(owner);
    tierForm.setFieldsValue({ tier: owner.tier });
    setIsTierModalOpen(true);
  };

  const handleSuspend = (venue: ApiVenue) => {
    const owner = venueToOwner(venue);
    setSelectedVenue(venue);
    setSelectedOwner(owner);
    suspendForm.setFieldsValue({ reason: '', duration: 7 });
    setIsSuspendModalOpen(true);
  };

  const handleDelete = (venue: ApiVenue) => {
    setSelectedVenue(venue);
    setSelectedOwner(venueToOwner(venue));
    setIsDeleteModalOpen(true);
  };

  const columns: ColumnsType<ApiVenue> = [
    {
      title: 'Venue & Owner',
      dataIndex: 'name',
      render: (_, venue) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={venue.owner.image} name={venue.owner.name} size={40} ring />
          <div className="min-w-0">
            <div className="font-bold text-ink truncate leading-tight">{venue.name}</div>
            <div className="text-[12px] text-ink-faint truncate mt-0.5">
              {venue.owner.name} · {venue.owner.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'city',
      render: (_, venue) => (
        <span className="chip">
          {venue.city}
          {venue.country ? `, ${venue.country}` : ''}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s) => <StatusBadge status={s} />,
    },
    {
      title: 'Programmes',
      dataIndex: 'programmes_count',
      align: 'center',
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{v}</span>,
    },
    {
      title: 'Events',
      dataIndex: 'events_count',
      align: 'center',
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{v}</span>,
    },
    {
      title: 'Total Revenue',
      dataIndex: 'total_revenue',
      render: (v: number) => (
        <span className="font-display font-bold tabular text-ink">{formatGBP(v, { compact: true })}</span>
      ),
    },
    ...(xxl
      ? [
          {
            title: 'Created',
            dataIndex: 'createdAt',
            render: (d: string) => <span className="text-[12.5px] text-ink-muted">{formatDate(d)}</span>,
          },
        ]
      : []),
    {
      title: '',
      align: 'right',
      render: (_, venue) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <Eye size={13} />, label: 'View full details' },
              { key: 'edit', icon: <Settings size={13} />, label: 'Update profile' },
              { key: 'tier', icon: <Crown size={13} />, label: 'Override tier' },
              { type: 'divider' },
              venue.status === 'pending'
                ? { key: 'approve', icon: <CheckCircle2 size={13} />, label: 'Approve' }
                : null,
              venue.status !== 'suspended'
                ? { key: 'suspend', icon: <Ban size={13} />, label: 'Suspend venue', danger: true }
                : { key: 'unsuspend', icon: <CheckCircle2 size={13} />, label: 'Unsuspend venue' },
              { key: 'delete', icon: <Trash2 size={13} />, label: 'Delete permanently', danger: true },
            ].filter(Boolean) as never,
            onClick: ({ key }) => {
              if (key === 'view') {
                setSelectedVenue(venue);
                setSelectedOwner(venueToOwner(venue));
                setIsDrawerOpen(true);
              } else if (key === 'edit') handleEdit(venue);
              else if (key === 'tier') handleTierOverride(venue);
              else if (key === 'suspend') handleSuspend(venue);
              else if (key === 'delete') handleDelete(venue);
              else if (key === 'approve') toast.success(`${venue.name} approved successfully.`);
              else if (key === 'unsuspend') toast.success(`${venue.name} has been unsuspended.`);
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
        eyebrow="Network"
        title="Venues & owners"
        description="Comprehensive management of all theatre venues, schools, and production companies on the platform."
      />

      <Panel padded={false} className="overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-3 border-b border-line">
          <Tabs
            activeKey={tab}
            onChange={(k) => setTab(k as VenuesTab)}
            items={[
              {
                key: 'all',
                label: tabLabel('All entities', tab === 'all' ? totalCount : undefined),
              },
              {
                key: 'active',
                label: tabLabel('Active', tab === 'active' ? totalCount : undefined),
              },
              {
                key: 'pending',
                label: tabLabel('Pending', tab === 'pending' ? totalCount : undefined),
              },
              {
                key: 'suspended',
                label: tabLabel('Suspended', tab === 'suspended' ? totalCount : undefined),
              },
            ]}
          />
          <div className="ml-auto relative max-w-xs w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by organisation, owner or email"
              className="input-base !h-10 pl-10"
            />
          </div>
        </div>

        <Table
          rowKey="_id"
          dataSource={venues}
          locale={{
            emptyText: debouncedSearch
              ? `No venues match "${debouncedSearch}".`
              : 'No venues in this category.',
          }}
          columns={columns}
          loading={isLoading || isFetching}
          pagination={{
            current: venuesData?.pagination.page ?? page,
            pageSize: venuesData?.pagination.limit ?? pageSize,
            total: venuesData?.pagination.total ?? 0,
            showSizeChanger: true,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
          className="premium-table"
          scroll={{ x: 1080 }}
        />
      </Panel>

      {/* Owner Detail Drawer */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedOwner(null);
          setSelectedVenue(null);
        }}
        width={640}
        title={<span className="font-display font-bold">Organisation Details</span>}
        className="premium-drawer"
      >
        {selectedVenue && selectedOwner && (
          <OwnerDrawerContent
            venue={selectedVenue}
            owner={selectedOwner}
            onEdit={() => handleEdit(selectedVenue)}
            onTier={() => handleTierOverride(selectedVenue)}
            onSuspend={() => handleSuspend(selectedVenue)}
          />
        )}
      </Drawer>

      {/* Update Profile Modal */}
      <UpdateProfileModal form={form} isUpdateModalOpen={isUpdateModalOpen} setIsUpdateModalOpen={setIsUpdateModalOpen} />

      {/* Tier Override Modal */}
      <TierOverrideModal isTierModalOpen={isTierModalOpen} setIsTierModalOpen={setIsTierModalOpen} tierForm={tierForm} selectedOwner={selectedOwner} />

      {/* Suspend Modal */}
      <SuspendModal isSuspendModalOpen={isSuspendModalOpen} setIsSuspendModalOpen={setIsSuspendModalOpen} suspendForm={suspendForm} selectedOwner={selectedOwner} />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (!selectedVenue) return;
          try {
            const response = await deleteVenue(selectedVenue._id).unwrap();
            toast.success(response.message || 'Venue deleted successfully.');
            setIsDeleteModalOpen(false);
            setSelectedVenue(null);
            setSelectedOwner(null);
          } catch (err) {
            const errorMessage =
              typeof err === 'object' && err !== null && 'data' in err
                ? ((err as { data?: { message?: string } }).data?.message ?? 'Failed to delete venue.')
                : 'Failed to delete venue.';
            toast.error(errorMessage);
          }
        }}
        loading={isDeleting}
        title="Delete Venue?"
        description="This will permanently remove the venue and all related data. This cannot be undone."
        targetName={selectedVenue?.name}
      />
    </>
  );
}

function OwnerDrawerContent({
  venue,
  owner,
  onEdit,
  onTier,
  onSuspend,
}: {
  venue: ApiVenue;
  owner: VenueOwner;
  onEdit: () => void;
  onTier: () => void;
  onSuspend: () => void;
}) {
  const ownerProgrammes = mockProgrammes.filter((p) => p.venue_id === venue._id);
  const coverImage = venue.cover_image.startsWith('http')
    ? venue.cover_image
    : `${imageUrl}${venue.cover_image}`;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <Avatar src={owner.avatar_url} name={owner.name} size={80} ring />
          <div>
            <h2 className="font-display font-black text-3xl text-ink leading-tight">{venue.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <TierBadge tier={owner.tier} />
              <StatusBadge status={venue.status} />
            </div>
          </div>
        </div>
        <Button icon={<Settings size={16} />} onClick={onEdit} className="rounded-xl">Edit</Button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-line h-40">
        <img src={coverImage} alt={venue.name} className="w-full h-full object-cover" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem icon={BookOpen} label="Programmes" value={String(venue.programmes_count)} />
        <StatItem icon={Zap} label="Events" value={String(venue.events_count)} />
        <StatItem icon={TrendingUp} label="Downloads" value={String(venue.total_downloads)} />
        <StatItem icon={BarChart3} label="Revenue" value={formatGBP(venue.total_revenue, { compact: true })} />
      </div>

      <div className="space-y-6">
        <div>
          <SectionTitle title="Owner Information" />
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 mt-4 p-5 rounded-2xl bg-surface-sunken/50 border border-line">
            <InfoField icon={Building2} label="Venue" value={venue.name} />
            <InfoField icon={Mail} label="Owner Email" value={owner.email} />
            <InfoField icon={Phone} label="Contact Phone" value={venue.contact_phone || 'Not provided'} />
            <InfoField icon={Calendar} label="Created Date" value={formatDate(venue.createdAt)} />
            <InfoField icon={Building2} label="Address" value={`${venue.address_line1}, ${venue.city}`} />
            <InfoField icon={Mail} label="Contact Email" value={venue.contact_email} />
          </div>
        </div>

        <div>
          <SectionTitle
            title="Published Programmes"
            action={<span className="text-[10px] font-black uppercase tracking-widest text-ink-faint">Live now</span>}
          />
          <div className="space-y-3 mt-4">
            {ownerProgrammes.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-raised border border-line hover:border-line-strong transition-all shadow-sm">
                <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-line">
                  <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink truncate">{p.title}</div>
                  <div className="text-[12px] text-ink-muted mt-1 flex items-center gap-2">
                    <span className="font-medium">{p.pages_count} pages</span>
                    <span className="w-1 h-1 rounded-full bg-line" />
                    <span>{formatDate(p.published_at!)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-ink">{p.downloads}</div>
                  <div className="text-[10px] uppercase font-black text-ink-faint tracking-widest">Views</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-line flex gap-3">
        <Button block size="large" icon={<Crown size={16} />} onClick={onTier} className="rounded-xl font-bold h-12">
          Override Tier
        </Button>
        <Button onClick={() => { onSuspend(); }} block danger size="large" icon={<Ban size={16} />} className="rounded-xl font-bold h-12">
          Suspend Entity
        </Button>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-surface-sunken/40 border border-line">
      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
        <Icon size={16} />
      </div>
      <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold">{label}</div>
      <div className="font-display font-black text-2xl text-ink tabular leading-none mt-1.5">{value}</div>
    </div>
  );
}

function InfoField({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="mt-0.5 text-primary/60 shrink-0">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold leading-none mb-1">{label}</div>
        <div className="text-[13.5px] font-semibold text-ink truncate">{value}</div>
      </div>
    </div>
  );
}

function tabLabel(label: string, count?: number) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      {typeof count === 'number' && (
        <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
          {count}
        </span>
      )}
    </span>
  );
}

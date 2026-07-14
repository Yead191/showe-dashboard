import { useMemo, useState } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import { Button, Spin } from 'antd';
import { PageHeader, Panel, EmptyState } from '@/components/ui';
import type { Venue } from '@/types/venue';
import {
  mapApiVenueToVenue,
  useGetOrganizationVenuesQuery,
} from '@/store/api/organizationApi/venueApi';
import { VenueCard } from '@/features/venues/VenueCard';
import { VenueFormModal } from '@/features/venues/VenueFormModal';

export default function VenuesPage() {
  const { data, isLoading, isError, isFetching } = useGetOrganizationVenuesQuery({
    page: 1,
    limit: 50,
  });
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);

  const venues = useMemo(
    () => (data?.venues ?? []).map(mapApiVenueToVenue),
    [data?.venues]
  );

  const filtered = useMemo(
    () => venues.filter((v) => v.name.toLowerCase().includes(search.toLowerCase())),
    [venues, search]
  );

  return (
    <>
      <PageHeader
        eyebrow="Estate"
        title="Your venues"
        description="Switch any venue active in the top bar to scope analytics, events and programmes to that venue."
        actions={
          <Button type="primary" icon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>
            Add venue
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your venues"
            className="input-base !h-10 pl-10"
          />
        </div>
        <span className="text-sm text-ink-muted ml-auto">
          {filtered.length} of {venues.length}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : isError ? (
        <Panel padded={false}>
          <EmptyState
            icon={Building2}
            title="Couldn’t load venues"
            description="Something went wrong fetching your venues. Please try again."
          />
        </Panel>
      ) : filtered.length === 0 ? (
        <Panel padded={false}>
          <EmptyState
            icon={Building2}
            title={venues.length === 0 ? 'No venues yet' : 'No venues match'}
            description={
              venues.length === 0
                ? 'Add your first venue to get started.'
                : 'Try a different search, or add a new venue.'
            }
          />
        </Panel>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger ${
            isFetching ? 'opacity-70' : ''
          }`}
        >
          {filtered.map((v) => (
            <VenueCard key={v.id} venue={v} onEdit={setEditing} />
          ))}
        </div>
      )}

      <VenueFormModal
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
      />

      <VenueFormModal
        open={editing !== null}
        mode="edit"
        venue={editing}
        onClose={() => setEditing(null)}
      />
    </>
  );
}

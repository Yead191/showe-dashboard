import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

const SEARCH_DEBOUNCE_MS = 300;

export default function VenuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') ?? '';

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);

  useEffect(() => {
    setSearchInput(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      setDebouncedSearch(trimmed);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) next.set('search', trimmed);
          else next.delete('search');
          return next;
        },
        { replace: true }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  const { data, isLoading, isError, isFetching } = useGetOrganizationVenuesQuery({
    page: 1,
    limit: 50,
    searchTerm: debouncedSearch || undefined,
  });

  const venues = useMemo(
    () => (data?.venues ?? []).map(mapApiVenueToVenue),
    [data?.venues]
  );
  const totalCount = data?.pagination?.total ?? venues.length;

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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search your venues"
            className="input-base !h-10 pl-10"
          />
        </div>
        <span className="text-sm text-ink-muted ml-auto">
          {venues.length} of {totalCount}
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
      ) : venues.length === 0 && !debouncedSearch ? (
        <Panel padded={false}>
          <EmptyState
            icon={Building2}
            title="No venues yet"
            description="Add your first venue to get started."
            action={
              <Button type="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
                Add venue
              </Button>
            }
          />
        </Panel>
      ) : venues.length === 0 ? (
        <Panel padded={false}>
          <EmptyState
            icon={Search}
            title="No venues match"
            description={`No venues match "${debouncedSearch}".`}
          />
        </Panel>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger ${
            isFetching ? 'opacity-70' : ''
          }`}
        >
          {venues.map((v) => (
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

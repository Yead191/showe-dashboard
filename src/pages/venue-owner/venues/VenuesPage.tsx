import { useMemo, useState } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import { Button } from 'antd';
import { PageHeader, Panel, EmptyState } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import type { Venue } from '@/types/venue';
import { VenueCard } from '@/features/venues/VenueCard';
import { VenueFormModal } from '@/features/venues/VenueFormModal';

export default function VenuesPage() {
  const venues = useAuthStore((s) => s.user?.venues) ?? [];
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);

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

      {filtered.length === 0 ? (
        <Panel padded={false}>
          <EmptyState
            icon={Building2}
            title="No venues match"
            description="Try a different search, or add a new venue."
          />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger">
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

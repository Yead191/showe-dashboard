import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Layers, Search } from 'lucide-react';
import { Button, Modal } from 'antd';
import { toast } from 'sonner';

import { PageHeader, Panel, EmptyState } from '@/components/ui';
import { useScopedVenueData } from '@/hooks/useScopedVenueData';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META } from '@/constants/tiers';
import { useProgrammesStore } from '@/features/programmes/store/programmes.store';

import { StatsGrid } from './components/StatsGrid';
import { FilterBar } from './components/FilterBar';
import { ProgrammeCard } from './components/ProgrammeCard';
import type { ProgrammeDoc, ProgrammeDocStatus } from '@/types/programme';

export default function ProgrammesPage() {
  const navigate = useNavigate();
  const { totals, venues, isAggregate, activeVenue } = useScopedVenueData();
  const tier = useAuthStore((s) => s.user?.tier);
  const meta = tier ? TIER_META[tier] : null;

  const userVenueIds = useMemo(() => venues.map((v) => v.id), [venues]);

  const allProgrammes = useProgrammesStore((s) => s.programmes);
  const createProgramme = useProgrammesStore((s) => s.createProgramme);
  const duplicateProgramme = useProgrammesStore((s) => s.duplicateProgramme);
  const deleteProgramme = useProgrammesStore((s) => s.deleteProgramme);
  const archiveProgramme = useProgrammesStore((s) => s.archiveProgramme);

  const [filter, setFilter] = useState<'all' | ProgrammeDocStatus>('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);

  const programmes = useMemo<ProgrammeDoc[]>(() => {
    return Object.values(allProgrammes)
      .filter((p) => userVenueIds.includes(p.venue_id))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [allProgrammes, userVenueIds]);

  const filtered = useMemo(() => {
    return programmes
      .filter((p) => filter === 'all' || p.status === filter)
      .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
  }, [programmes, filter, search]);

  const counts = useMemo(() => {
    return {
      all: programmes.length,
      draft: programmes.filter((p) => p.status === 'draft').length,
      published: programmes.filter((p) => p.status === 'published').length,
      archived: programmes.filter((p) => p.status === 'archived').length,
    };
  }, [programmes]);

  const handleCreate = () => {
    const title = createTitle.trim() || 'Untitled programme';
    const venueId = activeVenue?.id ?? userVenueIds[0];
    if (!venueId) {
      toast.error('Add a venue first.');
      return;
    }
    const id = createProgramme({ venue_id: venueId, title });
    setCreateOpen(false);
    setCreateTitle('');
    navigate(`/owner/programmes/${id}/edit`);
  };

  // Wrapped handlers in useCallback to protect child re-render cycles
  const handleDuplicate = useCallback((id: string) => {
    const newId = duplicateProgramme(id);
    if (newId) toast.success('Programme duplicated.');
  }, [duplicateProgramme]);

  const handleArchive = useCallback((id: string) => {
    archiveProgramme(id);
    toast.success('Programme archived.');
  }, [archiveProgramme]);

  const handleDeleteTrigger = useCallback((id: string) => {
    setDeleteOpen(id);
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Programmes"
        title="Programme workshop"
        description="Build, edit and publish digital programmes attached to your events."
        actions={
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
            New programme
          </Button>
        }
      />

      <StatsGrid
        totalCount={programmes.length}
        publishedCount={counts.published}
        downloads={totals.downloads}
        revenue={totals.revenue}
      />

      {meta && (
        <Panel className="mb-7" variant="flat">
          <div className="flex items-center gap-3 px-1">
            <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Layers size={15} />
            </span>
            <div className="flex-1">
              <div className="font-semibold text-ink text-[13.5px]">
                You’re on the <span className="text-primary">{meta.label}</span> plan
              </div>
              <div className="text-[12.5px] text-ink-muted">
                Unlocks <span className="font-semibold text-ink">{meta.modules.length} modules</span> in the
                programme builder. Higher tiers unlock more modules and animations.
              </div>
            </div>
            <Link to="/owner/subscription" className="hidden sm:inline-flex">
              <Button size="small">Upgrade</Button>
            </Link>
          </div>
        </Panel>
      )}

      <FilterBar
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
        counts={counts}
      />

      {filtered.length === 0 ? (
        <Panel>
          <EmptyState
            icon={programmes.length === 0 ? BookOpen : Search}
            title={programmes.length === 0 ? "No programmes yet" : "No programmes match"}
            description={programmes.length === 0 ? "Build your first interactive programme. Drag blocks, edit live, publish in minutes." : "Try a different filter or search term."}
            action={programmes.length === 0 ? (
              <Button type="primary" icon={<Plus size={13} />} onClick={() => setCreateOpen(true)}>
                Create your first programme
              </Button>
            ) : undefined}
          />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProgrammeCard
              key={p.id}
              programme={p}
              venueLabel={isAggregate ? venues.find((v) => v.id === p.venue_id)?.name : undefined}
              onDelete={handleDeleteTrigger}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <Modal
        open={createOpen}
        title="Create a programme"
        onCancel={() => {
          setCreateOpen(false);
          setCreateTitle('');
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleCreate}>
              Create &amp; open builder
            </Button>
          </div>
        }
        centered
      >
        <div>
          <label className="field-label">Programme title</label>
          <input
            className="input-base"
            autoFocus
            placeholder="e.g. Hamlet — Spring 2026"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
          <p className="text-[12px] text-ink-muted mt-3">
            You can edit the title, link an event, set pricing and more inside the builder.
            {activeVenue && (
              <> Venue: <span className="font-semibold text-ink">{activeVenue.name}</span>.</>
            )}
          </p>
        </div>
      </Modal>

      {/* Explicit Functional Deletion Modal */}
      <Modal
        open={!!deleteOpen}
        title="Delete this programme?"
        onCancel={() => setDeleteOpen(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDeleteOpen(null)}>Cancel</Button>
            <Button
              type="primary"
              danger
              onClick={() => {
                if (deleteOpen) {
                  deleteProgramme(deleteOpen);
                  setDeleteOpen(null);
                  toast.success('Programme deleted.');
                }
              }}
            >
              Delete
            </Button>
          </div>
        }
        centered
      >
        <p className="text-sm text-ink-muted">
          Are you sure you want to delete this programme? All blocks on this page will be removed permanently.
        </p>
      </Modal>
    </>
  );
}
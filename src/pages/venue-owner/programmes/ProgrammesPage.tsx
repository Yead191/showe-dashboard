import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Layers, Search } from 'lucide-react';
import { Button, Modal } from 'antd';
import { toast } from 'sonner';

import { PageHeader, Panel, EmptyState } from '@/components/ui';
import { useScopedVenueData } from '@/hooks/useScopedVenueData';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META } from '@/constants/tiers';
import {
  useGetProgrammesQuery,
  useCreateProgrammeMutation,
  useDuplicateProgrammeMutation,
  useDeleteProgrammeMutation,
  useUpdateProgrammeMutation,
} from '@/store/api/programmesApi';

import { StatsGrid } from './components/StatsGrid';
import { FilterBar } from './components/FilterBar';
import { ProgrammeCard } from './components/ProgrammeCard';
import type { ProgrammeDoc, ProgrammeDocStatus } from '@/types/programme';

export default function ProgrammesPage() {
  const navigate = useNavigate();
  const { totals, activeVenue } = useScopedVenueData();
  const tier = useAuthStore((s) => s.user?.tier);
  const meta = tier ? TIER_META[tier] : null;

  const { data: allProgrammes = [] } = useGetProgrammesQuery(undefined, { refetchOnMountOrArgChange: true });

  // const allProgrammes = useMemo(() => allProgrammesData || [], [allProgrammesData]);
  const [createProgramme] = useCreateProgrammeMutation();
  const [duplicateProgramme] = useDuplicateProgrammeMutation();
  const [deleteProgramme] = useDeleteProgrammeMutation();
  const [updateProgramme] = useUpdateProgrammeMutation();

  const [filter, setFilter] = useState<'all' | ProgrammeDocStatus>('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);

  const programmes = useMemo<ProgrammeDoc[]>(() => {
    return [...allProgrammes]
      .sort((a, b) => {
        const dateA = a.updated_at || a.created_at || '';
        const dateB = b.updated_at || b.created_at || '';
        return dateB.localeCompare(dateA);
      });
  }, [allProgrammes]);

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

  const handleCreate = async () => {
    const title = createTitle.trim() || 'Untitled programme';
    const pageId = `pg_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const initialProgramme: Partial<ProgrammeDoc> = {
      title,
      pages: [
        {
          id: pageId,
          title: 'Page 1',
          blocks: [],
        },
      ],
      status: 'draft',
      is_free: true,
      price_pence: 0,
      created_at: now,
      updated_at: now,
    };
    try {
      const res = await createProgramme(initialProgramme).unwrap();
      setCreateOpen(false);
      setCreateTitle('');
      if (res.success && res.data) {
        navigate(`/owner/programmes/${res.data.id}/edit`);
      } else {
        toast.error('Failed to create programme.');
      }
    } catch {
      toast.error('Failed to create programme.');
    }
  };

  // Wrapped handlers in useCallback to protect child re-render cycles
  const handleDuplicate = useCallback(async (id: string) => {
    try {
      await duplicateProgramme(id).unwrap();
      toast.success('Programme duplicated.');
    } catch {
      toast.error('Failed to duplicate programme.');
    }
  }, [duplicateProgramme]);

  const handleArchive = useCallback(async (id: string) => {
    try {
      await updateProgramme({ id, data: { status: 'archived' } }).unwrap();
      toast.success('Programme archived.');
    } catch {
      toast.error('Failed to archive programme.');
    }
  }, [updateProgramme]);

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
              venueLabel={undefined /* Will be resolved from backend imported relationship later */}
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
              onClick={async () => {
                if (deleteOpen) {
                  try {
                    await deleteProgramme(deleteOpen).unwrap();
                    setDeleteOpen(null);
                    toast.success('Programme deleted.');
                  } catch {
                    toast.error('Failed to delete programme.');
                  }
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
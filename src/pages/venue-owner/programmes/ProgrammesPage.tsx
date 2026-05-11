import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Eye,
  MousePointerClick,
  Clock,
  Plus,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Archive,
  Layers,
  Sparkles,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Button, Dropdown, Modal, Input } from 'antd';
import { toast } from 'sonner';
import { PageHeader, Panel, StatCard, StatusBadge, EmptyState } from '@/components/ui';
import { useScopedVenueData } from '@/hooks/useScopedVenueData';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META } from '@/constants/tiers';
import { useProgrammesStore } from '@/features/programmes/store/programmes.store';
import { formatGBP, formatNumber, timeAgo, cn } from '@/lib/utils';
import type { ProgrammeDoc, ProgrammeDocStatus } from '@/types/programme';

const FILTER_TABS: { v: 'all' | ProgrammeDocStatus; label: string }[] = [
  { v: 'all', label: 'All' },
  { v: 'draft', label: 'Drafts' },
  { v: 'published', label: 'Published' },
  { v: 'archived', label: 'Archived' },
];

export default function ProgrammesPage() {
  const navigate = useNavigate();
  const { totals, venues, isAggregate, activeVenue } = useScopedVenueData();
  const tier = useAuthStore((s) => s.user?.tier);
  const meta = tier ? TIER_META[tier] : null;
  const userVenueIds = venues.map((v) => v.id);

  // From the LocalStorage-persisted store
  const allProgrammes = useProgrammesStore((s) => s.programmes);
  const createProgramme = useProgrammesStore((s) => s.createProgramme);
  const duplicateProgramme = useProgrammesStore((s) => s.duplicateProgramme);
  const deleteProgramme = useProgrammesStore((s) => s.deleteProgramme);
  const archiveProgramme = useProgrammesStore((s) => s.archiveProgramme);

  const programmes = useMemo<ProgrammeDoc[]>(() => {
    return Object.values(allProgrammes)
      .filter((p) => userVenueIds.includes(p.venue_id))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [allProgrammes, userVenueIds]);

  const [filter, setFilter] = useState<'all' | ProgrammeDocStatus>('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');

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

  function handleCreate() {
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
  }

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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger mb-7">
        <StatCard label="Programmes" value={String(programmes.length)} icon={BookOpen} accent="primary" />
        <StatCard label="Published" value={String(counts.published)} icon={Sparkles} accent="success" />
        <StatCard
          label="Lifetime downloads"
          value={formatNumber(totals.downloads)}
          icon={Eye}
          accent="info"
        />
        <StatCard
          label="Revenue"
          value={formatGBP(totals.revenue, { compact: true })}
          icon={MousePointerClick}
          accent="amber"
        />
      </div>

      {/* Tier reminder */}
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

      {/* Filter + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface-sunken border border-line">
          {FILTER_TABS.map((t) => (
            <button
              key={t.v}
              onClick={() => setFilter(t.v)}
              className={cn(
                'h-8 px-3.5 rounded-full text-[12.5px] font-semibold transition-all whitespace-nowrap',
                filter === t.v ? 'bg-primary text-ink-inverse shadow-soft' : 'text-ink-muted hover:text-ink'
              )}
            >
              {t.label}
              <span
                className={cn(
                  'ml-1.5 text-[10.5px] tabular',
                  filter === t.v ? 'text-accent-300' : 'text-ink-faint'
                )}
              >
                {counts[t.v]}
              </span>
            </button>
          ))}
        </div>
        <Input
          allowClear
          prefix={<Search size={13} className="text-ink-faint" />}
          placeholder="Search programmes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 260 }}
        />
      </div>

      {/* Programme grid / empty state */}
      {filtered.length === 0 ? (
        programmes.length === 0 ? (
          <Panel>
            <EmptyState
              icon={BookOpen}
              title="No programmes yet"
              description="Build your first interactive programme. Drag blocks, edit live, publish in minutes."
              action={
                <Button type="primary" icon={<Plus size={13} />} onClick={() => setCreateOpen(true)}>
                  Create your first programme
                </Button>
              }
            />
          </Panel>
        ) : (
          <Panel>
            <EmptyState
              icon={Search}
              title="No programmes match"
              description={`Try a different filter or search term.`}
            />
          </Panel>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProgrammeCard
              key={p.id}
              programme={p}
              venueLabel={
                isAggregate ? venues.find((v) => v.id === p.venue_id)?.name ?? '' : undefined
              }
              onDelete={() => {
                Modal.confirm({
                  title: 'Delete programme?',
                  content: `“${p.title}” will be removed permanently.`,
                  okText: 'Delete',
                  okButtonProps: { danger: true },
                  onOk: () => {
                    deleteProgramme(p.id);
                    toast.success('Programme deleted.');
                  },
                });
              }}
              onDuplicate={() => {
                const newId = duplicateProgramme(p.id);
                if (newId) toast.success('Programme duplicated.');
              }}
              onArchive={() => {
                archiveProgramme(p.id);
                toast.success('Programme archived.');
              }}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
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
              <>
                {' '}
                Venue:{' '}
                <span className="font-semibold text-ink">{activeVenue.name}</span>.
              </>
            )}
          </p>
        </div>
      </Modal>
    </>
  );
}

/* ========================================================== */

function ProgrammeCard({
  programme,
  venueLabel,
  onDelete,
  onDuplicate,
  onArchive,
}: {
  programme: ProgrammeDoc;
  venueLabel?: string;
  onDelete: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
}) {
  const totalBlocks = programme.pages.reduce((s, pg) => s + pg.blocks.length, 0);
  const cover = programme.cover_image ?? findCoverImage(programme);
  return (
    <Panel className="!p-0 overflow-hidden group">
      <Link to={`/owner/programmes/${programme.id}/edit`} className="block">
        <div className="relative aspect-[16/9] bg-surface-sunken overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-faint">
              <BookOpen size={28} />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <StatusBadge status={programme.status} />
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/owner/programmes/${programme.id}/edit`} className="min-w-0 flex-1 group/link">
            <div className="font-display font-bold text-[15px] text-ink leading-tight truncate group-hover/link:text-primary transition-colors">
              {programme.title}
            </div>
            <div className="text-[11.5px] text-ink-faint mt-1">
              {programme.pages.length} page{programme.pages.length !== 1 ? 's' : ''} · {totalBlocks} block{totalBlocks !== 1 ? 's' : ''}
              {venueLabel && (
                <>
                  {' · '}
                  <span className="text-ink-muted font-medium">{venueLabel}</span>
                </>
              )}
            </div>
          </Link>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'edit',
                  icon: <Pencil size={12} />,
                  label: <Link to={`/owner/programmes/${programme.id}/edit`}>Edit</Link>,
                },
                {
                  key: 'reader',
                  icon: <ExternalLink size={12} />,
                  label: 'Open reader',
                  onClick: () => window.open(`/reader/${programme.id}`, '_blank'),
                },
                {
                  key: 'duplicate',
                  icon: <Copy size={12} />,
                  label: 'Duplicate',
                  onClick: onDuplicate,
                },
                { type: 'divider' },
                {
                  key: 'archive',
                  icon: <Archive size={12} />,
                  label: programme.status === 'archived' ? 'Already archived' : 'Archive',
                  disabled: programme.status === 'archived',
                  onClick: onArchive,
                },
                {
                  key: 'delete',
                  icon: <Trash2 size={12} />,
                  label: 'Delete',
                  danger: true,
                  onClick: onDelete,
                },
              ],
            }}
          >
            <button className="w-7 h-7 rounded-md text-ink-faint hover:text-ink hover:bg-surface-sunken flex items-center justify-center shrink-0">
              <MoreHorizontal size={14} />
            </button>
          </Dropdown>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-[11.5px] text-ink-faint">
          <span className="inline-flex items-center gap-1">
            <Clock size={11} /> Updated {timeAgo(programme.updated_at)}
          </span>
          <Link
            to={`/owner/programmes/${programme.id}/edit`}
            className="font-semibold text-primary hover:text-primary-700 transition-colors"
          >
            Edit →
          </Link>
        </div>
      </div>
    </Panel>
  );
}

function findCoverImage(p: ProgrammeDoc): string | undefined {
  // Use the hero cover from the first page, if any
  for (const page of p.pages) {
    for (const block of page.blocks) {
      if (block.type === 'hero' && block.cover_image) return block.cover_image;
      if (block.type === 'image_story' && block.image) return block.image;
      if (block.type === 'cast_spotlight' && block.image) return block.image;
    }
  }
  return undefined;
}

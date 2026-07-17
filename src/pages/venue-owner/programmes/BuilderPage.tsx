import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button, Modal } from 'antd';
import { ArrowLeft, Eye, Save, CheckCircle2, MoreHorizontal, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProgrammesStore } from '@/features/programmes/store/programmes.store';
import {
  useGetProgrammeQuery,
  useUpdateProgrammeMutation,
  useDeleteProgrammeMutation,
} from '@/store/api/programmesApi';
import { ModulesLibrary } from '@/features/programmes/builder/ModulesLibrary';
import { LivePreview } from '@/features/programmes/builder/LivePreview';
import { LiveInspector } from '@/features/programmes/builder/LiveInspector';
import { BuilderDndContext } from '@/features/programmes/builder/BuilderDndContext';
import { StatusBadge } from '@/components/ui';
import { Dropdown } from 'antd';
import { timeAgo } from '@/lib/utils';
import { AdditionalSettingsModal } from './AdditionalSettingsModal';
import { Settings } from 'lucide-react';

export default function ProgrammeBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: serverProgramme, isLoading, } = useGetProgrammeQuery(id || '', { skip: !id, refetchOnMountOrArgChange: true });
  const [updateProgramme, { isLoading: isSaving }] = useUpdateProgrammeMutation();
  const [deleteProgramme] = useDeleteProgrammeMutation();

  const programme = useProgrammesStore((s) => (id ? s.programmes[id] : null));
  const setActiveId = useProgrammesStore((s) => s.setActiveId);
  const setSelectedBlockId = useProgrammesStore((s) => s.setSelectedBlockId);
  const updateMeta = useProgrammesStore((s) => s.updateProgrammeMeta);
  const publish = useProgrammesStore((s) => s.publishProgramme);
  const loadProgramme = useProgrammesStore((s) => s.loadProgramme);

  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [titleEditing, setTitleEditing] = useState(false);
  const [savedAt, setSavedAt] = useState<number>(Date.now());
  const [hasLoadedServerData, setHasLoadedServerData] = useState(false);
  const [isLocalDirty, setIsLocalDirty] = useState(false);

  // Reset load state when ID changes
  useEffect(() => {
    setHasLoadedServerData(false);
    setIsLocalDirty(false);
  }, [id]);

  useEffect(() => {
    if (id) {
      setActiveId(id);
    }
    return () => {
      setSelectedBlockId(null);
      setActiveId(null);
      if (id) {
        // Clear local Zustand cache so the next mount starts fresh from the server
        useProgrammesStore.getState().deleteProgramme(id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Initialize store with server data
  useEffect(() => {
    if (id && serverProgramme && !hasLoadedServerData) {
      loadProgramme(serverProgramme);
      setHasLoadedServerData(true);
      setIsLocalDirty(false);
    }
  }, [id, serverProgramme, loadProgramme, hasLoadedServerData]);

  // Track if local state has changed
  useEffect(() => {
    if (programme && hasLoadedServerData) {
      setIsLocalDirty(true);
    }
  }, [programme, hasLoadedServerData]);

  // Debounced autosave
  useEffect(() => {
    if (!programme || !isLocalDirty) return;

    const timer = setTimeout(async () => {
      try {
        const { status, ...rest } = programme;
        await updateProgramme({ id: programme.id, data: { ...rest, status: "draft" } }).unwrap();
        setIsLocalDirty(false);
        setSavedAt(Date.now());
      } catch {
        // failed, will retry on next change
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [programme, isLocalDirty, updateProgramme]);

  if (isLoading && !programme) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-base p-6">
        <h1 className="font-display font-bold text-2xl text-ink">Loading programme...</h1>
      </div>
    );
  }

  if (!id || !programme) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-base p-6">
        <h1 className="font-display font-bold text-2xl text-ink">Programme not found</h1>
        <p className="text-ink-muted mt-2">This programme may have been deleted.</p>
        <Link to="/owner/programmes" className="mt-4">
          <Button type="primary">Back to programmes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-surface-base overflow-hidden">
      {/* Top bar */}
      <header className="h-14 px-5 flex items-center gap-4 border-b border-line bg-surface-raised shrink-0">
        <button
          onClick={() => navigate('/owner/programmes')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Programmes</span>
        </button>

        <div className="h-5 w-px bg-line" />

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img src="/favicon.ico" alt="favicon" className='h-full w-fit object-contain' />
          {titleEditing ? (
            <input
              autoFocus
              defaultValue={programme.title}
              onBlur={(e) => {
                if (e.target.value.trim()) updateMeta(programme.id, { title: e.target.value.trim() });
                setTitleEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.currentTarget.value.trim())
                    updateMeta(programme.id, { title: e.currentTarget.value.trim() });
                  setTitleEditing(false);
                }
                if (e.key === 'Escape') setTitleEditing(false);
              }}
              className="font-display font-bold text-base text-ink bg-transparent border-b border-primary outline-none"
            />
          ) : (
            <button
              onClick={() => setTitleEditing(true)}
              className="font-display font-bold text-base text-ink truncate max-w-[40vw] hover:text-primary transition-colors"
              title="Click to rename"
            >
              {programme.title}
            </button>
          )}
          <StatusBadge status={programme.status} />
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-[11.5px] text-ink-faint">
          {isSaving ? (
            <span className="animate-pulse text-primary font-semibold">Saving changes...</span>
          ) : (
            <>
              <CheckCircle2 size={12} className="text-success" />
              Saved {timeAgo(new Date(savedAt).toISOString())}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/reader/${programme.id}`} target="_blank">
            <Button icon={<Eye size={13} />}>Preview as audience</Button>
          </Link>
          <Button
            type="primary"
            icon={<Save size={13} />}
            loading={isSaving}
            onClick={async () => {
              publish(programme.id);
              try {
                await updateProgramme({
                  id: programme.id,
                  data: { ...programme, status: 'published' },
                }).unwrap();
                setIsLocalDirty(false);
                setSavedAt(Date.now());
                toast.success('Programme published. Audiences can now read it.');
              } catch {
                toast.error('Failed to publish programme.');
              }
            }}
          >
            Save & publish
          </Button>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'reader',
                  label: 'Open reader page',
                  icon: <BookOpen size={13} />,
                  onClick: () => window.open(`/reader/${programme.id}`, '_blank'),
                },
                {
                  key: 'settings',
                  label: 'Additional Settings',
                  icon: <Settings size={13} />,
                  onClick: () => setSettingsOpen(true),
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: 'Delete programme',
                  icon: <Trash2 size={13} />,
                  danger: true,
                  onClick: () => {
                    setDeleteOpen(programme.id)
                  },
                },
              ],
            }}
          >
            <Button icon={<MoreHorizontal size={14} />} />
          </Dropdown>
        </div>
      </header>

      {/* 3 columns — wrapped in a single DnD context so palette → preview drags work */}
      <BuilderDndContext>
        <div className="flex-1 grid grid-cols-[280px_1fr_360px] min-h-0">
          <div className="min-h-0 overflow-hidden">
            <ModulesLibrary />
          </div>
          <div className="min-h-0 overflow-hidden">
            <LivePreview />
          </div>
          <div className="min-h-0 overflow-hidden">
            <LiveInspector />
          </div>
        </div>
      </BuilderDndContext>
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
                    await deleteProgramme(programme.id).unwrap();
                    navigate('/owner/programmes');
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
          Are you sure you want to delete “{programme.title}”? This action cannot be undone.
        </p>
      </Modal>

      <AdditionalSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        programme={programme}
        onSave={(updates) => updateMeta(programme.id, updates)}
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button, Modal } from 'antd';
import { ArrowLeft, Eye, Save, CheckCircle2, MoreHorizontal, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProgrammesStore } from '@/features/programmes/store/programmes.store';
import { ModulesLibrary } from '@/features/programmes/builder/ModulesLibrary';
import { LivePreview } from '@/features/programmes/builder/LivePreview';
import { LiveInspector } from '@/features/programmes/builder/LiveInspector';
import { BuilderDndContext } from '@/features/programmes/builder/BuilderDndContext';
import { StatusBadge } from '@/components/ui';
import { Dropdown } from 'antd';
import { timeAgo } from '@/lib/utils';

export default function ProgrammeBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const programme = useProgrammesStore((s) => (id ? s.programmes[id] : null));
  const setActiveId = useProgrammesStore((s) => s.setActiveId);
  const setSelectedBlockId = useProgrammesStore((s) => s.setSelectedBlockId);
  const updateMeta = useProgrammesStore((s) => s.updateProgrammeMeta);
  const publish = useProgrammesStore((s) => s.publishProgramme);
  const remove = useProgrammesStore((s) => s.deleteProgramme);

  const [titleEditing, setTitleEditing] = useState(false);
  const [savedAt, setSavedAt] = useState<number>(Date.now());

  useEffect(() => {
    if (id) {
      setActiveId(id);
    }
    return () => {
      // Keep store state intact across navigation
      setSelectedBlockId(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Mark as "saved" whenever programme updated (LocalStorage persist runs automatically)
  useEffect(() => {
    if (programme) setSavedAt(Date.now());
  }, [programme]);

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
          <CheckCircle2 size={12} className="text-success" />
          Saved {timeAgo(new Date(savedAt).toISOString())}
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/reader/${programme.id}`} target="_blank">
            <Button icon={<Eye size={13} />}>Preview as audience</Button>
          </Link>
          <Button
            type="primary"
            icon={<Save size={13} />}
            onClick={() => {
              publish(programme.id);
              toast.success('Programme published. Audiences can now read it.');
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
                { type: 'divider' },
                {
                  key: 'delete',
                  label: 'Delete programme',
                  icon: <Trash2 size={13} />,
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: 'Delete this programme?',
                      content: `“${programme.title}” will be removed permanently.`,
                      okText: 'Delete',
                      okButtonProps: { danger: true },
                      onOk: () => {
                        remove(programme.id);
                        navigate('/owner/programmes');
                      },
                    });
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
    </div>
  );
}

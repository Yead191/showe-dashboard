import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, Lock } from 'lucide-react';
import { MODULE_CATALOGUE, isModuleUnlocked, type BlockTemplate, type ModuleMeta } from '@/constants/module-blocks';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

export function ModulesLibrary() {
  const tier = useAuthStore((s) => s.user?.tier);
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    foundation: true,
    people_credits: true,
  });

  function toggle(id: string) {
    setOpenIds((s) => ({ ...s, [id]: !s[id] }));
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-surface-raised border-r border-line">
      <div className="px-5 py-5 border-b border-line">
        <div className="eyebrow text-[10px] mb-1.5">Module library</div>
        <h2 className="font-display font-bold text-base text-ink leading-tight">
          Drag a block into the page
        </h2>
        <p className="text-[12px] text-ink-muted mt-1">
          Tier-locked modules are greyed out. Upgrade to unlock more blocks.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {MODULE_CATALOGUE.map((m) => {
          const unlocked = isModuleUnlocked(m.number, tier);
          return (
            <ModuleSection
              key={m.id}
              module={m}
              open={!!openIds[m.id] && unlocked}
              onToggle={() => toggle(m.id)}
              unlocked={unlocked}
            />
          );
        })}
      </div>
    </div>
  );
}

function ModuleSection({
  module,
  open,
  onToggle,
  unlocked,
}: {
  module: ModuleMeta;
  open: boolean;
  onToggle: () => void;
  unlocked: boolean;
}) {
  return (
    <div className={cn('rounded-xl border', unlocked ? 'border-line bg-surface-raised' : 'border-line/60 bg-surface-sunken/40')}>
      <button
        type="button"
        onClick={unlocked ? onToggle : undefined}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 transition-colors',
          unlocked && 'hover:bg-surface-sunken cursor-pointer rounded-xl',
          !unlocked && 'cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-display font-extrabold tabular shrink-0',
            unlocked ? 'bg-primary text-ink-inverse' : 'bg-surface-offset text-ink-faint'
          )}
        >
          {module.number}
        </span>
        <div className="flex-1 min-w-0 text-left">
          <div className={cn('font-semibold text-[13px] leading-tight', unlocked ? 'text-ink' : 'text-ink-faint')}>
            {module.label}
          </div>
          <div className="text-[11px] text-ink-faint truncate mt-0.5">
            {module.blocks.length} block{module.blocks.length !== 1 ? 's' : ''}
          </div>
        </div>
        {unlocked ? (
          <ChevronDown
            size={14}
            className={cn('text-ink-faint transition-transform shrink-0', open && 'rotate-180')}
          />
        ) : (
          <Lock size={12} className="text-ink-faint shrink-0" />
        )}
      </button>

      {open && unlocked && (
        <ul className="px-2 pb-2 space-y-1.5">
          {module.blocks.map((b) => (
            <li key={b.type}>
              <DraggableBlockCard block={b} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DraggableBlockCard({ block }: { block: BlockTemplate }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${block.type}`,
    data: { kind: 'palette', blockType: block.type },
  });
  const Icon = block.icon;
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'group flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-line bg-surface-base/50 cursor-grab active:cursor-grabbing transition-all',
        'hover:border-primary/30 hover:bg-primary/5 hover:shadow-soft',
        isDragging && 'opacity-50'
      )}
      style={{ touchAction: 'none' }}
    >
      <span className="w-7 h-7 rounded-lg bg-surface-sunken text-ink-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <Icon size={13} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[12.5px] text-ink leading-tight">{block.label}</div>
        <div className="text-[11px] text-ink-faint mt-0.5 leading-snug">{block.description}</div>
      </div>
    </div>
  );
}

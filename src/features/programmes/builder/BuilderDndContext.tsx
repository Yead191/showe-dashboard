import { useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useProgrammesStore } from '@/features/programmes/store/programmes.store';
import { findBlockTemplate } from '@/constants/module-blocks';
import type { BlockType } from '@/types/programme';

/**
 * Wraps the entire builder (all three columns) so that drags from the
 * left-column ModulesLibrary can be dropped into the middle-column LivePreview.
 *
 * Without this lifted context, palette draggables and preview droppables would
 * live in separate DnD contexts and never connect.
 */
export function BuilderDndContext({ children }: { children: ReactNode }) {
  const programme = useProgrammesStore((s) =>
    s.activeId ? s.programmes[s.activeId] : null
  );
  const activePageId = useProgrammesStore((s) => s.activePageId);
  const addBlock = useProgrammesStore((s) => s.addBlock);
  const reorderBlocks = useProgrammesStore((s) => s.reorderBlocks);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragKind, setActiveDragKind] = useState<'palette' | 'block' | null>(null);
  const [activeDragLabel, setActiveDragLabel] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveDragId(String(e.active.id));
    const kind = (e.active.data.current?.kind as 'palette' | 'block') ?? null;
    setActiveDragKind(kind);
    if (kind === 'palette') {
      const blockType = e.active.data.current?.blockType as BlockType | undefined;
      const tpl = blockType ? findBlockTemplate(blockType) : null;
      setActiveDragLabel(tpl?.label ?? 'Block');
    } else {
      setActiveDragLabel('Reordering…');
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveDragId(null);
    const kind = e.active.data.current?.kind;
    setActiveDragKind(null);
    setActiveDragLabel('');

    if (!e.over || !programme) return;
    const page =
      programme.pages.find((p) => p.id === activePageId) ?? programme.pages[0];
    if (!page) return;

    if (kind === 'palette') {
      const blockType = e.active.data.current?.blockType as BlockType | undefined;
      if (!blockType) return;

      // Drop position within page
      let insertIndex = page.blocks.length;
      if (e.over.id !== 'page-dropzone') {
        const overId = String(e.over.id);
        const idx = page.blocks.findIndex((b) => b.id === overId);
        if (idx >= 0) insertIndex = idx;
      }
      addBlock(programme.id, page.id, blockType, insertIndex);
    } else if (kind === 'block') {
      const fromIndex = page.blocks.findIndex((b) => b.id === e.active.id);
      const toIndex = page.blocks.findIndex((b) => b.id === e.over!.id);
      if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
        reorderBlocks(programme.id, page.id, fromIndex, toIndex);
      }
    }
  }

  function handleDragCancel() {
    setActiveDragId(null);
    setActiveDragKind(null);
    setActiveDragLabel('');
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}

      <DragOverlay dropAnimation={null}>
        {activeDragId && activeDragKind === 'palette' && (
          <div className="rounded-lg border-2 border-primary bg-surface-raised px-3 py-2 text-[12.5px] font-semibold text-primary shadow-large pointer-events-none">
            {activeDragLabel} →
          </div>
        )}
        {activeDragId && activeDragKind === 'block' && (
          <div className="rounded-lg bg-surface-raised border-2 border-primary px-3 py-2 text-[12.5px] font-semibold text-primary shadow-large pointer-events-none">
            Moving block…
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Trash2,
  Copy,
  Pencil,
} from 'lucide-react';
import { Button, Dropdown, Modal } from 'antd';
import { useProgrammesStore } from '@/features/programmes/store/programmes.store';
import { renderBlockPreview } from './BlockPreviews';
import { findBlockTemplate } from '@/constants/module-blocks';
import { cn } from '@/lib/utils';
import { useReveal } from '@/features/programmes/animation';
import type { Block, ProgrammeDoc, ProgrammePage } from '@/types/programme';

export function LivePreview() {
  const programme = useProgrammesStore((s) =>
    s.activeId ? s.programmes[s.activeId] : null
  );
  const activePageId = useProgrammesStore((s) => s.activePageId);
  const setActivePageId = useProgrammesStore((s) => s.setActivePageId);
  const setSelectedBlockId = useProgrammesStore((s) => s.setSelectedBlockId);
  const selectedBlockId = useProgrammesStore((s) => s.selectedBlockId);
  const addPage = useProgrammesStore((s) => s.addPage);
  const removePage = useProgrammesStore((s) => s.removePage);
  const renamePage = useProgrammesStore((s) => s.renamePage);
  const duplicatePage = useProgrammesStore((s) => s.duplicatePage);
  const removeBlock = useProgrammesStore((s) => s.removeBlock);
  const duplicateBlock = useProgrammesStore((s) => s.duplicateBlock);

  const [renameOpen, setRenameOpen] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    if (!programme) return;
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [programme?.pages.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Scroll active tab into view
  useEffect(() => {
    const activeTab = scrollRef.current?.querySelector('[data-active="true"]');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activePageId]);

  if (!programme) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-muted">
        No programme selected.
      </div>
    );
  }

  const page = programme.pages.find((p) => p.id === activePageId) ?? programme.pages[0]!;
  const pageIndex = programme.pages.findIndex((p) => p.id === page.id);

  const goPrev = () => {
    if (pageIndex > 0) setActivePageId(programme.pages[pageIndex - 1]!.id);
  };
  const goNext = () => {
    if (pageIndex < programme.pages.length - 1) setActivePageId(programme.pages[pageIndex + 1]!.id);
  };

  return (
    <>
      <div className="h-full min-h-0 flex flex-col">
        {/* Page tabs */}
        <div className="px-6 pt-5 pb-3 border-b border-line bg-surface-base sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0 relative group/tabs">
              {showLeftArrow && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-surface-base/90 backdrop-blur-sm border border-line rounded-full shadow-sm text-ink-muted hover:text-ink hover:border-line-strong transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
              )}

              <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex items-center gap-2 overflow-x-auto scrollbar-none scroll-smooth py-1"
              >
                {programme.pages.map((p, i) => {
                  const isActive = p.id === page.id;
                  return (
                    <Dropdown
                      key={p.id}
                      trigger={['contextMenu']}
                      menu={{
                        items: [
                          { key: 'rename', icon: <Pencil size={12} />, label: 'Rename' },
                          { key: 'duplicate', icon: <Copy size={12} />, label: 'Duplicate' },
                          { type: 'divider' },
                          {
                            key: 'delete',
                            icon: <Trash2 size={12} />,
                            label: 'Delete',
                            danger: true,
                            disabled: programme.pages.length <= 1,
                          },
                        ],
                        onClick: ({ key, domEvent }) => {
                          domEvent.stopPropagation();
                          if (key === 'rename') {
                            setRenameOpen(p.id);
                            setRenameVal(p.title);
                          } else if (key === 'duplicate') {
                            duplicatePage(programme.id, p.id);
                          } else if (key === 'delete') {
                            setDeleteOpen(p.id);
                          }
                        },
                      }}
                    >
                      <button
                        onClick={() => setActivePageId(p.id)}
                        data-active={isActive}
                        className={cn(
                          'group inline-flex items-center gap-2 h-9 px-3 rounded-full text-[12.5px] font-semibold whitespace-nowrap transition-all',
                          isActive
                            ? 'bg-primary text-ink-inverse shadow-soft'
                            : 'bg-surface-raised text-ink-muted border border-line hover:border-line-strong'
                        )}
                      >
                        <span
                          className={cn(
                            'text-[10px] font-bold',
                            isActive ? 'text-accent-300' : 'text-ink-faint'
                          )}
                        >
                          P{i + 1}
                        </span>
                        {p.title}
                      </button>
                    </Dropdown>
                  );
                })}
              </div>

              {showRightArrow && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-surface-base/90 backdrop-blur-sm border border-line rounded-full shadow-sm text-ink-muted hover:text-ink hover:border-line-strong transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0 border-l border-line pl-4">
              <button
                onClick={() => addPage(programme.id)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-surface-raised border border-dashed border-line text-[12.5px] font-semibold text-ink-muted hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
              >
                <Plus size={12} /> Add page
              </button>

              <div className="flex items-center gap-1">
                <Button
                  size="small"
                  icon={<ChevronLeft size={14} />}
                  disabled={pageIndex === 0}
                  onClick={goPrev}
                />
                <span className="text-[12px] text-ink-muted tabular px-1">
                  {pageIndex + 1} / {programme.pages.length}
                </span>
                <Button
                  size="small"
                  icon={<ChevronRight size={14} />}
                  disabled={pageIndex === programme.pages.length - 1}
                  onClick={goNext}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile preview frame */}
        <div className="flex-1 overflow-y-auto bg-surface-base">
          <div className="mx-auto py-8 px-6" style={{ maxWidth: 460 }}>
            <div className="text-center mb-5">
              <div className="eyebrow text-[10px] mb-1">Live Preview</div>
              <p className="text-[12px] text-ink-muted">
                Drag blocks from the left. Click a block to edit it.
              </p>
            </div>

            {/* Phone mock */}
            <div
              className="relative mx-auto bg-ink rounded-[40px] p-2.5 shadow-large"
              style={{ width: 360 }}
            >
              <div
                className="rounded-[32px] overflow-hidden bg-surface-raised relative"
                style={{ minHeight: 640 }}
              >
                {/* Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-ink rounded-full z-10" />
                {/* Page content */}
                <SortableContext
                  items={page?.blocks?.map((b) => b.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <PageDropzone hasBlocks={(page?.blocks?.length || 0) > 0}>
                    {(page?.blocks || []).map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        programme={programme}
                        page={page}
                        isSelected={selectedBlockId === block.id}
                        onSelect={() => setSelectedBlockId(block.id)}
                        onDelete={() => removeBlock(programme.id, page.id, block.id)}
                        onDuplicate={() => duplicateBlock(programme.id, page.id, block.id)}
                      />
                    ))}
                  </PageDropzone>
                </SortableContext>
              </div>
            </div>

            <div className="text-center mt-5 text-[11.5px] text-ink-faint">
              {(page?.blocks?.length || 0)} block{(page?.blocks?.length || 0) !== 1 ? 's' : ''} on this page
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={!!renameOpen}
        title="Rename page"
        onCancel={() => setRenameOpen(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setRenameOpen(null)}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => {
                if (renameOpen && renameVal.trim()) {
                  renamePage(programme.id, renameOpen, renameVal.trim());
                  setRenameOpen(null);
                }
              }}
            >
              Save
            </Button>
          </div>
        }
      >
        <div>
          <label className="field-label">Page title</label>
          <input
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            className="input-base"
            autoFocus
          />
        </div>
      </Modal>

      <Modal
        open={!!deleteOpen}
        title="Delete this page?"
        onCancel={() => setDeleteOpen(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDeleteOpen(null)}>Cancel</Button>
            <Button
              type="primary"
              danger
              onClick={() => {
                if (deleteOpen) {
                  removePage(programme.id, deleteOpen);
                  setDeleteOpen(null);
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
          Are you sure you want to delete “{programme.pages.find((p) => p.id === deleteOpen)?.title}”? All blocks on this page will be removed permanently.
        </p>
      </Modal>
    </>
  );
}

/* Drop zone for the entire page */
function PageDropzone({ children, hasBlocks }: { children: React.ReactNode; hasBlocks: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'page-dropzone' });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[600px] pt-8 pb-12 transition-colors',
        !hasBlocks && 'flex items-center justify-center',
        isOver && 'bg-primary/5 ring-2 ring-inset ring-primary/30'
      )}
    >
      {hasBlocks ? (
        <div>{children}</div>
      ) : (
        <div className="px-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <Plus size={22} />
          </div>
          <div className="font-display font-bold text-ink">Empty page</div>
          <p className="text-[12.5px] text-ink-muted mt-1">
            Drag a block from the left to start building this page.
          </p>
        </div>
      )}
    </div>
  );
}

/* Sortable block wrapper */
function SortableBlock({
  block,
  programme,
  page,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  block: Block;
  programme: ProgrammeDoc;
  page: ProgrammePage;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { kind: 'block' },
  });
  const reveal = useReveal(block.animation);
  const tpl = findBlockTemplate(block.type);

  const resolvedBg =
    block.layout.background === 'custom'
      ? (block.layout.background_custom || 'transparent')
      : block.layout.background === 'sunken'
        ? '#F2EFE9'
        : block.layout.background === 'surface'
          ? '#FBFAF7'
          : block.layout.background === 'primary'
            ? '#014B52'
            : block.layout.background === 'accent'
              ? '#F5A800'
              : block.layout.background === 'dark'
                ? '#000000'
                : 'transparent';

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    paddingTop: block.layout.padding_top,
    paddingBottom: block.layout.padding_bottom,
    paddingLeft: block.layout.padding_x,
    paddingRight: block.layout.padding_x,
    background: resolvedBg,
    ...(block.layout.text_color
      ? { '--btext': block.layout.text_color }
      : {}),
    ...(block.layout.text_color
      ? { '--bborder': block.layout.text_color }
      : {}),
    ...(block.layout.title_color
      ? { '--btitle': block.layout.title_color }
      : {}),
    ...(block.layout.eyebrow_color
      ? { '--beyebrow': block.layout.eyebrow_color }
      : {}),
    ...(block.layout.card_background
      ? { '--bcardbg': block.layout.card_background }
      : {}),
    ...(block.layout.card_text_color
      ? { '--bcardtext': block.layout.card_text_color }
      : {}),
    opacity: isDragging ? 0.4 : 1,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={cn(
        'relative group cursor-pointer transition-shadow',
        isSelected && 'ring-2 ring-accent ring-inset',
        block.layout.text_color && 'block-textcolor',
        block.layout.title_color && 'block-titlecolor',
        block.layout.eyebrow_color && 'block-eyebrowcolor',
        block.layout.card_background && 'block-cardbg',
        block.layout.card_text_color && 'block-cardtext'
      )}
    >
      {/* Hover/selected toolbar */}
      <div
        className={cn(
          'absolute top-1 right-1 flex items-center gap-0.5 z-20 transition-opacity',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}
      >
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="w-6 h-6 rounded-md bg-surface-raised border border-line text-ink-muted hover:text-ink flex items-center justify-center shadow-soft cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
          style={{ touchAction: 'none' }}
        >
          <GripVertical size={11} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="w-6 h-6 rounded-md bg-surface-raised border border-line text-ink-muted hover:text-ink flex items-center justify-center shadow-soft"
          title="Duplicate"
        >
          <Copy size={11} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-6 h-6 rounded-md bg-surface-raised border border-line !text-ink-muted hover:!text-danger flex items-center justify-center shadow-soft"
          title="Delete"
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Selected label */}
      {isSelected && (
        <div className="absolute top-1 left-1 z-20">
          <span className="inline-flex items-center px-1.5 h-5 rounded-md bg-accent text-ink text-[10px] font-bold uppercase tracking-wider">
            {tpl?.label ?? block.type}
          </span>
        </div>
      )}

      <div ref={reveal.ref} style={reveal.style}>
        {renderBlockPreview(block, { programme, page })}
      </div>
    </div>
  );
}

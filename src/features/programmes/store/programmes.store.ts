import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Block, ProgrammeDoc, ProgrammePage, ProgrammeDocStatus } from '@/types/programme';
import { findBlockTemplate } from '@/constants/module-blocks';

const newId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

interface ProgrammesState {
  programmes: Record<string, ProgrammeDoc>;
  // active editing context
  activeId: string | null;
  selectedBlockId: string | null;
  activePageId: string | null;

  // CRUD
  createProgramme: (input: { venue_id: string; event_id?: string | null; title: string }) => string;
  duplicateProgramme: (id: string) => string | null;
  deleteProgramme: (id: string) => void;
  updateProgrammeMeta: (id: string, patch: Partial<Pick<ProgrammeDoc, 'title' | 'cover_image' | 'event_id' | 'is_free' | 'price_pence' | 'status'>>) => void;
  publishProgramme: (id: string) => void;
  archiveProgramme: (id: string) => void;

  // editor actions
  setActiveId: (id: string | null) => void;
  setActivePageId: (pageId: string | null) => void;
  setSelectedBlockId: (blockId: string | null) => void;

  // page actions
  addPage: (programmeId: string) => string;
  removePage: (programmeId: string, pageId: string) => void;
  renamePage: (programmeId: string, pageId: string, title: string) => void;
  reorderPages: (programmeId: string, fromIndex: number, toIndex: number) => void;

  // block actions
  addBlock: (programmeId: string, pageId: string, blockType: Block['type'], index?: number) => string | null;
  updateBlock: (programmeId: string, pageId: string, blockId: string, patch: Partial<Block>) => void;
  removeBlock: (programmeId: string, pageId: string, blockId: string) => void;
  reorderBlocks: (programmeId: string, pageId: string, fromIndex: number, toIndex: number) => void;
  duplicateBlock: (programmeId: string, pageId: string, blockId: string) => string | null;

  // helpers
  getActiveProgramme: () => ProgrammeDoc | null;
  getActivePage: () => ProgrammePage | null;
  getSelectedBlock: () => Block | null;
}

const arrayMove = <T>(arr: T[], from: number, to: number): T[] => {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
};

export const useProgrammesStore = create<ProgrammesState>()(
  persist(
    (set, get) => ({
      programmes: {},
      activeId: null,
      selectedBlockId: null,
      activePageId: null,

      createProgramme: ({ venue_id, event_id, title }) => {
        const id = newId('prg');
        const pageId = newId('pg');
        const now = new Date().toISOString();
        const programme: ProgrammeDoc = {
          id,
          venue_id,
          event_id: event_id ?? null,
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
        set((s) => ({
          programmes: { ...s.programmes, [id]: programme },
        }));
        return id;
      },

      duplicateProgramme: (id) => {
        const original = get().programmes[id];
        if (!original) return null;
        const newProgrammeId = newId('prg');
        const now = new Date().toISOString();
        const copied: ProgrammeDoc = {
          ...original,
          id: newProgrammeId,
          title: `${original.title} (Copy)`,
          status: 'draft',
          created_at: now,
          updated_at: now,
          published_at: undefined,
          pages: original.pages.map((p) => ({
            ...p,
            id: newId('pg'),
            blocks: p.blocks.map((b) => ({ ...b, id: newId('blk') })),
          })),
        };
        set((s) => ({ programmes: { ...s.programmes, [newProgrammeId]: copied } }));
        return newProgrammeId;
      },

      deleteProgramme: (id) => {
        set((s) => {
          const next = { ...s.programmes };
          delete next[id];
          return {
            programmes: next,
            activeId: s.activeId === id ? null : s.activeId,
          };
        });
      },

      updateProgrammeMeta: (id, patch) => {
        set((s) => {
          const p = s.programmes[id];
          if (!p) return s;
          return {
            programmes: {
              ...s.programmes,
              [id]: { ...p, ...patch, updated_at: new Date().toISOString() },
            },
          };
        });
      },

      publishProgramme: (id) => {
        set((s) => {
          const p = s.programmes[id];
          if (!p) return s;
          const now = new Date().toISOString();
          return {
            programmes: {
              ...s.programmes,
              [id]: { ...p, status: 'published' as ProgrammeDocStatus, published_at: now, updated_at: now },
            },
          };
        });
      },

      archiveProgramme: (id) => {
        set((s) => {
          const p = s.programmes[id];
          if (!p) return s;
          return {
            programmes: {
              ...s.programmes,
              [id]: { ...p, status: 'archived' as ProgrammeDocStatus, updated_at: new Date().toISOString() },
            },
          };
        });
      },

      setActiveId: (id) =>
        set((s) => {
          const programme = id ? s.programmes[id] : null;
          return {
            activeId: id,
            activePageId: programme?.pages[0]?.id ?? null,
            selectedBlockId: null,
          };
        }),

      setActivePageId: (pageId) => set({ activePageId: pageId, selectedBlockId: null }),
      setSelectedBlockId: (blockId) => set({ selectedBlockId: blockId }),

      addPage: (programmeId) => {
        const pageId = newId('pg');
        set((s) => {
          const programme = s.programmes[programmeId];
          if (!programme) return s;
          const newPage: ProgrammePage = {
            id: pageId,
            title: `Page ${programme.pages.length + 1}`,
            blocks: [],
          };
          return {
            programmes: {
              ...s.programmes,
              [programmeId]: {
                ...programme,
                pages: [...programme.pages, newPage],
                updated_at: new Date().toISOString(),
              },
            },
            activePageId: pageId,
            selectedBlockId: null,
          };
        });
        return pageId;
      },

      removePage: (programmeId, pageId) => {
        set((s) => {
          const programme = s.programmes[programmeId];
          if (!programme || programme.pages.length <= 1) return s;
          const filtered = programme.pages.filter((p) => p.id !== pageId);
          return {
            programmes: {
              ...s.programmes,
              [programmeId]: { ...programme, pages: filtered, updated_at: new Date().toISOString() },
            },
            activePageId: s.activePageId === pageId ? filtered[0]?.id ?? null : s.activePageId,
            selectedBlockId: null,
          };
        });
      },

      renamePage: (programmeId, pageId, title) => {
        set((s) => {
          const programme = s.programmes[programmeId];
          if (!programme) return s;
          return {
            programmes: {
              ...s.programmes,
              [programmeId]: {
                ...programme,
                pages: programme.pages.map((p) => (p.id === pageId ? { ...p, title } : p)),
                updated_at: new Date().toISOString(),
              },
            },
          };
        });
      },

      reorderPages: (programmeId, fromIndex, toIndex) => {
        set((s) => {
          const programme = s.programmes[programmeId];
          if (!programme) return s;
          return {
            programmes: {
              ...s.programmes,
              [programmeId]: {
                ...programme,
                pages: arrayMove(programme.pages, fromIndex, toIndex),
                updated_at: new Date().toISOString(),
              },
            },
          };
        });
      },

      addBlock: (programmeId, pageId, blockType, index) => {
        const tpl = findBlockTemplate(blockType);
        if (!tpl) return null;
        const newBlock = tpl.factory();
        set((s) => {
          const programme = s.programmes[programmeId];
          if (!programme) return s;
          return {
            programmes: {
              ...s.programmes,
              [programmeId]: {
                ...programme,
                pages: programme.pages.map((p) => {
                  if (p.id !== pageId) return p;
                  const blocks = [...p.blocks];
                  if (typeof index === 'number') blocks.splice(index, 0, newBlock);
                  else blocks.push(newBlock);
                  return { ...p, blocks };
                }),
                updated_at: new Date().toISOString(),
              },
            },
            selectedBlockId: newBlock.id,
          };
        });
        return newBlock.id;
      },

      updateBlock: (programmeId, pageId, blockId, patch) => {
        set((s) => {
          const programme = s.programmes[programmeId];
          if (!programme) return s;
          return {
            programmes: {
              ...s.programmes,
              [programmeId]: {
                ...programme,
                pages: programme.pages.map((p) =>
                  p.id !== pageId
                    ? p
                    : {
                      ...p,
                      blocks: p.blocks.map((b) =>
                        b.id === blockId ? ({ ...b, ...patch } as Block) : b
                      ),
                    }
                ),
                updated_at: new Date().toISOString(),
              },
            },
          };
        });
      },

      removeBlock: (programmeId, pageId, blockId) => {
        set((s) => {
          const programme = s.programmes[programmeId];
          if (!programme) return s;
          return {
            programmes: {
              ...s.programmes,
              [programmeId]: {
                ...programme,
                pages: programme.pages.map((p) =>
                  p.id !== pageId ? p : { ...p, blocks: p.blocks.filter((b) => b.id !== blockId) }
                ),
                updated_at: new Date().toISOString(),
              },
            },
            selectedBlockId: s.selectedBlockId === blockId ? null : s.selectedBlockId,
          };
        });
      },

      reorderBlocks: (programmeId, pageId, fromIndex, toIndex) => {
        set((s) => {
          const programme = s.programmes[programmeId];
          if (!programme) return s;
          return {
            programmes: {
              ...s.programmes,
              [programmeId]: {
                ...programme,
                pages: programme.pages.map((p) =>
                  p.id !== pageId ? p : { ...p, blocks: arrayMove(p.blocks, fromIndex, toIndex) }
                ),
                updated_at: new Date().toISOString(),
              },
            },
          };
        });
      },

      duplicateBlock: (programmeId, pageId, blockId) => {
        const programme = get().programmes[programmeId];
        if (!programme) return null;
        const page = programme.pages.find((p) => p.id === pageId);
        if (!page) return null;
        const idx = page.blocks.findIndex((b) => b.id === blockId);
        if (idx < 0) return null;
        const newBlockId = newId('blk');
        const copy: Block = { ...page.blocks[idx]!, id: newBlockId };
        set((s) => ({
          programmes: {
            ...s.programmes,
            [programmeId]: {
              ...programme,
              pages: programme.pages.map((p) => {
                if (p.id !== pageId) return p;
                const blocks = [...p.blocks];
                blocks.splice(idx + 1, 0, copy);
                return { ...p, blocks };
              }),
              updated_at: new Date().toISOString(),
            },
          },
          selectedBlockId: newBlockId,
        }));
        return newBlockId;
      },

      getActiveProgramme: () => {
        const { activeId, programmes } = get();
        return activeId ? programmes[activeId] ?? null : null;
      },
      getActivePage: () => {
        const { activeId, activePageId, programmes } = get();
        const p = activeId ? programmes[activeId] : null;
        return p?.pages.find((pg) => pg.id === activePageId) ?? null;
      },
      getSelectedBlock: () => {
        const { activeId, activePageId, selectedBlockId, programmes } = get();
        const p = activeId ? programmes[activeId] : null;
        const page = p?.pages.find((pg) => pg.id === activePageId);
        return page?.blocks.find((b) => b.id === selectedBlockId) ?? null;
      },
    }),
    { name: 'showe-programmes' }
  )
);

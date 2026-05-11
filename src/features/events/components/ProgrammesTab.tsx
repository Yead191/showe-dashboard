import { useProgrammesStore } from '@/features/programmes/store/programmes.store';
import { useShallow } from 'zustand/react/shallow';
import { BookOpen, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EventFormState } from '../types';

interface ProgrammesTabProps {
  state: EventFormState;
  update: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
}

export function ProgrammesTab({ state, update }: ProgrammesTabProps) {
  const programmes = useProgrammesStore(useShallow((s) => Object.values(s.programmes)));
  
  const selectedId = state.linked_programme_id;

  function toggleProgramme(id: string) {
    if (selectedId === id) {
      update('linked_programme_id', null);
    } else {
      update('linked_programme_id', id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
        <h3 className="text-sm font-bold text-primary flex items-center gap-2">
          <BookOpen size={16} />
          Interactive Programme
        </h3>
        <p className="text-[12.5px] text-ink-muted mt-1 leading-relaxed">
          Link an interactive programme to this event. Audiences will be able to access it via the SHOWE app during the performance.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="field-label !mb-0">Available programmes</label>
          <span className="text-[11px] text-ink-faint font-semibold uppercase tracking-wider">
            {programmes.length} found
          </span>
        </div>

        {programmes.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-line rounded-2xl bg-surface-sunken/30">
            <div className="w-12 h-12 rounded-full bg-surface-sunken flex items-center justify-center mx-auto mb-3 text-ink-faint">
              <BookOpen size={20} />
            </div>
            <p className="text-sm text-ink-muted">No programmes found in your library.</p>
            <p className="text-[12px] text-ink-faint mt-1">Create one in the "Programmes" section first.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {programmes.map((p) => {
              const isSelected = selectedId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProgramme(p.id)}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-2xl border text-left transition-all group',
                    isSelected
                      ? 'bg-white border-primary shadow-soft ring-1 ring-primary'
                      : 'bg-surface-raised border-line hover:border-line-strong'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                    isSelected ? 'bg-primary text-white' : 'bg-surface-sunken text-ink-faint group-hover:bg-surface-sunken/80'
                  )}>
                    <BookOpen size={18} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm text-ink truncate">
                      {p.title}
                    </div>
                    <div className="text-[11.5px] text-ink-faint mt-0.5 flex items-center gap-2">
                      <span className={cn(
                        'px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                        p.status === 'published' ? 'bg-success/10 text-success' : 'bg-ink-faint/10 text-ink-faint'
                      )}>
                        {p.status}
                      </span>
                      <span>•</span>
                      <span>{p.pages.length} pages</span>
                    </div>
                  </div>

                  <div className={cn(
                    'transition-colors',
                    isSelected ? 'text-primary' : 'text-line-strong'
                  )}>
                    {isSelected ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedId && (
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 flex items-start gap-3">
          <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" />
          <div className="text-[12.5px] text-ink-muted leading-relaxed">
            <strong className="text-ink">Selected for import:</strong> “{programmes.find(p => p.id === selectedId)?.title}” will be linked to this event once you save your changes.
          </div>
        </div>
      )}
    </div>
  );
}

import { Button } from 'antd';
import { Calendar, Clock, Sun, Moon, GalleryHorizontalEnd, Plus, Trash2 } from 'lucide-react';
import { FieldGroup } from './FieldGroup';
import { cn } from '@/lib/utils';
import type { EventFormState } from '../types';
import type { Performance, PerformanceType } from '@/types/event';

interface ScheduleTabProps {
  state: EventFormState;
  update: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
}

export function ScheduleTab({ state, update }: ScheduleTabProps) {
  function addPerformance() {
    update('performances', [
      ...state.performances,
      {
        id: `p${state.performances.length + 1}`,
        date: '',
        start_time: '19:30',
        end_time: '21:30',
        type: 'evening',
      },
    ]);
  }

  function updatePerformance(i: number, p: Partial<Performance>) {
    const next = [...state.performances];
    next[i] = { ...next[i], ...p };
    update('performances', next);
  }

  function removePerformance(i: number) {
    if (state.performances.length === 1) return;
    update('performances', state.performances.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-6">
      <FieldGroup
        label="Performances"
        hint="Add every show date. Mark each as Matinee or Evening — analytics segment by performance type."
      >
        <div className="space-y-3">
          {state.performances.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border border-line bg-surface-raised p-4 grid grid-cols-12 gap-3 items-end"
            >
              <div className="col-span-12 sm:col-span-3">
                <label className="field-label">Date</label>
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
                  />
                  <input
                    type="date"
                    value={p.date}
                    onChange={(e) => updatePerformance(i, { date: e.target.value })}
                    className="input-base pl-9"
                  />
                </div>
              </div>
              <div className="col-span-6 sm:col-span-2">
                <label className="field-label">Start</label>
                <div className="relative">
                  <Clock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
                  />
                  <input
                    type="time"
                    value={p.start_time}
                    onChange={(e) => updatePerformance(i, { start_time: e.target.value })}
                    className="input-base pl-9"
                  />
                </div>
              </div>
              <div className="col-span-6 sm:col-span-2">
                <label className="field-label">End</label>
                <input
                  type="time"
                  value={p.end_time}
                  onChange={(e) => updatePerformance(i, { end_time: e.target.value })}
                  className="input-base"
                />
              </div>
              <div className="col-span-9 sm:col-span-4">
                <label className="field-label">Performance type</label>
                <PerformanceTypeToggle
                  value={p.type}
                  onChange={(v) => updatePerformance(i, { type: v })}
                />
              </div>
              <div className="col-span-3 sm:col-span-1 flex justify-end">
                <Button
                  type="text"
                  icon={<Trash2 size={14} />}
                  onClick={() => removePerformance(i)}
                  disabled={state.performances.length === 1}
                  danger
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addPerformance}
            className="w-full rounded-xl border-2 border-dashed border-line hover:border-primary hover:bg-primary/5 py-3 text-sm font-semibold text-ink-muted hover:text-primary transition-colors inline-flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Add another performance
          </button>
        </div>
      </FieldGroup>
    </div>
  );
}

function PerformanceTypeToggle({
  value,
  onChange,
}: {
  value: PerformanceType;
  onChange: (v: PerformanceType) => void;
}) {
  const opts: { v: PerformanceType; label: string; icon: any }[] = [
    { v: 'matinee', label: 'Matinee', icon: Sun },
    { v: 'evening', label: 'Evening', icon: Moon },
    { v: 'all_day', label: 'All day', icon: GalleryHorizontalEnd },
  ];
  return (
    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-full bg-surface-sunken h-11 border border-line">
      {opts.map((o) => {
        const Icon = o.icon;
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold transition-all',
              active ? 'bg-primary text-ink-inverse shadow-soft' : 'text-ink-muted hover:text-ink'
            )}
          >
            <Icon size={12} /> {o.label}
          </button>
        );
      })}
    </div>
  );
}

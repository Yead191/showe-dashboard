import { Calendar, Sun, Moon, Sunrise, Users } from 'lucide-react';
import { cn, formatDateShort, formatNumber } from '@/lib/utils';
import type { Performance, PerformanceType } from '@/types/event';

interface PerformancePickerProps {
    performances: Performance[];
    /** Selected performance id, or null = "all attendees of event" */
    value: string | null;
    onChange: (performanceId: string | null) => void;
    /** Function returning the reach estimate for a given performance. */
    reachFor: (performanceId: string) => number;
    totalReach: number;
}

const TYPE_META: Record<PerformanceType, { label: string; icon: typeof Sun; color: string }> = {
    matinee: { label: 'Matinee', icon: Sun, color: '#DA7101' },
    evening: { label: 'Evening', icon: Moon, color: '#014B52' },
    all_day: { label: 'All day', icon: Sunrise, color: '#7A39BB' },
};

export default function PerformancePicker({
    performances,
    value,
    onChange,
    reachFor,
    totalReach,
}: PerformancePickerProps) {
    if (performances.length === 0) return null;

    return (
        <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
                <span className="field-label !mb-0 flex items-center gap-1.5">
                    <Calendar size={12} />
                    Target performance
                </span>
                <span className="text-[11px] text-ink-faint">
                    {performances.length} {performances.length === 1 ? 'performance' : 'performances'}
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    className={cn(
                        'flex items-center gap-2 px-3.5 h-11 rounded-xl border text-sm font-semibold transition-all',
                        value === null
                            ? 'bg-primary text-ink-inverse border-primary shadow-sm shadow-primary/15'
                            : 'bg-surface-raised text-ink-muted border-line hover:border-primary/40 hover:text-ink'
                    )}
                >
                    <Users size={14} />
                    <span className="leading-none">All attendees</span>
                    <span
                        className={cn(
                            'inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[10px] font-black tabular',
                            value === null ? 'bg-white/20' : 'bg-surface-sunken text-ink-faint'
                        )}
                    >
                        {formatNumber(totalReach)}
                    </span>
                </button>

                {performances.map((p) => {
                    const meta = TYPE_META[p.type];
                    const Icon = meta.icon;
                    const isActive = p.id === value;
                    const reach = reachFor(p.id);
                    return (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => onChange(p.id)}
                            className={cn(
                                'flex items-center gap-2 px-3.5 h-11 rounded-xl border text-sm font-semibold transition-all',
                                isActive
                                    ? 'text-ink-inverse shadow-sm border-transparent'
                                    : 'bg-surface-raised text-ink-muted border-line hover:border-primary/40 hover:text-ink'
                            )}
                            style={
                                isActive
                                    ? { backgroundColor: meta.color, boxShadow: `0 4px 14px ${meta.color}30` }
                                    : undefined
                            }
                        >
                            <Icon size={14} style={!isActive ? { color: meta.color } : undefined} />
                            <span className="leading-none flex flex-col items-start text-left">
                                <span className="text-[12.5px]">{formatDateShort(p.date)}</span>
                                <span className={cn('text-[10.5px] font-medium', isActive ? 'opacity-80' : 'text-ink-faint')}>
                                    {p.start_time} · {meta.label}
                                </span>
                            </span>
                            <span
                                className={cn(
                                    'inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[10px] font-black tabular',
                                    isActive ? 'bg-white/20' : 'bg-surface-sunken text-ink-faint'
                                )}
                            >
                                {formatNumber(reach)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

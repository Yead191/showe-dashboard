import { Button, Tooltip } from 'antd';
import {
    Edit2,
    Trash2,
    Check,
    Sparkles,
    Lock,
    Globe2,
} from 'lucide-react';
import { Panel } from '@/components/ui';
import { cn } from '@/lib/utils';
import { TIER_META } from '@/constants/tiers';
import type { AddOn } from '@/constants/addons';
import { ADDON_STATUS_META } from '@/constants/addons';
import { ADDON_ICONS } from '@/constants/addon-icons';

function StatusChip({ status }: { status: AddOn['status'] }) {
    const meta = ADDON_STATUS_META[status];
    const tone = {
        success: 'bg-success/10 text-success border-success/20',
        warning: 'bg-warning/10 text-warning border-warning/20',
        neutral: 'bg-surface-sunken text-ink-faint border-line',
    }[meta.tone];
    return (
        <span className={cn(
            'text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border',
            tone
        )}>
            {meta.label}
        </span>
    );
}

export default function AdminAddOnCard({
    addon,
    onEdit,
    onDelete,
}: {
    addon: AddOn;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const Icon = ADDON_ICONS[addon.icon] ?? Sparkles;
    const isComingSoon = addon.status === 'coming_soon';
    const isArchived = addon.status === 'archived';
    const tierCount = addon.availableOn === 'all' ? 'All tiers' : `${addon.availableOn.length} tier${addon.availableOn.length === 1 ? '' : 's'}`;

    return (
        <Panel className={cn(
            "relative flex flex-col h-full transition-all duration-500 hover:shadow-xl hover:translate-y-[-6px] group",
            isArchived && "opacity-60",
        )}>
            <div
                className="absolute top-0 right-0 w-28 h-28 blur-3xl opacity-[0.08] transition-all duration-700 group-hover:opacity-[0.15]"
                style={{ backgroundColor: addon.color }}
            />

            <div className="flex justify-between items-start mb-5">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 shadow-sm relative overflow-hidden"
                    style={{
                        backgroundColor: `${addon.color}15`,
                        borderColor: `${addon.color}30`,
                        color: addon.color,
                    }}
                >
                    <Icon size={22} strokeWidth={2.5} className="relative z-10" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <Tooltip title="Edit Add-on">
                        <Button
                            className="w-8 h-8 rounded-xl flex items-center justify-center border-line bg-surface-raised hover:bg-primary/5 hover:border-primary/30 shadow-sm"
                            icon={<Edit2 size={13} className="text-ink-muted" />}
                            onClick={onEdit}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Add-on">
                        <Button
                            className="w-8 h-8 rounded-xl flex items-center justify-center border-line bg-surface-raised hover:bg-error/5 hover:border-error/30 shadow-sm"
                            icon={<Trash2 size={13} className="text-ink-muted hover:text-error transition-colors" />}
                            onClick={onDelete}
                        />
                    </Tooltip>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-surface-sunken border border-line text-ink-faint">
                        {addon.short}
                    </span>
                    <StatusChip status={addon.status} />
                </div>
                <h3 className="font-display font-extrabold text-2xl text-ink leading-tight tracking-tight">{addon.label}</h3>
                <p className="text-[13px] text-ink-muted mt-1.5 leading-relaxed line-clamp-2 min-h-[36px]">{addon.description}</p>
            </div>

            <div className="flex items-baseline gap-1.5 mb-5">
                <span className="text-3xl font-display font-black text-ink tabular">£{addon.priceMonthly}</span>
                <span className="text-ink-faint text-sm font-medium">/ month</span>
            </div>

            <div className="space-y-2.5 mb-5 flex-1">
                {addon.bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[13px]">
                        <div
                            className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${addon.color}15`, color: addon.color }}
                        >
                            <Check size={9} strokeWidth={4} />
                        </div>
                        <span className="text-ink-muted font-medium leading-snug">{b}</span>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t border-line/60 space-y-2 text-[11.5px]">
                <div className="flex items-center justify-between">
                    <span className="text-ink-faint flex items-center gap-1.5">
                        <Globe2 size={11} /> Availability
                    </span>
                    <span className="font-bold text-ink">
                        {addon.availableOn === 'all'
                            ? 'All tiers'
                            : <Tooltip title={addon.availableOn.map(t => TIER_META[t].label).join(', ')}>{tierCount}</Tooltip>
                        }
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-ink-faint flex items-center gap-1.5">
                        {addon.linkedModule ? <Sparkles size={11} /> : <Lock size={11} />}
                        Module link
                    </span>
                    <span className="font-bold text-ink">
                        {addon.linkedModule ? `Module ${addon.linkedModule}` : 'Standalone'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-ink-faint">Capability</span>
                    <span className="font-mono text-[10.5px] text-ink-muted">{addon.capabilityKey}</span>
                </div>
            </div>

            {isComingSoon && (
                <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">
                    Preview
                </div>
            )}
        </Panel>
    );
}

import {
    Layers,
    Zap,
    Award,
    GraduationCap,
    Crown,
    Target,
    Edit2,
    Trash2,
    Settings2,
    Check,
    ChevronRight,
} from 'lucide-react';
import { Button, Tooltip } from 'antd';
import { Panel } from '@/components/ui';
import { cn } from '@/lib/utils';
import { MODULES_LIST } from '@/constants/tiers';
import type { TierInfo } from './AdminTiers';

export function TierCard({ tier, onEdit, onDelete }: { tier: TierInfo; onEdit: () => void; onDelete: () => void }) {
    const isProducer = tier.id === 'tier_3_plus';
    const isSchool = tier.id === 'tier_1';

    let Icon = Layers;
    if (tier.id === 'tier_2') Icon = Zap;
    if (tier.id === 'tier_3') Icon = Award;
    if (isProducer) Icon = Crown;
    if (isSchool) Icon = GraduationCap;

    return (
        <Panel className={cn(
            "relative flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:translate-y-[-8px] group",
            tier.recommended ? "border-primary/40 shadow-xl shadow-primary/5 ring-1 ring-primary/20" : "hover:border-line-strong shadow-soft"
        )}>
            {/* Background Accent Gradient */}
            <div
                className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-[0.08]  transition-all duration-700 group-hover:opacity-[0.15] group-hover:scale-150"
                style={{ backgroundColor: tier.color }}
            />

            {tier?.recommended && (
                <div className="absolute -top-3 left-6 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-primary/20 z-10">
                    Recommended Plan
                </div>
            )}

            <div className="flex justify-between items-start mb-8">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm relative overflow-hidden"
                    style={{
                        backgroundColor: `${tier.color}15`,
                        borderColor: `${tier.color}30`,
                        color: tier.color
                    }}
                >
                    <Icon size={28} strokeWidth={2.5} className="relative z-10" />
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 2xl:transition-transform duration-500" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <Tooltip title="Edit Config">
                        <Button
                            className="w-9 h-9 rounded-xl flex items-center justify-center border-line bg-surface-raised hover:bg-primary/5 hover:border-primary/30 shadow-sm"
                            icon={<Edit2 size={15} className="text-ink-muted group-hover:text-primary transition-colors" />}
                            onClick={onEdit}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Tier">
                        <Button
                            className="w-9 h-9 rounded-xl flex items-center justify-center border-line bg-surface-raised hover:bg-error/5 hover:border-error/30 shadow-sm"
                            icon={<Trash2 size={15} className="text-ink-muted hover:text-error transition-colors" />}
                            onClick={onDelete}
                        />
                    </Tooltip>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-surface-sunken border border-line text-ink-faint">
                        {tier.short}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary/70">
                        <Target size={12} />
                        {tier.audience?.split(',')[0]}
                    </span>
                </div>
                <h3 className="font-display font-extrabold text-3xl text-ink leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">{tier.label}</h3>
                <p className="text-[14px] text-ink-muted mt-2 leading-relaxed opacity-80 min-h-[42px] line-clamp-2">{tier.description}</p>
            </div>

            <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-display font-black text-ink tabular">£{tier.price}</span>
                    <span className="text-ink-faint text-[15px] font-medium">/ {tier.billingPeriod === 'yearly' ? 'year' : 'mo'}</span>
                </div>
            </div>

            <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-ink-faint uppercase tracking-widest flex items-center gap-2">
                        <Settings2 size={12} />
                        Module Coverage
                    </div>
                    <div className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/5 border border-primary/10">
                        {tier.modules.length}/10
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {tier?.modules.map(mId => {
                        const m = MODULES_LIST.find(mod => mod.value === mId);
                        return (
                            <Tooltip key={mId} title={m?.label}>
                                <div className="bg-surface-sunken border border-line/60 text-ink-muted font-bold text-[9px] px-2 py-0.5 rounded-md transition-all hover:bg-primary hover:text-white hover:border-primary cursor-default">
                                    {mId}
                                </div>
                            </Tooltip>
                        );
                    })}
                </div>

                {/* Org Limits & Permissions */}
                <div className="pt-4 mt-2 border-t border-line/40">
                    <div className="text-[10px] font-bold text-ink-faint uppercase tracking-widest flex items-center gap-2 mb-3">
                        <Target size={12} />
                        Org Limits &amp; Permissions
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <LimitPill
                            label="Venues"
                            value={tier.maxVenues === 0 ? 'Unlimited' : `Max ${tier.maxVenues}`}
                            color={tier.color}
                        />
                        <LimitPill
                            label="Programmes"
                            value={tier.maxProgrammes === 0 ? 'Unlimited' : `Max ${tier.maxProgrammes}`}
                            color={tier.color}
                        />
                        <LimitPill
                            label="Sell"
                            value={tier.canSell ? 'Allowed' : 'Not allowed'}
                            color={tier.canSell ? '#437A22' : '#9A938B'}
                            highlight={tier.canSell}
                        />
                        {tier.canSell && tier.minProgrammePrice !== undefined && (
                            <LimitPill
                                label="Min Price"
                                value={`£${tier.minProgrammePrice}`}
                                color={tier.color}
                            />
                        )}
                        {tier.downloadFeePrice !== undefined && tier.downloadFeePrice !== null && tier.downloadFeePrice > 0 && (
                            <LimitPill
                                label="Download Fee"
                                value={`£${tier.downloadFeePrice}`}
                                color={tier.color}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-3.5 pt-8 border-t border-line/60 relative">
                {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3.5 text-sm group/feature">
                        <div
                            className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 group-hover/feature:scale-110 group-hover/feature:shadow-md"
                            style={{ backgroundColor: `${tier.color}15`, color: tier.color }}
                        >
                            <Check size={11} strokeWidth={4} />
                        </div>
                        <span className="text-ink-muted font-medium leading-snug group-hover/feature:text-ink transition-colors">{feature}</span>
                    </div>
                ))}
            </div>

            <div className="mt-10 pt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <Button
                    block
                    className="h-12 rounded-xl border-none font-bold text-sm bg-surface-sunken text-ink hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                    onClick={onEdit}
                >
                    Update Plan Configuration
                    <ChevronRight size={14} className="opacity-50" />
                </Button>
            </div>
        </Panel>
    );
}

export function LimitPill({
    label,
    value,
    color,
    highlight = false,
}: {
    label: string;
    value: string;
    color: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 border text-[10px] font-bold',
                highlight ? 'border-transparent' : 'border-line/60'
            )}
            style={
                highlight
                    ? { backgroundColor: `${color}18`, color, borderColor: `${color}30` }
                    : { backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink-faint)' }
            }
        >
            <span className="uppercase tracking-widest opacity-60">{label}</span>
            <span className="font-black">{value}</span>
        </div>
    );
}

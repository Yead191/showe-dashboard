import { Layers, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TabKey } from './AdminTiers';

export function TierTabs({
    activeTab,
    onChange,
    tierCount,
    addonCount,
}: {
    activeTab: TabKey;
    onChange: (key: TabKey) => void;
    tierCount: number;
    addonCount: number;
}) {
    const tabs: { key: TabKey; label: string; icon: typeof Layers; count: number; description: string }[] = [
        {
            key: 'tiers',
            label: 'Subscription Tiers',
            icon: Layers,
            count: tierCount,
            description: 'Core plans bundling module access',
        },
        {
            key: 'addons',
            label: 'Optional Add-Ons',
            icon: Sparkles,
            count: addonCount,
            description: 'À la carte upgrades',
        },
    ];

    return (
        <div className="mt-8 mb-8">
            <div
                role="tablist"
                aria-label="Platform plan management"
                className="inline-flex items-center gap-1 p-1.5 bg-surface-sunken border border-line rounded-2xl shadow-soft"
            >
                {tabs?.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = tab.key === activeTab;
                    return (
                        <button
                            key={tab.key}
                            role="tab"
                            aria-selected={isActive}
                            type="button"
                            onClick={() => onChange(tab.key)}
                            className={cn(
                                'relative flex items-center gap-3 px-5 h-12 rounded-xl text-sm font-bold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                                isActive
                                    ? 'bg-surface-raised text-ink shadow-medium border border-line'
                                    : 'text-ink-faint hover:text-ink-muted hover:bg-surface-raised/50 border border-transparent'
                            )}
                        >
                            <Icon
                                size={16}
                                strokeWidth={2.4}
                                className={cn(
                                    'transition-colors',
                                    isActive ? 'text-primary' : 'text-ink-faint'
                                )}
                            />
                            <span className="leading-none">{tab.label}</span>
                            <span
                                className={cn(
                                    'inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[10.5px] font-black tabular transition-all',
                                    isActive
                                        ? 'bg-primary text-white shadow-sm shadow-primary/20'
                                        : 'bg-surface-offset text-ink-faint'
                                )}
                            >
                                {tab.count}
                            </span>
                            {isActive && (
                                <span className="absolute -bottom-px left-5 right-5 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

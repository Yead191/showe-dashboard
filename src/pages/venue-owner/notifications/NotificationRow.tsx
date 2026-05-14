import {
    Clock,
    CheckCircle2,
    Users,
    Ticket,
    Eye,
    ArrowUpRight,
    Smartphone,
    Globe,
    Edit,
    Trash2,
    MoreVertical,
    Calendar as CalIcon,
} from 'lucide-react';
import { Button, Dropdown } from 'antd';
import { cn, formatNumber, formatDateTime } from '@/lib/utils';
import type { NotificationPlatform, NotificationAudience } from '@/constants/notifications';

function PlatformChips({ platform }: { platform: NotificationPlatform }) {
    const items: { icon: typeof Smartphone; label: string }[] = [];
    if (platform === 'app' || platform === 'both') items.push({ icon: Smartphone, label: 'App' });
    if (platform === 'web' || platform === 'both') items.push({ icon: Globe, label: 'Web' });
    return (
        <>
            {items.map(({ icon: I, label }) => (
                <span
                    key={label}
                    className="inline-flex items-center gap-1 px-2 h-5 rounded-full bg-surface-offset border border-line text-[10px] font-bold text-ink-muted"
                >
                    <I size={9} />
                    {label}
                </span>
            ))}
        </>
    );
}

export interface NotificationRowData {
    title: string;
    body: string;
    platform: NotificationPlatform;
    destination: { screen: string; params: Record<string, string> };
    target: {
        scope: NotificationAudience;
        eventTitle?: string;
        performanceLabel?: string;
        venueName?: string;
    };
    reach: number;
}

interface NotificationRowProps {
    data: NotificationRowData;
    mode: 'scheduled' | 'sent';
    whenLabel: string;
    openRate?: number;
    clickRate?: number;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function NotificationRow({
    data,
    mode,
    whenLabel,
    openRate,
    clickRate,
    onEdit,
    onDelete,
}: NotificationRowProps) {
    const audienceLine = (() => {
        if (data.target.scope === 'all') return 'All programme holders';
        if (data.target.scope === 'venue') return data.target.venueName ?? 'Venue';
        return `${data.target.eventTitle} · ${data.target.performanceLabel ?? 'All attendees'}`;
    })();

    const Icon = mode === 'scheduled' ? Clock : CheckCircle2;
    const iconColor = mode === 'scheduled' ? 'bg-amber/10 text-amber' : 'bg-success/10 text-success';

    return (
        <div className="p-5 flex items-start gap-4 hover:bg-surface-sunken/50 transition-colors group">
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', iconColor)}>
                <Icon size={16} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="font-bold text-ink truncate">{data.title}</div>
                        <div className="text-sm text-ink-muted line-clamp-2 mt-0.5">{data.body}</div>
                    </div>
                    {mode === 'sent' && openRate != null && (
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                            <span className="text-amber font-bold text-sm tabular flex items-center gap-1">
                                <Eye size={11} /> {Math.round(openRate * 100)}%
                            </span>
                            {clickRate != null && (
                                <span className="text-info font-semibold text-[11px] tabular flex items-center gap-1">
                                    <ArrowUpRight size={10} /> {Math.round(clickRate * 100)}% tap
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                    <span className="flex items-center gap-1 normal-case text-ink-muted tracking-normal">
                        <Users size={11} /> {formatNumber(data.reach)}
                    </span>
                    <span className="flex items-center gap-1 normal-case text-ink-muted tracking-normal">
                        <CalIcon size={11} /> {whenLabel}
                    </span>
                    <span className="flex items-center gap-1 normal-case text-ink-muted tracking-normal min-w-0">
                        <Ticket size={11} className="shrink-0" />
                        <span className="truncate">{audienceLine}</span>
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <PlatformChips platform={data.platform} />
                    <span className="inline-flex items-center gap-1 px-2 h-5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono text-[10px] font-bold">
                        {data.destination.screen}
                    </span>
                    {Object.keys(data.destination.params).length > 0 && (
                        <span className="text-[10.5px] text-ink-faint font-mono">
                            {Object.entries(data.destination.params)
                                .map(([k, v]) => `${k}=${v}`)
                                .join(' · ')}
                        </span>
                    )}
                </div>
            </div>

            {mode === 'scheduled' && (
                <Dropdown
                    menu={{
                        items: [
                            { key: 'edit', label: 'Edit schedule', icon: <Edit size={14} /> },
                            { key: 'delete', label: 'Delete', icon: <Trash2 size={14} />, danger: true },
                        ],
                        onClick: ({ key }) => {
                            if (key === 'delete') onDelete?.();
                            else onEdit?.();
                        },
                    }}
                    trigger={['click']}
                >
                    <Button
                        type="text"
                        icon={<MoreVertical size={16} />}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    />
                </Dropdown>
            )}
        </div>
    );
}


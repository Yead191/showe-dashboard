import { Send, Ticket, Building2, Smartphone, Globe, Layers } from 'lucide-react';
import { Button, Select } from 'antd';
import { Panel } from '@/components/ui';
import { cn, formatNumber } from '@/lib/utils';
import {
    PLATFORM_META,
    type NotificationAudience,
    type NotificationPlatform,
} from '@/constants/notifications';
import type { EventListItem } from '@/types/event';
import type { Performance } from '@/types/event';
import type { Venue } from '@/types/venue';
import PerformancePicker from './PerformancePicker';
import DeepLinkConfig, { type DeepLinkParam } from './DeepLinkConfig';
import TapBehaviourPreview from './TapBehaviourPreview';
import SelectedTargetCard from './SelectedTargetCard';

const PLATFORM_ICONS = { Smartphone, Globe, Layers } as const;

/* ---------- PillSwitcher (private) ---------- */

interface PillOption<T extends string> {
    value: T;
    label: string;
    description: string;
    Icon: typeof Smartphone;
}

function PillSwitcher<T extends string>({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: T;
    onChange: (v: T) => void;
    options: PillOption<T>[];
}) {
    return (
        <div>
            <label className="field-label">{label}</label>
            <div className="grid grid-cols-3 gap-2">
                {options.map((o) => {
                    const isActive = o.value === value;
                    const Icon = o.Icon;
                    return (
                        <button
                            key={o.value}
                            type="button"
                            onClick={() => onChange(o.value)}
                            className={cn(
                                'flex flex-col items-start text-left gap-1 p-3 rounded-xl border transition-all',
                                isActive
                                    ? 'border-primary bg-primary/[0.04] shadow-soft'
                                    : 'border-line bg-surface-raised hover:border-primary/30',
                            )}
                        >
                            <div className="flex items-center gap-1.5">
                                <Icon size={14} className={cn(isActive ? 'text-primary' : 'text-ink-faint')} />
                                <span
                                    className={cn(
                                        'text-[13px] font-bold leading-none',
                                        isActive ? 'text-ink' : 'text-ink-muted',
                                    )}
                                >
                                    {o.label}
                                </span>
                            </div>
                            <span className="text-[11px] text-ink-faint leading-snug">{o.description}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ---------- MobilePreview / BrowserPreview (private) ---------- */

function MobilePreview({ title, body }: { title: string; body: string }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2 text-[10.5px] font-bold uppercase tracking-widest text-ink-faint">
                <Smartphone size={11} /> Mobile
            </div>
            <div className="rounded-2xl border border-line bg-surface-sunken p-3">
                <div className="rounded-xl bg-surface-raised p-3 shadow-soft">
                    <div className="flex items-center gap-2 text-[11px] text-ink-faint mb-2">
                        <span className="w-4 h-4 rounded bg-primary text-ink-inverse flex items-center justify-center text-[8px] font-bold">
                            S
                        </span>
                        SHOWE · now
                    </div>
                    <div className="font-semibold text-ink text-[14px] line-clamp-1">
                        {title || 'Notification title'}
                    </div>
                    <p className="text-[13px] text-ink-muted mt-0.5 leading-snug line-clamp-2">
                        {body || 'Your notification body will appear here.'}
                    </p>
                </div>
            </div>
        </div>
    );
}

function BrowserPreview({ title, body }: { title: string; body: string }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2 text-[10.5px] font-bold uppercase tracking-widest text-ink-faint">
                <Globe size={11} /> Browser
            </div>
            <div className="rounded-xl bg-[#202124] text-white p-3 shadow-lg">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-[12px] font-extrabold shrink-0">
                        S
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[11px] text-white/60">showe.app</div>
                        <div className="font-semibold text-[13.5px] mt-0.5 line-clamp-1">
                            {title || 'Notification title'}
                        </div>
                        <p className="text-[12.5px] text-white/75 mt-0.5 leading-snug line-clamp-2">
                            {body || 'Your notification body will appear here.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- ComposeTab ---------- */

export interface ComposeTabProps {
    title: string;
    body: string;
    setTitle: (v: string) => void;
    setBody: (v: string) => void;
    audience: NotificationAudience;
    onAudienceChange: (v: NotificationAudience) => void;
    selectedEvent: EventListItem | null;
    selectedVenue: Venue | null;
    events: EventListItem[];
    venues: Venue[];
    onEventChange: (id: string | null) => void;
    onVenueChange: (id: string | null) => void;
    selectedPerformanceId: string | null;
    selectedPerformance: Performance | null;
    onPerformanceChange: (id: string | null) => void;
    reachFor: (perfId: string) => number;
    performanceLabel: string;
    platform: NotificationPlatform;
    onPlatformChange: (v: NotificationPlatform) => void;
    destinationScreen: string | null;
    destinationParams: DeepLinkParam[];
    onDestinationScreenChange: (screen: string | null) => void;
    onDestinationParamsChange: (params: DeepLinkParam[]) => void;
    reach: number;
    onSendNow: () => void;
    onScheduleClick: () => void;
}

export default function ComposeTab({
    title,
    body,
    setTitle,
    setBody,
    audience,
    onAudienceChange,
    selectedEvent,
    selectedVenue,
    events,
    venues,
    onEventChange,
    onVenueChange,
    selectedPerformanceId,
    selectedPerformance,
    onPerformanceChange,
    reachFor,
    performanceLabel,
    platform,
    onPlatformChange,
    destinationScreen,
    destinationParams,
    onDestinationScreenChange,
    onDestinationParamsChange,
    reach,
    onSendNow,
    onScheduleClick,
}: ComposeTabProps) {
    const isEvent = audience === 'event';
    const showMobile = !isEvent || platform === 'app' || platform === 'both';
    const showBrowser = isEvent && (platform === 'web' || platform === 'both');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-5">

                {/* 1 · Targeting */}
                <Panel title="1 · Targeting" description="Who receives this notification.">
                    <div className="space-y-4">
                        <div>
                            <label className="field-label">Audience</label>
                            <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-sunken rounded-full border border-line">
                                {(
                                    [
                                        { v: 'all' as const, label: 'All programme holders' },
                                        { v: 'event' as const, label: 'A specific event' },
                                        { v: 'venue' as const, label: 'A specific venue' },
                                    ] as const
                                ).map((o) => (
                                    <button
                                        key={o.v}
                                        type="button"
                                        onClick={() => onAudienceChange(o.v)}
                                        className={cn(
                                            'h-9 rounded-full text-[12.5px] font-semibold transition-all',
                                            audience === o.v
                                                ? 'bg-primary text-ink-inverse'
                                                : 'text-ink-muted hover:text-ink',
                                        )}
                                    >
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {audience === 'event' && (
                            <div>
                                <Select
                                    showSearch
                                    allowClear
                                    value={selectedEvent?.id ?? undefined}
                                    onChange={(v) => onEventChange(v ?? null)}
                                    placeholder="Select an event to notify"
                                    className="w-full premium-select"
                                    size="large"
                                    optionFilterProp="label"
                                    options={events.map((e) => ({
                                        value: e.id,
                                        label: `${e.title} · ${e.venue_name}`,
                                    }))}
                                    optionRender={(opt) => {
                                        const e = events.find((x) => x.id === opt.value);
                                        if (!e) return null;
                                        return (
                                            <div className="flex items-center gap-2.5 py-1">
                                                <img
                                                    src={e.cover_image}
                                                    alt=""
                                                    className="w-9 h-9 rounded-lg object-cover bg-surface-sunken shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-ink truncate">{e.title}</div>
                                                    <div className="text-[11.5px] text-ink-faint truncate">
                                                        {e.venue_name} · {e.performances.length}{' '}
                                                        {e.performances.length === 1 ? 'performance' : 'performances'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                {selectedEvent && (
                                    <>
                                        <SelectedTargetCard
                                            icon={Ticket}
                                            image={selectedEvent.cover_image}
                                            title={selectedEvent.title}
                                            meta={`${selectedEvent.venue_name} · ${selectedEvent.category}`}
                                            extra={`${formatNumber(selectedEvent.programme_downloads)} programme holders across ${selectedEvent.performances.length} performances`}
                                            onClear={() => onEventChange(null)}
                                        />
                                        <PerformancePicker
                                            performances={selectedEvent.performances}
                                            value={selectedPerformanceId}
                                            onChange={onPerformanceChange}
                                            reachFor={reachFor}
                                            totalReach={selectedEvent.programme_downloads}
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        {audience === 'venue' && (
                            <div>
                                <Select
                                    showSearch
                                    allowClear
                                    value={selectedVenue?.id ?? undefined}
                                    onChange={(v) => onVenueChange(v ?? null)}
                                    placeholder="Select a venue to notify"
                                    className="w-full premium-select"
                                    size="large"
                                    optionFilterProp="label"
                                    options={venues.map((v) => ({
                                        value: v.id,
                                        label: `${v.name} · ${v.city}`,
                                    }))}
                                    optionRender={(opt) => {
                                        const v = venues.find((x) => x.id === opt.value);
                                        if (!v) return null;
                                        return (
                                            <div className="flex items-center gap-2.5 py-1">
                                                <img
                                                    src={v.cover_image}
                                                    alt=""
                                                    className="w-9 h-9 rounded-lg object-cover bg-surface-sunken shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-ink truncate">{v.name}</div>
                                                    <div className="text-[11.5px] text-ink-faint truncate">
                                                        {v.city} · {v.events_count} events
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                {selectedVenue && (
                                    <SelectedTargetCard
                                        icon={Building2}
                                        image={selectedVenue.cover_image}
                                        title={selectedVenue.name}
                                        meta={`${selectedVenue.city} · ${selectedVenue.events_count} events`}
                                        extra={`${formatNumber(selectedVenue.total_downloads)} programme holders`}
                                        onClear={() => onVenueChange(null)}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </Panel>

                {/* 2 · Message */}
                <Panel title="2 · Message" description="What people see in their notification tray.">
                    <div className="space-y-4">
                        <div>
                            <label className="field-label">Title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Tonight's curtain time"
                                className="input-base"
                                maxLength={48}
                            />
                            <div className="mt-1.5 text-[11px] text-ink-faint">{title.length}/48</div>
                        </div>
                        <div>
                            <label className="field-label">Body</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={4}
                                placeholder="Quick note: tonight's show starts at 19:30 — doors at 19:00."
                                className="input-base !h-auto py-3 leading-relaxed"
                                maxLength={140}
                            />
                            <div className="mt-1.5 text-[11px] text-ink-faint">{body.length}/140</div>
                        </div>
                    </div>
                </Panel>

                {/* 3 · Delivery — event only */}
                {isEvent && (
                    <Panel title="3 · Delivery" description="Where the notification is delivered.">
                        <PillSwitcher<NotificationPlatform>
                            label="Platform"
                            value={platform}
                            onChange={onPlatformChange}
                            options={(['app', 'web', 'both'] as NotificationPlatform[]).map((v) => {
                                const meta = PLATFORM_META[v];
                                const Icon = PLATFORM_ICONS[meta.icon as keyof typeof PLATFORM_ICONS];
                                return { value: v, label: meta.label, description: meta.description, Icon };
                            })}
                        />
                    </Panel>
                )}

                {/* 4 · Destination — event only */}
                {isEvent && (
                    <Panel
                        title="4 · Destination"
                        description="Where users land when they tap. The same route resolves on mobile and web."
                    >
                        <DeepLinkConfig
                            screen={destinationScreen}
                            params={destinationParams}
                            onScreenChange={onDestinationScreenChange}
                            onParamsChange={onDestinationParamsChange}
                        />
                    </Panel>
                )}

                {/* Footer */}
                <Panel padded>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-ink-muted">
                            Reaches{' '}
                            <span className="font-display font-bold text-ink tabular">
                                ~{formatNumber(reach)}
                            </span>{' '}
                            users
                        </span>
                        <div className="flex gap-2">
                            <Button onClick={onScheduleClick}>Schedule for later</Button>
                            <Button type="primary" icon={<Send size={13} />} onClick={onSendNow}>
                                Send now
                            </Button>
                        </div>
                    </div>
                </Panel>
            </div>

            {/* ── Right column — preview ── */}
            <div className="space-y-5">
                <Panel title="Live preview" description="How it looks across platforms">
                    <div className="space-y-4">
                        {showMobile && <MobilePreview title={title} body={body} />}
                        {showBrowser && <BrowserPreview title={title} body={body} />}
                    </div>
                </Panel>

                {isEvent && (
                    <Panel title="Tap behaviour" description="Where the destination resolves on each runtime.">
                        <TapBehaviourPreview
                            platform={platform}
                            destinationScreen={destinationScreen}
                            destinationParams={destinationParams}
                        />
                    </Panel>
                )}

                <Panel padded={false} className="!bg-surface-sunken/40">
                    <div className="p-4">
                        <div className="field-label">Sending to</div>
                        <div className="mt-1.5 text-sm text-ink font-semibold">
                            {audience === 'all' && 'All programme holders'}
                            {audience === 'event' && (selectedEvent?.title ?? 'No event selected yet')}
                            {audience === 'venue' && (selectedVenue?.name ?? 'No venue selected yet')}
                        </div>
                        {audience === 'event' && selectedEvent && (
                            <div className="mt-1 text-[12px] text-ink-muted">
                                {selectedPerformance
                                    ? `Performance: ${performanceLabel}`
                                    : 'All performances'}
                            </div>
                        )}
                        <div className="mt-2 text-[12px] text-ink-faint">
                            Estimated reach: ~{formatNumber(reach)} users
                            {isEvent && ` · ${PLATFORM_META[platform].label}`}
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
}

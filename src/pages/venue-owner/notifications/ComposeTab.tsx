import { BookOpen, Building2, Send, Ticket, Smartphone, Globe } from 'lucide-react';
import { Button, InputNumber, Select, Spin } from 'antd';
import { Panel, StatusBadge } from '@/components/ui';
import { cn, formatNumber } from '@/lib/utils';
import { getImageUrl } from '@/helpers/getImageUrl';
import {
    PLATFORM_META,
    type NotificationAudience,
    type NotificationPlatform,
} from '@/constants/notifications';
import type { EventListItem } from '@/types/event';
import type { Performance } from '@/types/event';
import type { Venue } from '@/types/venue';
import PerformancePicker from './PerformancePicker';
import { type DeepLinkParam } from './DeepLinkConfig';
import TapBehaviourPreview from './TapBehaviourPreview';
import SelectedTargetCard from './SelectedTargetCard';

export interface NotificationProgrammeOption {
    id: string;
    title: string;
    status: string;
    category?: string;
    cover_image?: string;
    pageCount: number;
}

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
    events: EventListItem[];
    onEventChange: (id: string | null) => void;
    selectedPerformanceId: string | null;
    selectedPerformance: Performance | null;
    onPerformanceChange: (id: string | null) => void;
    programmes: NotificationProgrammeOption[];
    selectedProgramme: NotificationProgrammeOption | null;
    onProgrammeChange: (id: string | null) => void;
    programmePage: number;
    onProgrammePageChange: (page: number) => void;
    programmeExtraPath: string;
    venues: Venue[];
    selectedVenue: Venue | null;
    onVenueChange: (id: string | null) => void;
    venueExtraPath: string;
    isBookingCountLoading?: boolean;
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
    isSending?: boolean;
    onDestinationPathIdChange: (params: DeepLinkParam[]) => void;
    destinationPathId: DeepLinkParam[];
}

export default function ComposeTab({
    title,
    body,
    setTitle,
    setBody,
    audience,
    onAudienceChange,
    selectedEvent,
    events,
    onEventChange,
    selectedPerformanceId,
    selectedPerformance,
    onPerformanceChange,
    programmes,
    selectedProgramme,
    onProgrammeChange,
    programmePage,
    onProgrammePageChange,
    programmeExtraPath,
    venues,
    selectedVenue,
    onVenueChange,
    venueExtraPath,
    isBookingCountLoading,
    reachFor,
    performanceLabel,
    platform,
    destinationScreen,
    destinationParams,
    reach,
    onSendNow,
    isSending,
    destinationPathId,
}: ComposeTabProps) {
    const isEvent = audience === 'event';
    const isProgramme = audience === 'programme';
    const isVenue = audience === 'venue';
    const showMobile =
        (!isEvent && !isProgramme && !isVenue) || platform === 'app' || platform === 'both';
    const showBrowser =
        (isEvent || isProgramme || isVenue) && (platform === 'web' || platform === 'both');

    const pageOptions =
        selectedProgramme && selectedProgramme.pageCount > 0
            ? Array.from({ length: selectedProgramme.pageCount }, (_, i) => i + 1)
            : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-5">

                {/* 1 · Targeting */}
                <Panel title="1 · Targeting" description="Who receives this notification.">
                    <div className="space-y-4">
                        <div>
                            <label className="field-label">Audience</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 bg-surface-sunken rounded-2xl border border-line">
                                {(
                                    [
                                        { v: 'all' as const, label: 'All programme holders' },
                                        { v: 'event' as const, label: 'A specific event' },
                                        { v: 'programme' as const, label: 'A specific programme' },
                                        { v: 'venue' as const, label: 'A specific venue' },
                                    ] as const
                                ).map((o) => (
                                    <button
                                        key={o.v}
                                        type="button"
                                        onClick={() => onAudienceChange(o.v)}
                                        className={cn(
                                            'h-9 rounded-full text-[12.5px] font-semibold transition-all px-2',
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
                                                    src={getImageUrl(e.cover_image)}
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
                                            image={getImageUrl(selectedEvent.cover_image)}
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

                        {audience === 'programme' && (
                            <div className="space-y-3">
                                <Select
                                    showSearch
                                    allowClear
                                    value={selectedProgramme?.id ?? undefined}
                                    onChange={(v) => onProgrammeChange(v ?? null)}
                                    placeholder="Select a programme to notify purchasers"
                                    className="w-full premium-select"
                                    size="large"
                                    optionFilterProp="label"
                                    options={programmes.map((p) => ({
                                        value: p.id,
                                        label: `${p.title} · ${p.category ?? 'Uncategorised'}`,
                                    }))}
                                    optionRender={(opt) => {
                                        const p = programmes.find((x) => x.id === opt.value);
                                        if (!p) return null;
                                        return (
                                            <div className="flex items-center gap-2.5 py-1">
                                                {p.cover_image ? (
                                                    <img
                                                        src={getImageUrl(p.cover_image)}
                                                        alt=""
                                                        className="w-9 h-9 rounded-lg object-cover bg-surface-sunken shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-lg bg-surface-sunken shrink-0 flex items-center justify-center text-ink-faint">
                                                        <BookOpen size={14} />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-semibold text-ink truncate">{p.title}</div>
                                                    <div className="text-[11.5px] text-ink-faint truncate">
                                                        {p.category ?? 'Uncategorised'} · {p.status}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />

                                {selectedProgramme && (
                                    <>
                                        <SelectedTargetCard
                                            icon={BookOpen}
                                            image={
                                                selectedProgramme.cover_image
                                                    ? getImageUrl(selectedProgramme.cover_image)
                                                    : ''
                                            }
                                            title={selectedProgramme.title}
                                            meta={`${selectedProgramme.category ?? 'Uncategorised'} · ${selectedProgramme.status}`}
                                            extra={
                                                isBookingCountLoading
                                                    ? 'Loading purchaser count…'
                                                    : `${formatNumber(reach)} purchasers`
                                            }
                                            onClear={() => onProgrammeChange(null)}
                                        />

                                        <div className="rounded-xl border border-line bg-surface-sunken/40 p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <label className="field-label">Programme page</label>
                                                    <p className="text-[12px] text-ink-muted mt-0.5">
                                                        Users land on this page in the programme reader.
                                                    </p>
                                                </div>
                                                <StatusBadge status={selectedProgramme.status} />
                                            </div>

                                            {pageOptions.length > 0 ? (
                                                <Select
                                                    value={programmePage}
                                                    onChange={onProgrammePageChange}
                                                    className="w-full premium-select"
                                                    size="large"
                                                    options={pageOptions.map((page) => ({
                                                        value: page,
                                                        label: `Page ${page}`,
                                                    }))}
                                                />
                                            ) : (
                                                <InputNumber
                                                    min={1}
                                                    value={programmePage}
                                                    onChange={(v) => onProgrammePageChange(Number(v) || 1)}
                                                    className="w-full input-base !h-11 flex items-center"
                                                    placeholder="e.g. 4"
                                                />
                                            )}

                                            <div className="rounded-lg border border-line bg-surface-raised p-3">
                                                <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                                                    Destination path
                                                </div>
                                                <div className="font-mono text-[11.5px] text-ink-muted break-all">
                                                    {programmeExtraPath || 'Select a programme to preview the path'}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {audience === 'venue' && (
                            <div className="space-y-3">
                                <Select
                                    showSearch
                                    allowClear
                                    value={selectedVenue?.id ?? undefined}
                                    onChange={(v) => onVenueChange(v ?? null)}
                                    placeholder="Select a venue to notify favourites"
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
                                                {v.cover_image ? (
                                                    <img
                                                        src={getImageUrl(v.cover_image)}
                                                        alt=""
                                                        className="w-9 h-9 rounded-lg object-cover bg-surface-sunken shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-lg bg-surface-sunken shrink-0 flex items-center justify-center text-ink-faint">
                                                        <Building2 size={14} />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-semibold text-ink truncate">{v.name}</div>
                                                    <div className="text-[11.5px] text-ink-faint truncate">
                                                        {v.city} · {v.status}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />

                                {selectedVenue && (
                                    <>
                                        <SelectedTargetCard
                                            icon={Building2}
                                            image={
                                                selectedVenue.cover_image
                                                    ? getImageUrl(selectedVenue.cover_image)
                                                    : ''
                                            }
                                            title={selectedVenue.name}
                                            meta={`${selectedVenue.address_line1}, ${selectedVenue.city}`}
                                            extra="Users who favourited this venue"
                                            onClear={() => onVenueChange(null)}
                                        />

                                        <div className="rounded-xl border border-line bg-surface-sunken/40 p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <label className="field-label">Venue page</label>
                                                    <p className="text-[12px] text-ink-muted mt-0.5">
                                                        Users land on this venue page when they tap the notification.
                                                    </p>
                                                </div>
                                                <StatusBadge status={selectedVenue.status} />
                                            </div>

                                            <div className="rounded-lg border border-line bg-surface-raised p-3">
                                                <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                                                    Destination path
                                                </div>
                                                <div className="font-mono text-[11.5px] text-ink-muted break-all">
                                                    {venueExtraPath || 'Select a venue to preview the path'}
                                                </div>
                                            </div>
                                        </div>
                                    </>
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

                {/* Footer */}
                <Panel padded>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-ink-muted inline-flex items-center gap-2">
                            Reaches{' '}
                            <span className="font-display font-bold text-ink tabular">
                                {isBookingCountLoading && isProgramme ? (
                                    <Spin size="small" />
                                ) : (
                                    <>~{formatNumber(reach)}</>
                                )}
                            </span>{' '}
                            users
                        </span>
                        <div className="flex gap-2">
                            <Button type="primary" icon={<Send size={13} />} onClick={onSendNow} loading={isSending}>
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
                            destinationPathId={destinationPathId}
                        />
                    </Panel>
                )}

                {isProgramme && selectedProgramme && (
                    <Panel title="Tap behaviour" description="Where purchasers land when they tap.">
                        <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-3 space-y-2">
                            <div className="text-[10.5px] font-bold uppercase tracking-wider text-primary/80">
                                Programme reader
                            </div>
                            <div className="font-mono text-[11px] text-ink-muted bg-surface-raised border border-line rounded-lg p-2 break-all">
                                {programmeExtraPath}
                            </div>
                        </div>
                    </Panel>
                )}

                {isVenue && selectedVenue && (
                    <Panel title="Tap behaviour" description="Where favourites land when they tap.">
                        <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-3 space-y-2">
                            <div className="text-[10.5px] font-bold uppercase tracking-wider text-primary/80">
                                Venue page
                            </div>
                            <div className="font-mono text-[11px] text-ink-muted bg-surface-raised border border-line rounded-lg p-2 break-all">
                                {venueExtraPath}
                            </div>
                        </div>
                    </Panel>
                )}

                <Panel padded={false} className="!bg-surface-sunken/40">
                    <div className="p-4">
                        <div className="field-label">Sending to</div>
                        <div className="mt-1.5 text-sm text-ink font-semibold">
                            {audience === 'all' && 'All programme holders'}
                            {audience === 'event' && (selectedEvent?.title ?? 'No event selected yet')}
                            {audience === 'programme' &&
                                (selectedProgramme?.title ?? 'No programme selected yet')}
                            {audience === 'venue' && (selectedVenue?.name ?? 'No venue selected yet')}
                        </div>
                        {audience === 'event' && selectedEvent && (
                            <div className="mt-1 text-[12px] text-ink-muted">
                                {selectedPerformance
                                    ? `Performance: ${performanceLabel}`
                                    : 'All performances'}
                            </div>
                        )}
                        {audience === 'programme' && selectedProgramme && (
                            <div className="mt-1 text-[12px] text-ink-muted">
                                Programme purchasers · Page {programmePage}
                            </div>
                        )}
                        {audience === 'venue' && selectedVenue && (
                            <div className="mt-1 text-[12px] text-ink-muted">
                                Users who favourited this venue
                            </div>
                        )}
                        <div className="mt-2 text-[12px] text-ink-faint">
                            {audience === 'venue'
                                ? 'Reach: favourites of this venue'
                                : `Estimated reach: ~${formatNumber(reach)} users`}
                            {(isEvent || isProgramme || isVenue) && ` · ${PLATFORM_META[platform].label}`}
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
}

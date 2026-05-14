import { Send, Lock, Users, Calendar as CalIcon, Sparkles, Clock, History } from 'lucide-react';
import { Button, Tabs } from 'antd';
import { toast } from 'sonner';
import { PageHeader, Panel, StatCard } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META } from '@/constants/tiers';
import { formatDateTime } from '@/lib/utils';
import { useScopedVenueData } from '@/hooks/useScopedVenueData';
import {
    DEEP_LINK_SCREENS,
    mockScheduledNotifications,
    mockSentNotifications,
    type NotificationAudience,
    type NotificationPlatform,
} from '@/constants/notifications';
import { useMemo, useState } from 'react';
import ScheduleModal from './ScheduleModal';
import ComposeTab from './ComposeTab';
import NotificationRow from './NotificationRow';
import type { DeepLinkParam } from './DeepLinkConfig';

function reachForPerformance(
    eventTotal: number,
    performances: { id: string }[],
    performanceId: string,
) {
    const idx = performances.findIndex((p) => p.id === performanceId);
    if (idx === -1 || performances.length === 0) return 0;
    const weights = performances.map((_, i) => 1 + ((i * 7) % 5) / 10);
    const total = weights.reduce((a, b) => a + b, 0);
    return Math.round((eventTotal * weights[idx]) / total);
}

function paramId() {
    return `dlp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function NotificationsPage() {
    const tier = useAuthStore((s) => s.user?.tier);
    const unlocked = tier === 'tier_3' || tier === 'tier_3_plus';
    const { events, venues } = useScopedVenueData();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [audience, setAudience] = useState<NotificationAudience>('all');
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [selectedPerformanceId, setSelectedPerformanceId] = useState<string | null>(null);
    const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
    const [platform, setPlatform] = useState<NotificationPlatform>('both');
    const [destinationScreen, setDestinationScreen] = useState<string | null>('/events');
    const [destinationParams, setDestinationParams] = useState<DeepLinkParam[]>([]);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('compose');

    const selectedEvent = useMemo(
        () => events.find((e) => e.id === selectedEventId) ?? null,
        [events, selectedEventId],
    );
    const selectedVenue = useMemo(
        () => venues.find((v) => v.id === selectedVenueId) ?? null,
        [venues, selectedVenueId],
    );
    const selectedPerformance = useMemo(
        () => selectedEvent?.performances.find((p) => p.id === selectedPerformanceId) ?? null,
        [selectedEvent, selectedPerformanceId],
    );
    const reach = useMemo(() => {
        if (audience === 'event' && selectedEvent) {
            if (selectedPerformanceId)
                return reachForPerformance(
                    selectedEvent.programme_downloads,
                    selectedEvent.performances,
                    selectedPerformanceId,
                );
            return selectedEvent.programme_downloads;
        }
        if (audience === 'venue') {
            if (!selectedVenue) return 0;
            return events
                .filter((e) => e.venue_id === selectedVenue.id)
                .reduce((sum, e) => sum + e.programme_downloads, 0);
        }
        return events.reduce((sum, e) => sum + e.programme_downloads, 0);
    }, [audience, selectedEvent, selectedPerformanceId, selectedVenue, events]);

    const performanceLabel = useMemo(() => {
        if (!selectedPerformance) return 'All attendees';
        return `${selectedPerformance.date} · ${selectedPerformance.start_time}`;
    }, [selectedPerformance]);

    const reachFor = useMemo(
        () => (perfId: string) =>
            selectedEvent
                ? reachForPerformance(selectedEvent.programme_downloads, selectedEvent.performances, perfId)
                : 0,
        [selectedEvent],
    );

    /* ── Handlers ── */

    function handleAudienceChange(next: NotificationAudience) {
        setAudience(next);
        if (next !== 'event') { setSelectedEventId(null); setSelectedPerformanceId(null); }
        if (next !== 'venue') setSelectedVenueId(null);
    }

    function handleEventChange(eventId: string | null) {
        setSelectedEventId(eventId);
        setSelectedPerformanceId(null);
        const event = events.find((e) => e.id === eventId) ?? null;
        setDestinationParams((prev) =>
            prev.map((p) => {
                if (p.key === 'event_id') return { ...p, value: eventId ?? '' };
                if (p.key === 'performance_id') return { ...p, value: '' };
                if (p.key === 'programme_id') return { ...p, value: event?.programme_id ?? '' };
                return p;
            }),
        );
    }

    function handlePerformanceChange(perfId: string | null) {
        setSelectedPerformanceId(perfId);
        if (!selectedEvent) return;
        setDestinationParams((prev) => {
            const keys = new Set(prev.map((p) => p.key));
            const additions: DeepLinkParam[] = [];
            if (!keys.has('event_id'))
                additions.push({ id: paramId(), key: 'event_id', value: selectedEvent.id });
            if (perfId && !keys.has('performance_id'))
                additions.push({ id: paramId(), key: 'performance_id', value: perfId });
            if (selectedEvent.programme_id && !keys.has('programme_id'))
                additions.push({ id: paramId(), key: 'programme_id', value: selectedEvent.programme_id });
            const updated = prev.map((p) => {
                if (p.key === 'event_id' && !p.value) return { ...p, value: selectedEvent.id };
                if (p.key === 'performance_id' && !p.value) return { ...p, value: perfId ?? '' };
                if (p.key === 'programme_id' && !p.value && selectedEvent.programme_id)
                    return { ...p, value: selectedEvent.programme_id };
                return p;
            });
            return [...updated, ...additions];
        });
    }

    function handleDestinationScreenChange(screen: string | null) {
        setDestinationScreen(screen);
        if (!screen) return;
        const screenDef = DEEP_LINK_SCREENS.find((s) => s.value === screen);
        const pathParamKey = screenDef?.pathParam;
        if (!pathParamKey) return;
        setDestinationParams((prev) => {
            if (prev.some((p) => p.key === pathParamKey)) return prev;
            return [...prev, { id: paramId(), key: pathParamKey, value: '' }];
        });
    }

    function resetForm() {
        setTitle(''); setBody('');
        setSelectedEventId(null); setSelectedPerformanceId(null); setSelectedVenueId(null);
        setAudience('all');
        setDestinationParams([]); setDestinationScreen('/events');
        setPlatform('both');
    }

    function validateBeforeSend(): boolean {
        if (!title.trim() || !body.trim()) { toast.error('Add a title and body first.'); return false; }
        const targetValid =
            audience === 'all' ||
            (audience === 'event' && !!selectedEventId) ||
            (audience === 'venue' && !!selectedVenueId);
        if (!targetValid) {
            toast.error(audience === 'event' ? 'Select an event to notify.' : 'Select a venue to notify.');
            return false;
        }
        if (audience === 'event' && !destinationScreen) {
            toast.error('Pick a destination screen — every notification needs to land users somewhere.');
            return false;
        }
        return true;
    }

    function buildPayload(extra: Record<string, unknown> = {}) {
        const paramsMap: Record<string, string> = {};
        destinationParams.forEach((p) => { const k = p.key.trim(); if (k) paramsMap[k] = p.value; });
        return {
            title: title.trim(), body: body.trim(), audience, platform,
            destination: { screen: destinationScreen, params: paramsMap },
            reach, ...extra,
        };
    }

    function handleSendNow() {
        if (!validateBeforeSend()) return;
        console.log('Sending Notification:', buildPayload({ sentAt: new Date().toISOString() }));
        toast.success('Notification sent (mock).');
        resetForm();
    }

    function handleScheduleClick() {
        if (!validateBeforeSend()) return;
        setIsScheduleModalOpen(true);
    }

    /* ── Locked state ── */
    if (!unlocked) {
        return (
            <>
                <PageHeader
                    eyebrow="Push notifications"
                    title="Reach your audience"
                    description="Send push notifications to programme holders."
                />
                <Panel padded>
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-accent/15 text-[#8A5C00] flex items-center justify-center shrink-0">
                            <Lock size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="eyebrow mb-2">Tier 3 Amplify</div>
                            <h2 className="font-display font-extrabold text-2xl text-ink">
                                Push notifications are unlocked on Tier 3.
                            </h2>
                            <p className="mt-2 text-ink-muted max-w-xl">
                                Send messages directly to anyone who downloaded one of your programmes. You're currently on{' '}
                                <span className="font-semibold text-ink">
                                    {tier ? TIER_META[tier].label : 'a starter tier'}
                                </span>
                                .
                            </p>
                            <div className="mt-5 flex gap-2">
                                <Button type="primary">Upgrade to Tier 3</Button>
                                <Button>Compare tiers</Button>
                            </div>
                        </div>
                    </div>
                </Panel>
            </>
        );
    }

    /* ── Main render ── */
    return (
        <>
            <PageHeader
                eyebrow="Push notifications"
                title="Reach your audience"
                description="Send targeted, actionable notifications to programme holders across app and web."
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7 stagger">
                <StatCard label="Subscribed users" value="3,420" icon={Users} accent="primary" />
                <StatCard label="Sent this month" value="12" icon={Send} accent="info" />
                <StatCard label="Open rate" value="38%" delta={4.2} icon={Sparkles} accent="amber" />
                <StatCard label="Avg time to read" value="2m 14s" icon={CalIcon} accent="success" />
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="premium-tabs"
                items={[
                    {
                        key: 'compose',
                        label: (
                            <div className="flex items-center gap-2">
                                <Send size={14} />
                                <span>Compose notification</span>
                            </div>
                        ),
                        children: (
                            <ComposeTab
                                title={title} body={body}
                                setTitle={setTitle} setBody={setBody}
                                audience={audience} onAudienceChange={handleAudienceChange}
                                selectedEvent={selectedEvent} selectedVenue={selectedVenue}
                                events={events} venues={venues}
                                onEventChange={handleEventChange} onVenueChange={setSelectedVenueId}
                                selectedPerformanceId={selectedPerformanceId}
                                selectedPerformance={selectedPerformance}
                                onPerformanceChange={handlePerformanceChange}
                                reachFor={reachFor} performanceLabel={performanceLabel}
                                platform={platform} onPlatformChange={setPlatform}
                                destinationScreen={destinationScreen}
                                destinationParams={destinationParams}
                                onDestinationScreenChange={handleDestinationScreenChange}
                                onDestinationParamsChange={setDestinationParams}
                                reach={reach}
                                onSendNow={handleSendNow}
                                onScheduleClick={handleScheduleClick}
                            />
                        ),
                    },
                    {
                        key: 'queue',
                        label: (
                            <div className="flex items-center gap-2">
                                <Clock size={14} />
                                <span>Scheduled queue</span>
                                {mockScheduledNotifications.length > 0 && (
                                    <span className="bg-amber/15 text-amber text-[10px] font-bold rounded-full px-2 h-5 flex items-center">
                                        {mockScheduledNotifications.length}
                                    </span>
                                )}
                            </div>
                        ),
                        children: (
                            <Panel padded={false}>
                                <div className="divide-y divide-line">
                                    {mockScheduledNotifications.map((s) => (
                                        <NotificationRow
                                            key={s.id}
                                            data={s}
                                            mode="scheduled"
                                            whenLabel={`Scheduled · ${formatDateTime(s.scheduledFor)}`}
                                            onEdit={() => {
                                                toast.info('Loaded into composer.');
                                                setTitle(s.title); setBody(s.body);
                                                setPlatform(s.platform);
                                                setDestinationScreen(s.destination.screen);
                                                setDestinationParams(
                                                    Object.entries(s.destination.params).map(([k, v]) => ({
                                                        id: paramId(), key: k, value: v,
                                                    })),
                                                );
                                                setActiveTab('compose');
                                            }}
                                            onDelete={() => toast.success('Scheduled notification deleted.')}
                                        />
                                    ))}
                                </div>
                            </Panel>
                        ),
                    },
                    {
                        key: 'history',
                        label: (
                            <div className="flex items-center gap-2">
                                <History size={14} />
                                <span>Sent history</span>
                            </div>
                        ),
                        children: (
                            <Panel padded={false}>
                                <div className="divide-y divide-line">
                                    {mockSentNotifications.map((s) => (
                                        <NotificationRow
                                            key={s.id}
                                            data={s}
                                            mode="sent"
                                            whenLabel={formatDateTime(s.sentAt)}
                                            openRate={s.openRate}
                                            clickRate={s.clickRate}
                                        />
                                    ))}
                                </div>
                            </Panel>
                        ),
                    },
                ]}
            />

            <ScheduleModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                onSchedule={(date) => {
                    console.log('Scheduling:', buildPayload({ scheduledFor: date.toISOString() }));
                    resetForm();
                }}
                title={title} body={body}
                platform={platform}
                destinationScreen={destinationScreen}
            />
        </>
    );
}

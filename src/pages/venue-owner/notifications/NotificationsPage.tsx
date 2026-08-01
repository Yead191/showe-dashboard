import { Lock } from 'lucide-react';
import { Button, Spin } from 'antd';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { PageHeader, Panel } from '@/components/ui';
import {
    DEEP_LINK_SCREENS,
    type NotificationAudience,
    type NotificationPlatform,
} from '@/constants/notifications';
import { useMemo, useState } from 'react';
import ComposeTab from './ComposeTab';
import type { DeepLinkParam } from './DeepLinkConfig';
import { useSendPushNotificationMutation, type SendPushNotificationPayload } from '@/store/api/notificationApi';
import {
    mapApiEventToEventListItem,
    useGetOrganizationEventsQuery,
} from '@/store/api/organizationApi/eventApi';
import type { EventListItem } from '@/types/event';
import { useGetProfileQuery } from '@/store/api/authApi';
import { isModuleUnlocked } from '@/constants/module-blocks';

const PUSH_NOTIFICATIONS_MODULE = 9;

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
    const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery();
    const unlockedModules = profile?.subscription?.modules;
    const unlocked = isModuleUnlocked(PUSH_NOTIFICATIONS_MODULE, unlockedModules);

    const { data: eventsData } = useGetOrganizationEventsQuery(
        { page: 1, limit: 100 },
        { skip: !unlocked },
    );
    const events: EventListItem[] = useMemo(
        () => (eventsData?.events ?? []).map(mapApiEventToEventListItem),
        [eventsData?.events],
    );

    const [sendPushNotification, { isLoading: isSending }] = useSendPushNotificationMutation();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [audience, setAudience] = useState<NotificationAudience>('all');
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [selectedPerformanceId, setSelectedPerformanceId] = useState<string | null>(null);
    const [platform, setPlatform] = useState<NotificationPlatform>('both');
    const [destinationScreen, setDestinationScreen] = useState<string | null>('/events');
    const [destinationParams, setDestinationParams] = useState<DeepLinkParam[]>([]);
    const [destinationPathId, setDestinationPathId] = useState<DeepLinkParam[]>([]);

    const selectedEvent = useMemo(
        () => events.find((e) => e.id === selectedEventId) ?? null,
        [events, selectedEventId],
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
        return events.reduce((sum, e) => sum + e.programme_downloads, 0);
    }, [audience, selectedEvent, selectedPerformanceId, events]);

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
        if (next !== 'event') {
            setSelectedEventId(null);
            setSelectedPerformanceId(null);
            setDestinationPathId([]);
        }
    }

    function handleEventChange(eventId: string | null) {
        setSelectedEventId(eventId);
        setSelectedPerformanceId(null);
        if (eventId) {
            setDestinationScreen('/events');
            setDestinationPathId([
                { id: 'event_id_param', key: 'event_id', value: eventId }
            ]);
        } else {
            setDestinationPathId([]);
        }
    }

    function handlePerformanceChange(perfId: string | null) {
        setSelectedPerformanceId(perfId);
    }

    function handleDestinationScreenChange(screen: string | null) {
        setDestinationScreen(screen);
        if (!screen) return;
        const screenDef = DEEP_LINK_SCREENS.find((s) => s.value === screen);
        const pathParamKey = screenDef?.pathParam;
        if (!pathParamKey) return;
        setDestinationPathId((prev) => {
            if (prev.some((p) => p.key === pathParamKey)) return prev;
            return [...prev, { id: paramId(), key: pathParamKey, value: '' }];
        });
    }

    function resetForm() {
        setTitle(''); setBody('');
        setSelectedEventId(null); setSelectedPerformanceId(null);
        setAudience('all');
        setDestinationParams([]); setDestinationScreen('/events');
        setDestinationPathId([]);
        setPlatform('both');
    }

    function validateBeforeSend(): boolean {
        if (!title.trim() || !body.trim()) { toast.error('Add a title and body first.'); return false; }
        const targetValid =
            audience === 'all' ||
            (audience === 'event' && !!selectedEventId);
        if (!targetValid) {
            toast.error('Select an event to notify.');
            return false;
        }
        if (audience === 'event' && !destinationScreen) {
            toast.error('Pick a destination screen — every notification needs to land users somewhere.');
            return false;
        }
        return true;
    }

    function buildPayload(): SendPushNotificationPayload {
        const webOrigin = 'https://showe-web.vercel.app';
        let target = 'all_proggame_holders';
        let event = '';
        let performance = '';
        let filePath = 'general';

        if (audience === 'event' && selectedEventId) {
            event = selectedEventId;
            filePath = `${webOrigin}/events/${selectedEventId}`;
            if (selectedPerformanceId) {
                target = 'specific_performance';
                performance = selectedPerformanceId;
            } else {
                target = 'specific_event';
            }
        }

        return {
            target,
            event,
            performance,
            title: title.trim(),
            message: body.trim(),
            filePath,
        };
    }

    async function handleSendNow() {
        if (!validateBeforeSend()) return;
        const payload = buildPayload();

        try {
            const res = await sendPushNotification(payload).unwrap();
            if (res.success) {
                toast.success(res.message || 'Notification sent successfully.');
                resetForm();
            } else {
                toast.error(res.message || 'Failed to send notification.');
            }
        } catch (error: any) {
            toast.error(error?.data?.message || 'An error occurred while sending the notification.');
        }
    }

    if (isProfileLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Spin size="large" />
            </div>
        );
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
                            <div className="eyebrow mb-2">Module 9</div>
                            <h2 className="font-display font-extrabold text-2xl text-ink">
                                Push notifications require Module 9
                            </h2>
                            <p className="mt-2 text-ink-muted max-w-xl">
                                This page is only available for organisations with Module 9 unlocked in their
                                subscription.
                                {profile?.subscription?.name ? (
                                    <>
                                        {' '}
                                        You're currently on{' '}
                                        <span className="font-semibold text-ink">
                                            {profile.subscription.name}
                                        </span>
                                        .
                                    </>
                                ) : null}
                            </p>
                            <div className="mt-5 flex gap-2">
                                <Link to="/owner/subscription">
                                    <Button type="primary">View subscription</Button>
                                </Link>
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



            <ComposeTab
                title={title} body={body}
                setTitle={setTitle} setBody={setBody}
                audience={audience} onAudienceChange={handleAudienceChange}
                selectedEvent={selectedEvent}
                events={events}
                onEventChange={handleEventChange}
                selectedPerformanceId={selectedPerformanceId}
                selectedPerformance={selectedPerformance}
                onPerformanceChange={handlePerformanceChange}
                reachFor={reachFor} performanceLabel={performanceLabel}
                platform={platform} onPlatformChange={setPlatform}
                destinationScreen={destinationScreen}
                destinationParams={destinationParams}
                onDestinationScreenChange={handleDestinationScreenChange}
                onDestinationParamsChange={setDestinationParams}
                destinationPathId={destinationPathId}
                onDestinationPathIdChange={setDestinationPathId}
                reach={reach}
                onSendNow={handleSendNow}
                isSending={isSending}
            />
        </>
    );
}

/**
 * Push-notification domain constants and mock data.
 *
 * Architecture note: notifications always deep-link into a product route.
 * The same route (e.g. `/poll`) resolves to a native screen on mobile and
 * a page on web — no third-party URLs. Keep the screen registry curated.
 */

export type NotificationPlatform = 'app' | 'web' | 'both';
export type NotificationAudience = 'all' | 'event' | 'programme' | 'venue';

export interface DeepLinkScreen {
    /** Base path, e.g. '/events'. Never rename after launch. */
    value: string;
    label: string;
    description: string;
    /**
     * When set, this param's value is embedded directly in the URL path:
     *   /events/:event_id  →  /events/1
     * All other params become query string entries.
     */
    pathParam?: string;
    /** Query-param keys typically needed for this screen (excludes pathParam). */
    suggestedParams: string[];
    /** Lucide icon name from DEEP_LINK_ICONS. */
    icon: string;
}

export const DEEP_LINK_SCREENS: DeepLinkScreen[] = [
    {
        value: '/events',
        label: 'Event details',
        description: 'Land on the event page (description, lineup, tickets).',
        pathParam: 'event_id',
        suggestedParams: [],
        icon: 'Calendar',
    },
    {
        value: '/programmes',
        label: 'Programme',
        description: 'Open a digital programme directly. Use the page param to deep-link to a specific page.',
        pathParam: 'programme_id',
        suggestedParams: ['page'],
        icon: 'BookOpen',
    },
    // {
    //     value: '/poll',
    //     label: 'Poll',
    //     description: 'Let users vote on a question directly from the notification.',
    //     suggestedParams: ['poll_id'],
    //     icon: 'BarChart2',
    // },
    // {
    //     value: '/review',
    //     label: 'Review event',
    //     description: 'Open the post-event rating + review flow.',
    //     suggestedParams: ['event_id', 'performance_id'],
    //     icon: 'Star',
    // },
    // {
    //     value: '/event-feedback',
    //     label: 'Event feedback',
    //     description: 'Send users to a structured feedback form for a performance.',
    //     suggestedParams: ['event_id', 'performance_id'],
    //     icon: 'MessageSquare',
    // },
    // {
    //     value: '/survey',
    //     label: 'Survey',
    //     description: 'Open a custom survey by ID.',
    //     suggestedParams: ['survey_id'],
    //     icon: 'ClipboardList',
    // },
    // {
    //     value: '/attendance',
    //     label: 'Confirm attendance',
    //     description: "Ask users to confirm they're coming to a performance.",
    //     suggestedParams: ['event_id', 'performance_id'],
    //     icon: 'CheckSquare',
    // },
];

export const PLATFORM_META: Record<NotificationPlatform, { label: string; description: string; icon: string }> = {
    app: { label: 'Mobile app', description: 'iOS + Android push only', icon: 'Smartphone' },
    web: { label: 'Web', description: 'Browser push notifications only', icon: 'Globe' },
    both: { label: 'App + Web', description: 'Maximum reach', icon: 'Layers' },
};

/* ----------------------- Mock notifications ----------------------- */

export interface NotificationSummary {
    id: string;
    title: string;
    body: string;
    platform: NotificationPlatform;
    /** Where the user lands on tap. Required — every notification is actionable. */
    destination: {
        screen: string;
        params: Record<string, string>;
    };
    target: {
        scope: NotificationAudience;
        eventTitle?: string;
        performanceLabel?: string;
        venueName?: string;
    };
    reach: number;
}

export interface ScheduledNotification extends NotificationSummary {
    scheduledFor: string; // ISO
}

export interface SentNotification extends NotificationSummary {
    sentAt: string;
    openRate: number; // 0–1
    clickRate: number; // 0–1
}

export const mockScheduledNotifications: ScheduledNotification[] = [
    {
        id: 'sched_001',
        title: 'Tonight: doors at 19:00',
        body: 'Hamlet — Royal Crescent Theatre. Pre-order interval drinks from inside the app.',
        platform: 'both',
        destination: {
            screen: '/events',
            params: { event_id: 'evt_001', performance_id: 'p1' },
        },
        target: {
            scope: 'event',
            eventTitle: 'Summer Vibes Music Festival, 2025',
            performanceLabel: 'Mon 12 May · 19:30',
        },
        reach: 1240,
        scheduledFor: '2026-05-12T17:30:00Z',
    },
    {
        id: 'sched_002',
        title: 'How was the matinee?',
        body: 'Two minutes to rate the show and unlock 10% off your next ticket.',
        platform: 'app',
        destination: {
            screen: '/review',
            params: { event_id: 'evt_001', performance_id: 'p2' },
        },
        target: {
            scope: 'event',
            eventTitle: 'Summer Vibes Music Festival, 2025',
            performanceLabel: 'Tue 13 May · 14:30 (matinee)',
        },
        reach: 380,
        scheduledFor: '2026-05-13T17:30:00Z',
    },
    {
        id: 'sched_003',
        title: 'New Voices kicks off Wednesday',
        body: 'Six new plays, three nights. Reserve your slot for opening night.',
        platform: 'web',
        destination: {
            screen: '/events',
            params: { event_id: 'evt_003' },
        },
        target: {
            scope: 'venue',
            venueName: 'Lantern Studio',
        },
        reach: 1880,
        scheduledFor: '2026-05-19T10:00:00Z',
    },
];

export const mockSentNotifications: SentNotification[] = [
    {
        id: 'sent_001',
        title: 'Opening night',
        body: 'Break a leg everyone — show starts at 19:30.',
        platform: 'both',
        destination: {
            screen: '/events',
            params: { event_id: 'evt_001' },
        },
        target: {
            scope: 'event',
            eventTitle: 'Summer Vibes Music Festival, 2025',
            performanceLabel: 'All attendees',
        },
        reach: 3420,
        sentAt: '2026-05-10T18:00:00Z',
        openRate: 0.42,
        clickRate: 0.18,
    },
    {
        id: 'sent_002',
        title: 'Tell us what you thought',
        body: '90 seconds to leave a review on last night\'s performance.',
        platform: 'app',
        destination: {
            screen: '/review',
            params: { event_id: 'evt_001', performance_id: 'p2' },
        },
        target: {
            scope: 'event',
            eventTitle: 'Summer Vibes Music Festival, 2025',
            performanceLabel: 'Mon 5 May · 19:30',
        },
        reach: 2840,
        sentAt: '2026-05-05T22:15:00Z',
        openRate: 0.29,
        clickRate: 0.21,
    },
    {
        id: 'sent_003',
        title: 'Programme drop — tonight only',
        body: 'Limited edition programmes available now — open the app to grab yours.',
        platform: 'app',
        destination: {
            screen: '/programmes',
            params: { programme_id: 'prg_001' },
        },
        target: {
            scope: 'all',
        },
        reach: 3100,
        sentAt: '2026-05-08T13:00:00Z',
        openRate: 0.35,
        clickRate: 0.09,
    },
];

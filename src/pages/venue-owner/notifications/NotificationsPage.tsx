import {
  Send,
  Lock,
  Users,
  Calendar as CalIcon,
  Sparkles,
  Clock,
  History,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Building2,
  Ticket,
  X,
  Smartphone,
  Globe,
  Layers,
  ExternalLink,
  MousePointerClick,
  GitBranch,
  ArrowUpRight,
} from 'lucide-react';
import { Button, Tabs, Dropdown, Select } from 'antd';
import { toast } from 'sonner';
import { PageHeader, Panel, StatCard } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META } from '@/constants/tiers';
import { cn, formatNumber, formatDateShort, formatDateTime } from '@/lib/utils';
import { useScopedVenueData } from '@/hooks/useScopedVenueData';
import {
  ACTION_META,
  PLATFORM_META,
  DEEP_LINK_SCREENS,
  mockScheduledNotifications,
  mockSentNotifications,
  type NotificationActionType,
  type NotificationAudience,
  type NotificationPlatform,
} from '@/constants/notifications';
import ScheduleModal from './ScheduleModal';
import PerformancePicker from './PerformancePicker';
import DeepLinkConfig, { type DeepLinkParam } from './DeepLinkConfig';
import { useMemo, useState } from 'react';

const PLATFORM_ICONS = { Smartphone, Globe, Layers } as const;
const ACTION_ICONS = { ExternalLink, MousePointerClick, GitBranch } as const;

/**
 * Deterministic mock reach for a performance. We don't have per-performance
 * booking data, so we derive a stable split from the performance id+index.
 */
function reachForPerformance(eventTotal: number, performances: { id: string }[], performanceId: string) {
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
  const [actionType, setActionType] = useState<NotificationActionType>('in_app');
  const [externalUrl, setExternalUrl] = useState('');
  const [deepLinkScreen, setDeepLinkScreen] = useState<string | null>('/event');
  const [deepLinkParams, setDeepLinkParams] = useState<DeepLinkParam[]>([]);

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
      if (selectedPerformanceId) {
        return reachForPerformance(
          selectedEvent.programme_downloads,
          selectedEvent.performances,
          selectedPerformanceId,
        );
      }
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
    return `${formatDateShort(selectedPerformance.date)} · ${selectedPerformance.start_time}`;
  }, [selectedPerformance]);

  /**
   * When user picks a performance, pre-fill the deep-link params that are
   * useful (event_id, performance_id). Only fills empty slots — won't clobber.
   */
  function handlePerformanceChange(perfId: string | null) {
    setSelectedPerformanceId(perfId);
    if (!selectedEvent) return;

    setDeepLinkParams((prev) => {
      const keys = new Set(prev.map((p) => p.key));
      const additions: DeepLinkParam[] = [];
      if (!keys.has('event_id')) {
        additions.push({ id: paramId(), key: 'event_id', value: selectedEvent.id });
      }
      if (perfId && !keys.has('performance_id')) {
        additions.push({ id: paramId(), key: 'performance_id', value: perfId });
      }
      const updated = prev.map((p) => {
        if (p.key === 'event_id' && !p.value) return { ...p, value: selectedEvent.id };
        if (p.key === 'performance_id' && !p.value) return { ...p, value: perfId ?? '' };
        return p;
      });
      return [...updated, ...additions];
    });
  }

  function handleEventChange(eventId: string | null) {
    setSelectedEventId(eventId);
    setSelectedPerformanceId(null);
    // Reset event_id and performance_id params to match the new event
    setDeepLinkParams((prev) =>
      prev.map((p) => {
        if (p.key === 'event_id') return { ...p, value: eventId ?? '' };
        if (p.key === 'performance_id') return { ...p, value: '' };
        return p;
      }),
    );
  }

  const targetValid =
    audience === 'all' ||
    (audience === 'event' && !!selectedEventId) ||
    (audience === 'venue' && !!selectedVenueId);

  const actionValid = (() => {
    if (actionType === 'general') return !!externalUrl.trim();
    if (actionType === 'in_app') return !!deepLinkScreen;
    if (actionType === 'both') return !!externalUrl.trim() && !!deepLinkScreen;
    return true;
  })();

  function buildPayload(extra: Record<string, unknown> = {}) {
    const paramsMap: Record<string, string> = {};
    deepLinkParams.forEach((p) => {
      const k = p.key.trim();
      if (k) paramsMap[k] = p.value;
    });
    return {
      title: title.trim(),
      body: body.trim(),
      audience,
      target:
        audience === 'event'
          ? {
            type: 'event' as const,
            event_id: selectedEvent?.id ?? null,
            event_title: selectedEvent?.title ?? null,
            performance_id: selectedPerformanceId,
            performance_label: performanceLabel,
            venue_id: selectedEvent?.venue_id ?? null,
            venue_name: selectedEvent?.venue_name ?? null,
          }
          : audience === 'venue'
            ? {
              type: 'venue' as const,
              id: selectedVenue?.id ?? null,
              name: selectedVenue?.name ?? null,
              city: selectedVenue?.city ?? null,
            }
            : { type: 'all' as const },
      platform,
      action: {
        type: actionType,
        ...(actionType !== 'in_app' ? { external_url: externalUrl.trim() } : {}),
        ...(actionType !== 'general'
          ? { deep_link: { screen: deepLinkScreen, params: paramsMap } }
          : {}),
      },
      reach,
      ...extra,
    };
  }

  function resetForm() {
    setTitle('');
    setBody('');
    setSelectedEventId(null);
    setSelectedPerformanceId(null);
    setSelectedVenueId(null);
    setAudience('all');
    setExternalUrl('');
    setDeepLinkParams([]);
    setActionType('in_app');
    setDeepLinkScreen('/event');
    setPlatform('both');
  }

  function validateBeforeSend(): boolean {
    if (!title.trim() || !body.trim()) {
      toast.error('Add a title and body first.');
      return false;
    }
    if (!targetValid) {
      toast.error(
        audience === 'event'
          ? 'Select an event to notify.'
          : 'Select a venue to notify.',
      );
      return false;
    }
    if (!actionValid) {
      toast.error(
        actionType === 'general'
          ? 'Add an external URL.'
          : actionType === 'in_app'
            ? 'Pick a target screen for the in-app action.'
            : 'Pick a target screen and add a fallback URL.',
      );
      return false;
    }
    return true;
  }

  function handleSendNow() {
    if (!validateBeforeSend()) return;
    const payload = buildPayload({ sentAt: new Date().toISOString() });
    console.log('Sending Notification:', payload);
    toast.success('Notification sent (mock).');
    resetForm();
  }

  function handleScheduleClick() {
    if (!validateBeforeSend()) return;
    setIsScheduleModalOpen(true);
  }

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
                Send messages directly to anyone who downloaded one of your programmes — perfect for last-minute changes,
                pre-show reminders, or post-show thanks. You're currently on{' '}
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                  {/* Targeting */}
                  <Panel title="1 · Targeting" description="Who receives this notification.">
                    <div className="space-y-4">
                      <div>
                        <label className="field-label">Audience</label>
                        <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-sunken rounded-full border border-line">
                          {[
                            { v: 'all' as const, label: 'All programme holders' },
                            { v: 'event' as const, label: 'A specific event' },
                            { v: 'venue' as const, label: 'A specific venue' },
                          ].map((o) => (
                            <button
                              key={o.v}
                              type="button"
                              onClick={() => {
                                setAudience(o.v);
                                if (o.v !== 'event') {
                                  setSelectedEventId(null);
                                  setSelectedPerformanceId(null);
                                }
                                if (o.v !== 'venue') setSelectedVenueId(null);
                              }}
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
                            value={selectedEventId ?? undefined}
                            onChange={(v) => handleEventChange(v ?? null)}
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
                              const next = e.performances[0];
                              return (
                                <div className="flex items-center gap-2.5 py-1">
                                  <img
                                    src={e.cover_image}
                                    alt=""
                                    className="w-9 h-9 rounded-lg object-cover bg-surface-sunken shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-semibold text-ink truncate">
                                      {e.title}
                                    </div>
                                    <div className="text-[11.5px] text-ink-faint truncate">
                                      {e.venue_name}
                                      {next && (
                                        <> · {e.performances.length} {e.performances.length === 1 ? 'performance' : 'performances'}</>
                                      )}
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
                                onClear={() => {
                                  setSelectedEventId(null);
                                  setSelectedPerformanceId(null);
                                }}
                              />
                              <PerformancePicker
                                performances={selectedEvent.performances}
                                value={selectedPerformanceId}
                                onChange={handlePerformanceChange}
                                reachFor={(id) =>
                                  reachForPerformance(
                                    selectedEvent.programme_downloads,
                                    selectedEvent.performances,
                                    id,
                                  )
                                }
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
                            value={selectedVenueId ?? undefined}
                            onChange={(v) => setSelectedVenueId(v ?? null)}
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
                              onClear={() => setSelectedVenueId(null)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </Panel>

                  {/* Message */}
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

                  {/* Delivery + Action */}
                  <Panel title="3 · Delivery & action" description="Where it goes and what happens on tap.">
                    <div className="space-y-5">
                      <PillSwitcher<NotificationPlatform>
                        label="Platform"
                        value={platform}
                        onChange={setPlatform}
                        options={(['app', 'web', 'both'] as NotificationPlatform[]).map((v) => {
                          const meta = PLATFORM_META[v];
                          const Icon = PLATFORM_ICONS[meta.icon as keyof typeof PLATFORM_ICONS];
                          return {
                            value: v,
                            label: meta.label,
                            description: meta.description,
                            Icon,
                          };
                        })}
                      />

                      <PillSwitcher<NotificationActionType>
                        label="Action on tap"
                        value={actionType}
                        onChange={setActionType}
                        options={(['in_app', 'general', 'both'] as NotificationActionType[]).map((v) => {
                          const meta = ACTION_META[v];
                          const Icon = ACTION_ICONS[meta.icon as keyof typeof ACTION_ICONS];
                          return {
                            value: v,
                            label: meta.label,
                            description: meta.description,
                            Icon,
                          };
                        })}
                      />

                      {actionType !== 'in_app' && (
                        <div>
                          <label className="field-label flex items-center gap-1.5">
                            <ExternalLink size={12} />
                            External URL
                            {actionType === 'both' && (
                              <span className="text-[10.5px] font-normal text-ink-faint">(fallback for web/desktop)</span>
                            )}
                          </label>
                          <input
                            value={externalUrl}
                            onChange={(e) => setExternalUrl(e.target.value)}
                            placeholder="https://yourvenue.com/event"
                            className="input-base"
                            type="url"
                          />
                        </div>
                      )}

                      {actionType !== 'general' && (
                        <DeepLinkConfig
                          screen={deepLinkScreen}
                          params={deepLinkParams}
                          onScreenChange={setDeepLinkScreen}
                          onParamsChange={setDeepLinkParams}
                        />
                      )}
                    </div>
                  </Panel>

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
                        <Button onClick={handleScheduleClick}>Schedule for later</Button>
                        <Button
                          type="primary"
                          icon={<Send size={13} />}
                          onClick={handleSendNow}
                        >
                          Send now
                        </Button>
                      </div>
                    </div>
                  </Panel>
                </div>

                {/* Live preview */}
                <div className="space-y-5">
                  <Panel title="Live preview" description="How it looks across platforms">
                    {(platform === 'app' || platform === 'both') && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2 text-[10.5px] font-bold uppercase tracking-widest text-ink-faint">
                          <Smartphone size={11} />
                          Mobile
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
                    )}

                    {(platform === 'web' || platform === 'both') && (
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-[10.5px] font-bold uppercase tracking-widest text-ink-faint">
                          <Globe size={11} />
                          Browser
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
                    )}
                  </Panel>

                  <Panel title="Tap behaviour" description="What happens when a user opens it.">
                    <TapBehaviourPreview
                      actionType={actionType}
                      externalUrl={externalUrl}
                      deepLinkScreen={deepLinkScreen}
                      deepLinkParams={deepLinkParams}
                    />
                  </Panel>

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
                        Estimated reach: ~{formatNumber(reach)} users · {PLATFORM_META[platform].label}
                      </div>
                    </div>
                  </Panel>
                </div>
              </div>
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
                        setTitle(s.title);
                        setBody(s.body);
                        setPlatform(s.platform);
                        setActionType(s.actionType);
                        if (s.externalUrl) setExternalUrl(s.externalUrl);
                        if (s.deepLinkScreen) setDeepLinkScreen(s.deepLinkScreen);
                        if (s.deepLinkParams) {
                          setDeepLinkParams(
                            Object.entries(s.deepLinkParams).map(([k, v]) => ({
                              id: paramId(),
                              key: k,
                              value: v,
                            })),
                          );
                        }
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
          const payload = buildPayload({ scheduledFor: date.toISOString() });
          console.log('Scheduling Notification:', payload);
          resetForm();
        }}
        title={title}
        body={body}
        platform={platform}
        actionType={actionType}
      />
    </>
  );
}

/* ---------- Helper components (file-private) ---------- */

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
                'group flex flex-col items-start text-left gap-1 p-3 rounded-xl border transition-all',
                isActive
                  ? 'border-primary bg-primary/[0.04] shadow-soft'
                  : 'border-line bg-surface-raised hover:border-primary/30',
              )}
            >
              <div className="flex items-center gap-1.5">
                <Icon size={14} className={cn(isActive ? 'text-primary' : 'text-ink-faint')} />
                <span className={cn('text-[13px] font-bold leading-none', isActive ? 'text-ink' : 'text-ink-muted')}>
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

function TapBehaviourPreview({
  actionType,
  externalUrl,
  deepLinkScreen,
  deepLinkParams,
}: {
  actionType: NotificationActionType;
  externalUrl: string;
  deepLinkScreen: string | null;
  deepLinkParams: DeepLinkParam[];
}) {
  const screen = DEEP_LINK_SCREENS.find((s) => s.value === deepLinkScreen);
  const validParams = deepLinkParams.filter((p) => p.key.trim() !== '');

  return (
    <div className="space-y-3">
      {(actionType === 'in_app' || actionType === 'both') && (
        <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <MousePointerClick size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-primary/80">
                In-app deep link
              </div>
              <div className="font-semibold text-ink text-[13px] leading-tight truncate">
                {screen?.label ?? 'No screen selected'}
              </div>
            </div>
          </div>
          {screen && (
            <div className="font-mono text-[11px] text-ink-muted bg-surface-raised border border-line rounded-lg p-2 break-all">
              {screen.value}
              {validParams.length > 0 &&
                `?${validParams.map((p) => `${p.key}=${p.value || '…'}`).join('&')}`}
            </div>
          )}
        </div>
      )}

      {(actionType === 'general' || actionType === 'both') && (
        <div className="rounded-xl border border-line bg-surface-sunken/60 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber/15 text-amber flex items-center justify-center">
              <ExternalLink size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-faint">
                {actionType === 'both' ? 'Fallback URL' : 'External URL'}
              </div>
              <div className="font-mono text-[11.5px] text-ink-muted truncate">
                {externalUrl || 'No URL yet'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

function ActionChip({ actionType }: { actionType: NotificationActionType }) {
  const meta = ACTION_META[actionType];
  const Icon = ACTION_ICONS[meta.icon as keyof typeof ACTION_ICONS];
  const tone = {
    in_app: 'bg-primary/10 text-primary border-primary/20',
    general: 'bg-amber/10 text-amber border-amber/20',
    both: 'bg-info/10 text-info border-info/20',
  }[actionType];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 h-5 rounded-full text-[10px] font-bold border',
        tone,
      )}
    >
      <Icon size={9} />
      {meta.label}
    </span>
  );
}

interface NotificationRowProps {
  data: {
    title: string;
    body: string;
    platform: NotificationPlatform;
    actionType: NotificationActionType;
    deepLinkScreen?: string;
    target: {
      scope: NotificationAudience;
      eventTitle?: string;
      performanceLabel?: string;
      venueName?: string;
    };
    reach: number;
  };
  mode: 'scheduled' | 'sent';
  whenLabel: string;
  openRate?: number;
  clickRate?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

function NotificationRow({
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
    const perf = data.target.performanceLabel ?? 'All attendees';
    return `${data.target.eventTitle} · ${perf}`;
  })();

  const Icon = mode === 'scheduled' ? Clock : CheckCircle2;
  const iconColor =
    mode === 'scheduled'
      ? 'bg-amber/10 text-amber'
      : 'bg-success/10 text-success';

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
            <Ticket size={11} className="shrink-0" /> <span className="truncate">{audienceLine}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <PlatformChips platform={data.platform} />
          <ActionChip actionType={data.actionType} />
          {data.deepLinkScreen && (
            <span className="inline-flex items-center gap-1 px-2 h-5 rounded-full bg-surface-sunken border border-line font-mono text-[10px] text-ink-muted">
              {data.deepLinkScreen}
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

interface SelectedTargetCardProps {
  icon: typeof Ticket;
  image: string;
  title: string;
  meta: string;
  extra: string;
  onClear: () => void;
}

function SelectedTargetCard({
  icon: Icon,
  image,
  title,
  meta,
  extra,
  onClear,
}: SelectedTargetCardProps) {
  return (
    <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-line bg-surface-sunken/60">
      <img
        src={image}
        alt=""
        className="w-12 h-12 rounded-lg object-cover bg-surface-sunken shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Icon size={12} className="text-primary" />
          <span className="font-semibold text-ink truncate">{title}</span>
        </div>
        <div className="text-[12px] text-ink-faint truncate">{meta}</div>
        <div className="text-[11.5px] text-primary font-semibold mt-0.5">{extra}</div>
      </div>
      <Button
        type="text"
        size="small"
        icon={<X size={14} />}
        onClick={onClear}
        aria-label="Clear selection"
      />
    </div>
  );
}

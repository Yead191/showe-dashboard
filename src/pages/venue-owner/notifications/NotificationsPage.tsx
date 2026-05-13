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
} from 'lucide-react';
import { Button, Tabs, Dropdown, Select } from 'antd';
import { toast } from 'sonner';
import { PageHeader, Panel, StatCard } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META } from '@/constants/tiers';
import { cn, formatNumber, formatDateShort } from '@/lib/utils';
import { useScopedVenueData } from '@/hooks/useScopedVenueData';
import ScheduleModal from './ScheduleModal';
import { useMemo, useState } from 'react';

type Audience = 'all' | 'event' | 'venue';

export default function NotificationsPage() {
  const tier = useAuthStore((s) => s.user?.tier);
  const unlocked = tier === 'tier_3' || tier === 'tier_3_plus';
  const { events, venues } = useScopedVenueData();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<Audience>('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
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

  const reach = useMemo(() => {
    if (audience === 'event') return selectedEvent?.programme_downloads ?? 0;
    if (audience === 'venue') {
      if (!selectedVenue) return 0;
      return events
        .filter((e) => e.venue_id === selectedVenue.id)
        .reduce((sum, e) => sum + e.programme_downloads, 0);
    }
    return events.reduce((sum, e) => sum + e.programme_downloads, 0);
  }, [audience, selectedEvent, selectedVenue, events]);

  const targetValid =
    audience === 'all' ||
    (audience === 'event' && !!selectedEventId) ||
    (audience === 'venue' && !!selectedVenueId);

  function buildPayload(extra: Record<string, unknown> = {}) {
    return {
      title: title.trim(),
      body: body.trim(),
      audience,
      target:
        audience === 'event'
          ? {
            type: 'event' as const,
            id: selectedEvent?.id ?? null,
            name: selectedEvent?.title ?? null,
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
      reach,
      ...extra,
    };
  }

  function resetForm() {
    setTitle('');
    setBody('');
    setSelectedEventId(null);
    setSelectedVenueId(null);
    setAudience('all');
  }

  function handleSendNow() {
    if (!title.trim() || !body.trim()) {
      toast.error('Add a title and body first.');
      return;
    }
    if (!targetValid) {
      toast.error(
        audience === 'event'
          ? 'Select an event to notify.'
          : 'Select a venue to notify.',
      );
      return;
    }
    const payload = buildPayload({ sentAt: new Date().toISOString() });
    console.log('Sending Notification:', payload);
    toast.success('Notification sent (mock).');
    resetForm();
  }

  function handleScheduleClick() {
    if (!targetValid) {
      toast.error(
        audience === 'event'
          ? 'Select an event to notify.'
          : 'Select a venue to notify.',
      );
      return;
    }
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
        description="Send push notifications to programme holders."
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Panel className="lg:col-span-2" title="Create message">
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
                              if (o.v !== 'event') setSelectedEventId(null);
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

                      {audience === 'event' && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Select
                            showSearch
                            allowClear
                            value={selectedEventId ?? undefined}
                            onChange={(v) => setSelectedEventId(v ?? null)}
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
                                        <> · Next {formatDateShort(next.date)} · {next.start_time}</>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          {selectedEvent && (
                            <SelectedTargetCard
                              icon={Ticket}
                              image={selectedEvent.cover_image}
                              title={selectedEvent.title}
                              meta={`${selectedEvent.venue_name} · ${selectedEvent.category}`}
                              extra={`${formatNumber(selectedEvent.programme_downloads)} programme holders`}
                              onClear={() => setSelectedEventId(null)}
                            />
                          )}
                        </div>
                      )}

                      {audience === 'venue' && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
                                    <div className="font-semibold text-ink truncate">
                                      {v.name}
                                    </div>
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

                    <div className="flex items-center justify-between pt-3 border-t border-line">
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
                  </div>
                </Panel>

                <Panel title="Live Preview" description="How it looks on iOS/Android">
                  <div className="rounded-2xl border border-line bg-surface-sunken p-4">
                    <div className="rounded-xl bg-surface-raised p-3 shadow-soft">
                      <div className="flex items-center gap-2 text-[11px] text-ink-faint mb-2">
                        <span className="w-4 h-4 rounded bg-primary text-ink-inverse flex items-center justify-center text-[8px] font-bold">
                          S
                        </span>
                        SHOWE · now
                      </div>
                      <div className="font-semibold text-ink text-[14px]">
                        {title || 'Notification title'}
                      </div>
                      <p className="text-[13px] text-ink-muted mt-0.5 leading-snug">
                        {body || 'Your notification body will appear here.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-line bg-surface-sunken/60 p-3">
                    <div className="field-label">Sending to</div>
                    <div className="mt-1.5 text-sm text-ink font-semibold">
                      {audience === 'all' && 'All programme holders'}
                      {audience === 'event' && (selectedEvent?.title ?? 'No event selected yet')}
                      {audience === 'venue' && (selectedVenue?.name ?? 'No venue selected yet')}
                    </div>
                    <div className="mt-1 text-[12px] text-ink-faint">
                      Estimated reach: ~{formatNumber(reach)} users
                    </div>
                  </div>
                </Panel>
              </div>
            ),
          },
          {
            key: 'queue',
            label: (
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Scheduled queue</span>
              </div>
            ),
            children: (
              <Panel padded={false} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="divide-y divide-line">
                  {[
                    {
                      t: 'Pre-show reminder',
                      b: "Don't forget to pre-order your intermission drinks!",
                      time: 'Tomorrow, 18:30',
                      users: 1240,
                    },
                    {
                      t: 'Cast change notice',
                      b: "Tonight's performance of Hamlet will feature...",
                      time: 'Friday, 14:00',
                      users: 842,
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="p-5 flex items-center gap-4 hover:bg-surface-sunken transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-amber/10 text-amber flex items-center justify-center shrink-0">
                        <Clock size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-ink">{s.t}</div>
                        <div className="text-sm text-ink-muted truncate">{s.b}</div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                          <span className="flex items-center gap-1">
                            <CalIcon size={10} /> {s.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={10} /> {s.users} users
                          </span>
                        </div>
                      </div>
                      <Dropdown
                        menu={{
                          items: [
                            { key: 'edit', label: 'Edit schedule', icon: <Edit size={14} /> },
                            {
                              key: 'delete',
                              label: 'Delete',
                              icon: <Trash2 size={14} />,
                              danger: true,
                            },
                          ],
                          onClick: ({ key }) => {
                            if (key === 'delete') {
                              toast.success('Scheduled notification deleted.');
                            } else {
                              toast.info('Edit mode enabled.');
                              setTitle(s.t);
                              setBody(s.b);
                              setActiveTab('compose');
                            }
                          },
                        }}
                        trigger={['click']}
                      >
                        <Button
                          type="text"
                          icon={<MoreVertical size={16} />}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </Dropdown>
                    </div>
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
              <Panel padded={false} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="divide-y divide-line">
                  {[
                    {
                      t: 'Opening night',
                      b: 'Break a leg everyone! Show starts at 7pm.',
                      time: 'May 10, 19:00',
                      users: 3420,
                      rate: '42%',
                    },
                    {
                      t: 'Merch available',
                      b: 'Check out our new limited edition programmes at the stand.',
                      time: 'May 8, 14:00',
                      users: 3100,
                      rate: '35%',
                    },
                    {
                      t: 'Feedback wanted',
                      b: "Tell us what you thought about tonight's performance.",
                      time: 'May 5, 22:15',
                      users: 2840,
                      rate: '29%',
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="p-5 flex items-center gap-4 hover:bg-surface-sunken transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-ink">{s.t}</div>
                        <div className="text-sm text-ink-muted truncate">{s.b}</div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                          <span className="flex items-center gap-1">
                            <CalIcon size={10} /> {s.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={10} /> {s.users}
                          </span>
                          <span className="flex items-center gap-1 text-amber font-bold">
                            <Eye size={10} /> {s.rate} Open Rate
                          </span>
                        </div>
                      </div>
                    </div>
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
      />
    </>
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

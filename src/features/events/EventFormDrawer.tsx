import { useState } from 'react';
import { Tabs, Button, Switch } from 'antd';
import {
  Image as ImageIcon,
  X,
  Plus,
  Calendar,
  Clock,
  Sun,
  Moon,
  Trash2,
  MapPin,
  Sparkles,
  Tag,
  Link as LinkIcon,
  Utensils,
  Hotel,
  Wine,
  GalleryHorizontalEnd,
} from 'lucide-react';
import type { EventListItem, Performance, PerformanceType } from '@/types/event';
import { EVENT_CATEGORIES } from '@/constants/events';
import { cn } from '@/lib/utils';

interface EventFormDrawerProps {
  event: EventListItem | null;
  onSave: () => void;
  onCancel: () => void;
}

interface FormState {
  title: string;
  category: string;
  tags: string[];
  cover_image: string;
  gallery: string[];
  is_featured: boolean;
  description_html: string;
  highlights: string[];
  get_tickets_url: string;
  performances: Performance[];
  // Location
  venue_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: string;
  longitude: string;
  // Host
  host_name: string;
  host_username: string;
  host_bio: string;
  host_avatar: string;
  host_verified: boolean;
}

const DEFAULT_STATE: FormState = {
  title: '',
  category: 'Theatre',
  tags: [],
  cover_image: '',
  gallery: [],
  is_featured: false,
  description_html: '',
  highlights: [],
  get_tickets_url: '',
  performances: [
    { id: 'p1', date: '', start_time: '19:30', end_time: '21:30', type: 'evening' },
  ],
  venue_name: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  zip_code: '',
  country: 'United Kingdom',
  latitude: '',
  longitude: '',
  host_name: '',
  host_username: '',
  host_bio: '',
  host_avatar: '',
  host_verified: false,
};

export function EventFormDrawer({ event, onSave, onCancel }: EventFormDrawerProps) {
  const [tab, setTab] = useState('basics');
  const [state, setState] = useState<FormState>(() => {
    if (!event) return DEFAULT_STATE;
    return {
      ...DEFAULT_STATE,
      title: event.title,
      category: event.category,
      cover_image: event.cover_image,
      is_featured: event.is_featured,
      performances: event.performances,
      venue_name: event.venue_name,
      city: event.location_city,
    };
  });
  const [tagInput, setTagInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function addTag() {
    if (!tagInput.trim()) return;
    set('tags', [...state.tags, tagInput.trim()]);
    setTagInput('');
  }

  function removeTag(t: string) {
    set('tags', state.tags.filter((x) => x !== t));
  }

  function addHighlight() {
    if (!highlightInput.trim()) return;
    set('highlights', [...state.highlights, highlightInput.trim()]);
    setHighlightInput('');
  }

  function removeHighlight(h: string) {
    set('highlights', state.highlights.filter((x) => x !== h));
  }

  function addPerformance() {
    set('performances', [
      ...state.performances,
      {
        id: `p${state.performances.length + 1}`,
        date: '',
        start_time: '19:30',
        end_time: '21:30',
        type: 'evening',
      },
    ]);
  }

  function updatePerformance(i: number, p: Partial<Performance>) {
    const next = [...state.performances];
    next[i] = { ...next[i], ...p };
    set('performances', next);
  }

  function removePerformance(i: number) {
    if (state.performances.length === 1) return;
    set('performances', state.performances.filter((_, idx) => idx !== i));
  }

  const tabItems = [
    { key: 'basics', label: 'Basics' },
    { key: 'media', label: 'Media' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'location', label: 'Location' },
    { key: 'host', label: 'Host & social' },
    { key: 'recommendations', label: 'Recommendations' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tabs header — sticky */}
      <div className="px-6 pt-3 bg-surface-base border-b border-line sticky top-0 z-10">
        <Tabs activeKey={tab} onChange={setTab} items={tabItems} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {tab === 'basics' && (
          <>
            <FieldGroup label="Event title" required>
              <input
                value={state.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Hamlet — Spring Repertory"
                className="input-base"
              />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Category">
                <select
                  value={state.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="input-base"
                >
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </FieldGroup>
              <FieldGroup label="Featured event" hint="Show with a sparkle on the SHOWE app.">
                <div className="h-11 flex items-center">
                  <Switch checked={state.is_featured} onChange={(v) => set('is_featured', v)} />
                  <span className="ml-2 text-sm text-ink-muted">
                    {state.is_featured ? 'Yes — featured' : 'Not featured'}
                  </span>
                </div>
              </FieldGroup>
            </div>

            <FieldGroup label="Tags" hint="Used in app search and recommendations">
              <div className="flex flex-wrap gap-2 mb-2">
                {state.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[12px] font-semibold"
                  >
                    <Tag size={11} />
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="ml-0.5 hover:text-primary-700"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag and press Enter"
                  className="input-base"
                />
                <Button onClick={addTag} icon={<Plus size={14} />} />
              </div>
            </FieldGroup>

            <FieldGroup label="Description" hint="A short paragraph for the event detail page.">
              <textarea
                value={state.description_html}
                onChange={(e) => set('description_html', e.target.value)}
                rows={5}
                placeholder="What can the audience expect? Who is performing?"
                className="input-base !h-auto py-3 leading-relaxed"
              />
            </FieldGroup>

            <FieldGroup label="Highlights" hint="3–5 short bullet points displayed on the event page.">
              <ul className="space-y-1.5 mb-2">
                {state.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surface-sunken"
                  >
                    <span className="text-sm text-ink flex items-center gap-2">
                      <Sparkles size={12} className="text-accent" />
                      {h}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeHighlight(h)}
                      className="text-ink-faint hover:text-danger transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                  placeholder="e.g. Captioned matinee available"
                  className="input-base"
                />
                <Button onClick={addHighlight} icon={<Plus size={14} />} />
              </div>
            </FieldGroup>

            <FieldGroup label="Get tickets URL" hint="External link (e.g. your box office page).">
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  value={state.get_tickets_url}
                  onChange={(e) => set('get_tickets_url', e.target.value)}
                  placeholder="https://royalcrescent.co.uk/whats-on/..."
                  className="input-base pl-9"
                />
              </div>
            </FieldGroup>
          </>
        )}

        {tab === 'media' && (
          <>
            <FieldGroup label="Cover image" required hint="Recommended: 1600 × 900px, mobile-safe">
              <ImageUploader value={state.cover_image} onChange={(v) => set('cover_image', v)} aspect="16/9" />
            </FieldGroup>

            <FieldGroup label="Gallery" hint="Add up to 8 images. Square or landscape work best.">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {state.gallery.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden border border-line group"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => set('gallery', state.gallery.filter((_, idx) => idx !== i))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {state.gallery.length < 8 && (
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Image URL?');
                      if (url) set('gallery', [...state.gallery, url]);
                    }}
                    className="aspect-square rounded-xl border-2 border-dashed border-line hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 text-ink-muted hover:text-primary transition-colors"
                  >
                    <Plus size={18} />
                    <span className="text-[12px] font-semibold">Add image</span>
                  </button>
                )}
              </div>
            </FieldGroup>
          </>
        )}

        {tab === 'schedule' && (
          <>
            <FieldGroup
              label="Performances"
              hint="Add every show date. Mark each as Matinee or Evening — analytics segment by performance type."
            >
              <div className="space-y-3">
                {state.performances.map((p, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-line bg-surface-raised p-4 grid grid-cols-12 gap-3 items-end"
                  >
                    <div className="col-span-12 sm:col-span-3">
                      <label className="field-label">Date</label>
                      <div className="relative">
                        <Calendar
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
                        />
                        <input
                          type="date"
                          value={p.date}
                          onChange={(e) => updatePerformance(i, { date: e.target.value })}
                          className="input-base pl-9"
                        />
                      </div>
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                      <label className="field-label">Start</label>
                      <div className="relative">
                        <Clock
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
                        />
                        <input
                          type="time"
                          value={p.start_time}
                          onChange={(e) => updatePerformance(i, { start_time: e.target.value })}
                          className="input-base pl-9"
                        />
                      </div>
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                      <label className="field-label">End</label>
                      <input
                        type="time"
                        value={p.end_time}
                        onChange={(e) => updatePerformance(i, { end_time: e.target.value })}
                        className="input-base"
                      />
                    </div>
                    <div className="col-span-9 sm:col-span-4">
                      <label className="field-label">Performance type</label>
                      <PerformanceTypeToggle
                        value={p.type}
                        onChange={(v) => updatePerformance(i, { type: v })}
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-1 flex justify-end">
                      <Button
                        type="text"
                        icon={<Trash2 size={14} />}
                        onClick={() => removePerformance(i)}
                        disabled={state.performances.length === 1}
                        danger
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addPerformance}
                  className="w-full rounded-xl border-2 border-dashed border-line hover:border-primary hover:bg-primary/5 py-3 text-sm font-semibold text-ink-muted hover:text-primary transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  Add another performance
                </button>
              </div>
            </FieldGroup>
          </>
        )}

        {tab === 'location' && (
          <>
            <FieldGroup label="Venue name">
              <input
                value={state.venue_name}
                onChange={(e) => set('venue_name', e.target.value)}
                placeholder="Royal Crescent Theatre"
                className="input-base"
              />
            </FieldGroup>

            <FieldGroup label="Address">
              <input
                value={state.address_line1}
                onChange={(e) => set('address_line1', e.target.value)}
                placeholder="Address line 1"
                className="input-base mb-2"
              />
              <input
                value={state.address_line2}
                onChange={(e) => set('address_line2', e.target.value)}
                placeholder="Address line 2 (optional)"
                className="input-base"
              />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="City">
                <input
                  value={state.city}
                  onChange={(e) => set('city', e.target.value)}
                  className="input-base"
                />
              </FieldGroup>
              <FieldGroup label="State / County">
                <input
                  value={state.state}
                  onChange={(e) => set('state', e.target.value)}
                  className="input-base"
                />
              </FieldGroup>
              <FieldGroup label="Postcode">
                <input
                  value={state.zip_code}
                  onChange={(e) => set('zip_code', e.target.value)}
                  className="input-base"
                />
              </FieldGroup>
              <FieldGroup label="Country">
                <input
                  value={state.country}
                  onChange={(e) => set('country', e.target.value)}
                  className="input-base"
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Coordinates" hint="Used by Module 10 — Getting There">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <MapPin
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
                  />
                  <input
                    value={state.latitude}
                    onChange={(e) => set('latitude', e.target.value)}
                    placeholder="51.3873"
                    className="input-base pl-9"
                  />
                </div>
                <input
                  value={state.longitude}
                  onChange={(e) => set('longitude', e.target.value)}
                  placeholder="-2.3669"
                  className="input-base"
                />
              </div>
            </FieldGroup>
          </>
        )}

        {tab === 'host' && (
          <>
            <FieldGroup label="Host avatar">
              <ImageUploader
                value={state.host_avatar}
                onChange={(v) => set('host_avatar', v)}
                aspect="1/1"
                small
              />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Host name">
                <input
                  value={state.host_name}
                  onChange={(e) => set('host_name', e.target.value)}
                  placeholder="Mara Sinclair"
                  className="input-base"
                />
              </FieldGroup>
              <FieldGroup label="Username / handle">
                <input
                  value={state.host_username}
                  onChange={(e) => set('host_username', e.target.value)}
                  placeholder="maradirects"
                  className="input-base"
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Host bio">
              <textarea
                value={state.host_bio}
                onChange={(e) => set('host_bio', e.target.value)}
                rows={3}
                placeholder="Director, producer, or organiser bio."
                className="input-base !h-auto py-3 leading-relaxed"
              />
            </FieldGroup>

            <FieldGroup label="Verified host" hint="Show a verified tick on the event page.">
              <Switch
                checked={state.host_verified}
                onChange={(v) => set('host_verified', v)}
              />
            </FieldGroup>
          </>
        )}

        {tab === 'recommendations' && (
          <>
            <div className="rounded-xl bg-accent/8 border border-accent/30 p-4">
              <div className="flex items-start gap-3">
                <Sparkles size={16} className="text-[#8A5C00] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-ink">Linked from Plan Your Trip</div>
                  <p className="text-[13px] text-ink-muted mt-0.5">
                    Recommendations are managed in your venue’s Plan Your Trip page and automatically attach to events at this location. Module 8 in your programmes can surface these.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <RecCard icon={Utensils} label="Restaurants" count={3} />
              <RecCard icon={Hotel} label="Hotels" count={2} />
              <RecCard icon={Wine} label="Bars" count={4} />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-surface-raised border-t border-line flex items-center justify-between">
        <div className="text-[12.5px] text-ink-muted">
          {event ? 'Editing existing event' : 'Creating a new event'}
        </div>
        <div className="flex gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={onSave}>
            {event ? 'Save changes' : 'Create event'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="field-label flex items-center gap-1">
        {label}
        {required && <span className="text-accent">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[12px] text-ink-faint">{hint}</p>}
    </div>
  );
}

function PerformanceTypeToggle({
  value,
  onChange,
}: {
  value: PerformanceType;
  onChange: (v: PerformanceType) => void;
}) {
  const opts: { v: PerformanceType; label: string; icon: typeof Sun }[] = [
    { v: 'matinee', label: 'Matinee', icon: Sun },
    { v: 'evening', label: 'Evening', icon: Moon },
    { v: 'all_day', label: 'All day', icon: GalleryHorizontalEnd },
  ];
  return (
    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-full bg-surface-sunken h-11 border border-line">
      {opts.map((o) => {
        const Icon = o.icon;
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold transition-all',
              active ? 'bg-primary text-ink-inverse shadow-soft' : 'text-ink-muted hover:text-ink'
            )}
          >
            <Icon size={12} /> {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ImageUploader({
  value,
  onChange,
  aspect = '16/9',
  small,
}: {
  value: string;
  onChange: (v: string) => void;
  aspect?: string;
  small?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-dashed border-line overflow-hidden bg-surface-sunken',
        small ? 'w-24' : 'w-full'
      )}
      style={{ aspectRatio: aspect }}
    >
      {value ? (
        <>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
          >
            <X size={13} />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => {
            const url = prompt('Image URL?');
            if (url) onChange(url);
          }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-muted hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <ImageIcon size={small ? 16 : 22} />
          <span className="text-[12px] font-semibold">{small ? 'Upload' : 'Click to upload image'}</span>
        </button>
      )}
    </div>
  );
}

function RecCard({ icon: Icon, label, count }: { icon: typeof Utensils; label: string; count: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface-raised p-4 text-center">
      <div className="w-10 h-10 mx-auto rounded-full bg-surface-sunken flex items-center justify-center text-ink-muted">
        <Icon size={16} />
      </div>
      <div className="font-semibold text-ink text-sm mt-2">{label}</div>
      <div className="text-[12px] text-ink-faint">{count} listed</div>
    </div>
  );
}

import type { Block } from '@/types/programme';
import { MapPin, Star, ShoppingBag, Heart, Coffee, ArrowRight, Bell, Image as ImageIcon, Sparkles, AccessibilityIcon } from 'lucide-react';
import { useState } from 'react';

/**
 * Maps a Block to its preview JSX.
 * These previews are mobile-first: assume 320–360px width.
 */
export function renderBlockPreview(block: Block) {
  switch (block.type) {
    case 'hero':
      return <HeroPreview block={block} />;
    case 'welcome':
      return <WelcomePreview block={block} />;
    case 'schedule':
      return <SchedulePreview block={block} />;
    case 'accessibility':
      return <AccessibilityPreview block={block} />;
    case 'behind_scenes':
      return <BehindScenesPreview block={block} />;
    case 'sponsor_thanks':
      return <SponsorThanksPreview block={block} />;
    case 'refreshments':
      return <RefreshmentsPreview block={block} />;
    case 'cast_grid':
      return <CastGridPreview block={block} />;
    case 'cast_spotlight':
      return <CastSpotlightPreview block={block} />;
    case 'narrative_text':
      return <NarrativeTextPreview block={block} />;
    case 'image_story':
      return <ImageStoryPreview block={block} />;
    case 'poll':
      return <PollPreview block={block} />;
    case 'review':
      return <ReviewPreview block={block} />;
    case 'merchandise':
      return <MerchandisePreview block={block} />;
    case 'future_shows':
      return <FutureShowsPreview block={block} />;
    case 'donation':
      return <DonationPreview block={block} />;
    case 'offers':
      return <OffersPreview block={block} />;
    case 'memory_capture':
      return <MemoryCapturePreview block={block} />;
    case 'recap':
      return <RecapPreview block={block} />;
    case 'recommendations':
      return <RecommendationsPreview block={block} />;
    case 'push_notification':
      return <PushNotificationPreview block={block} />;
    case 'map':
      return <MapPreview block={block} />;
    case 'directions':
      return <DirectionsPreview block={block} />;
    default:
      return null;
  }
}

/* ---------------- Module 1 ---------------- */

function HeroPreview({ block }: { block: Extract<Block, { type: 'hero' }> }) {
  const heightClass = { short: 'h-40', medium: 'h-56', tall: 'h-72' }[block.height];
  return (
    <div className={`relative w-full ${heightClass} overflow-hidden`}>
      {block.cover_image ? (
        <img src={block.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-700" />
      )}
      {block.overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      )}
      <div className="absolute inset-0 flex flex-col justify-end p-5 text-ink-inverse">
        <h1 className="font-display font-extrabold text-2xl leading-tight tracking-tight drop-shadow">
          {block.title}
        </h1>
        {block.subtitle && (
          <p className="text-sm text-white/85 mt-1 drop-shadow">{block.subtitle}</p>
        )}
      </div>
    </div>
  );
}

function WelcomePreview({ block }: { block: Extract<Block, { type: 'welcome' }> }) {
  return (
    <div>
      <h2 className="font-display font-extrabold text-xl text-ink leading-tight">{block.heading}</h2>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-muted whitespace-pre-line">{block.body}</p>
      {block.signature && (
        <div className="mt-3 text-[12px] uppercase tracking-wider font-bold text-primary">
          — {block.signature}
        </div>
      )}
    </div>
  );
}

function SchedulePreview({ block }: { block: Extract<Block, { type: 'schedule' }> }) {
  return (
    <div>
      <div className="eyebrow mb-3">{block.title}</div>
      <ul className="space-y-1">
        {block.items.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[60px_1fr] gap-3 py-2.5 border-t border-line first:border-t-0"
          >
            <div className="font-display font-extrabold tabular text-ink text-sm leading-none pt-0.5">
              {item.time}
            </div>
            <div>
              <div className="font-semibold text-ink text-sm leading-tight">{item.label}</div>
              {item.note && <div className="text-[12px] text-ink-faint mt-0.5">{item.note}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AccessibilityPreview({ block }: { block: Extract<Block, { type: 'accessibility' }> }) {
  return (
    <div>
      <div className="eyebrow mb-3">{block.title}</div>
      <ul className="space-y-2.5">
        {block.features.map((f) => (
          <li key={f.id} className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <AccessibilityIcon size={15} />
            </span>
            <div className="min-w-0">
              <div className="font-semibold text-ink text-sm">{f.label}</div>
              {f.description && <div className="text-[12px] text-ink-muted mt-0.5">{f.description}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BehindScenesPreview({ block }: { block: Extract<Block, { type: 'behind_scenes' }> }) {
  return (
    <div>
      <div className="eyebrow mb-3">{block.title}</div>
      <p className="text-[14px] text-ink-muted leading-relaxed mb-3">{block.body}</p>
      <div className="grid grid-cols-2 gap-2">
        {block.images.map((src, idx) => (
          <img key={idx} src={src} alt="" className="rounded-lg w-full aspect-square object-cover bg-surface-sunken" />
        ))}
      </div>
    </div>
  );
}

function SponsorThanksPreview({ block }: { block: Extract<Block, { type: 'sponsor_thanks' }> }) {
  return (
    <div>
      <div className="eyebrow mb-3">{block.title}</div>
      <ul className="grid grid-cols-2 gap-2">
        {block.sponsors.map((s) => (
          <li
            key={s.id}
            className="rounded-lg border border-line bg-surface-raised p-3 text-center text-sm font-semibold text-ink"
          >
            {s.logo ? (
              <img src={s.logo} alt={s.name} className="h-8 mx-auto object-contain mb-1" />
            ) : (
              <Heart size={14} className="text-accent mx-auto mb-1.5" />
            )}
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RefreshmentsPreview({ block }: { block: Extract<Block, { type: 'refreshments' }> }) {
  return (
    <div className="rounded-xl border border-line bg-surface-sunken p-4">
      <div className="w-10 h-10 rounded-full bg-accent text-ink flex items-center justify-center mb-3">
        <Coffee size={16} />
      </div>
      <h3 className="font-display font-bold text-ink leading-tight">{block.title}</h3>
      <p className="text-[13px] text-ink-muted mt-1.5">{block.description}</p>
      <button className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        {block.cta_label} <ArrowRight size={13} />
      </button>
    </div>
  );
}

/* ---------------- Module 2 ---------------- */

function CastGridPreview({ block }: { block: Extract<Block, { type: 'cast_grid' }> }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const cols = block.columns === 3 ? 'grid-cols-3' : 'grid-cols-2';
  return (
    <div>
      <div className="eyebrow mb-1">{block.title}</div>
      {block.description && (
        <p className="text-[12.5px] text-ink-muted mb-3">{block.description}</p>
      )}
      <ul className={`grid ${cols} gap-2.5`}>
        {block.members.map((m) => {
          const isOpen = openId === m.id;
          return (
            <li
              key={m.id}
              className="rounded-xl bg-surface-sunken border border-line overflow-hidden cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setOpenId(isOpen ? null : m.id);
              }}
            >
              {m.image && <img src={m.image} alt={m.name} className="w-full aspect-square object-cover" />}
              <div className="p-2.5">
                <div className="font-semibold text-ink text-[13px] leading-tight truncate">{m.name}</div>
                <div className="text-[11px] text-ink-faint truncate">{m.role}</div>
                {isOpen && m.bio && (
                  <p className="text-[11.5px] text-ink-muted mt-2 leading-snug">{m.bio}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CastSpotlightPreview({ block }: { block: Extract<Block, { type: 'cast_spotlight' }> }) {
  return (
    <div className="rounded-xl overflow-hidden border border-line">
      {block.image && (
        <img src={block.image} alt={block.name} className="w-full aspect-[4/3] object-cover" />
      )}
      <div className="p-4">
        <div className="eyebrow !text-accent">{block.role}</div>
        <h3 className="font-display font-bold text-lg text-ink mt-1">{block.name}</h3>
        <p className="text-[13px] text-ink-muted mt-2 leading-relaxed">{block.bio}</p>
      </div>
    </div>
  );
}

/* ---------------- Module 3 ---------------- */

function NarrativeTextPreview({ block }: { block: Extract<Block, { type: 'narrative_text' }> }) {
  return (
    <div className={`text-${block.layout.align === 'full' ? 'left' : block.layout.align}`}>
      {block.eyebrow && <div className="eyebrow mb-2">{block.eyebrow}</div>}
      {block.heading && (
        <h3 className="font-display font-bold text-xl text-ink leading-tight">{block.heading}</h3>
      )}
      <p className="mt-2 text-[14px] leading-relaxed text-ink-muted whitespace-pre-line">{block.body}</p>
    </div>
  );
}

function ImageStoryPreview({ block }: { block: Extract<Block, { type: 'image_story' }> }) {
  return (
    <div>
      <div className={block.image_position === 'top' ? 'space-y-3' : 'flex gap-3 items-start'}>
        {block.image && (
          <img
            src={block.image}
            alt=""
            className={
              block.image_position === 'top'
                ? 'w-full aspect-video object-cover rounded-lg bg-surface-sunken'
                : 'w-24 h-24 object-cover rounded-lg bg-surface-sunken shrink-0'
            }
          />
        )}
        <div className="flex-1">
          {block.caption && <div className="eyebrow mb-1.5">{block.caption}</div>}
          <p className="text-[13.5px] text-ink-muted leading-relaxed whitespace-pre-line">{block.body}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Module 4 ---------------- */

function PollPreview({ block }: { block: Extract<Block, { type: 'poll' }> }) {
  const [voted, setVoted] = useState<string | null>(null);
  return (
    <div className="rounded-xl border border-line bg-surface-sunken p-4">
      <h4 className="font-display font-bold text-ink leading-tight">{block.question}</h4>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {block.options.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setVoted(o.id);
              }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2
                ${
                  voted === o.id
                    ? 'bg-primary text-ink-inverse border-primary'
                    : 'bg-surface-raised text-ink border-line hover:border-primary/40'
                }`}
            >
              {o.emoji && <span className="text-base">{o.emoji}</span>}
              <span>{o.label}</span>
            </button>
          </li>
        ))}
      </ul>
      {voted && block.thank_you_message && (
        <p className="mt-3 text-[12.5px] text-success font-semibold">{block.thank_you_message}</p>
      )}
    </div>
  );
}

function ReviewPreview({ block }: { block: Extract<Block, { type: 'review' }> }) {
  return (
    <div>
      <h4 className="font-display font-bold text-ink leading-tight">{block.prompt}</h4>
      <textarea
        rows={3}
        placeholder={block.placeholder}
        maxLength={block.max_chars}
        className="mt-2 w-full rounded-lg border border-line bg-surface-raised p-3 text-sm leading-relaxed outline-none focus:border-primary"
      />
      <div className="mt-1 text-[11px] text-ink-faint text-right">0 / {block.max_chars}</div>
    </div>
  );
}

/* ---------------- Module 5 ---------------- */

function MerchandisePreview({ block }: { block: Extract<Block, { type: 'merchandise' }> }) {
  return (
    <div>
      <div className="eyebrow mb-3">{block.title}</div>
      <ul className="space-y-2.5">
        {block.items.map((it) => (
          <li key={it.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface-raised p-2.5">
            {it.image && <img src={it.image} alt="" className="w-14 h-14 rounded-lg object-cover bg-surface-sunken" />}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink text-sm truncate">{it.name}</div>
              <div className="font-display font-bold tabular text-primary text-sm">{it.price}</div>
            </div>
            <button className="w-8 h-8 rounded-full bg-primary text-ink-inverse flex items-center justify-center">
              <ShoppingBag size={13} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FutureShowsPreview({ block }: { block: Extract<Block, { type: 'future_shows' }> }) {
  return (
    <div>
      <div className="eyebrow mb-3">{block.title}</div>
      <ul className="space-y-2.5">
        {block.shows.map((s) => (
          <li key={s.id} className="rounded-xl overflow-hidden border border-line">
            {s.image && <img src={s.image} alt="" className="w-full aspect-video object-cover" />}
            <div className="p-3">
              <div className="font-semibold text-ink text-sm">{s.name}</div>
              <div className="text-[12px] text-ink-muted mt-0.5">{s.date}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DonationPreview({ block }: { block: Extract<Block, { type: 'donation' }> }) {
  return (
    <div className="rounded-xl border border-line bg-surface-sunken p-4">
      <Heart size={18} className="text-accent mb-2" />
      <h3 className="font-display font-bold text-ink">{block.title}</h3>
      <p className="text-[13px] text-ink-muted mt-1.5">{block.body}</p>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {block.preset_amounts.map((amt) => (
          <button key={amt} className="rounded-lg border border-line bg-surface-raised py-2 text-sm font-semibold text-ink">
            £{amt}
          </button>
        ))}
      </div>
      <button className="mt-3 w-full rounded-full bg-accent text-ink h-10 font-semibold text-sm">
        {block.cta_label}
      </button>
    </div>
  );
}

function OffersPreview({ block }: { block: Extract<Block, { type: 'offers' }> }) {
  return (
    <div>
      <div className="eyebrow mb-3">{block.title}</div>
      <ul className="space-y-2.5">
        {block.offers.map((o) => (
          <li key={o.id} className="rounded-xl border-2 border-dashed border-accent/50 bg-accent/5 p-3">
            <div className="font-semibold text-ink text-sm">{o.title}</div>
            <p className="text-[12.5px] text-ink-muted mt-1">{o.description}</p>
            {o.code && (
              <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-ink text-ink-inverse text-[11px] font-mono font-bold">
                {o.code}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Module 6 ---------------- */

function MemoryCapturePreview({ block }: { block: Extract<Block, { type: 'memory_capture' }> }) {
  return (
    <div className="rounded-xl border border-line bg-gradient-to-br from-accent/8 to-primary/5 p-4">
      <Sparkles size={16} className="text-accent mb-2" />
      <h3 className="font-display font-bold text-ink">{block.title}</h3>
      <p className="text-[13px] text-ink-muted mt-1.5">{block.prompt}</p>
      {block.allow_text && (
        <textarea
          rows={2}
          placeholder="Write your memory…"
          className="mt-3 w-full rounded-lg border border-line bg-surface-raised p-2.5 text-sm outline-none"
        />
      )}
      {block.allow_image && (
        <button className="mt-2 w-full rounded-lg border-2 border-dashed border-line py-3 text-[12.5px] font-semibold text-ink-muted inline-flex items-center justify-center gap-2">
          <ImageIcon size={13} /> Add a photo
        </button>
      )}
      <div className="mt-2 text-[11px] text-ink-faint">{block.privacy_note}</div>
    </div>
  );
}

/* ---------------- Module 7 ---------------- */

function RecapPreview({ block }: { block: Extract<Block, { type: 'recap' }> }) {
  return (
    <div className="rounded-xl panel-deep p-4">
      <div className="relative z-[1]">
        <div className="eyebrow !text-accent mb-2">Recap</div>
        <h3 className="font-display font-bold text-ink-inverse leading-tight">{block.title}</h3>
        <p className="text-[13px] text-ink-inverse/75 mt-2">{block.description}</p>
        <div className="mt-3 flex items-center gap-2 text-[11.5px] text-accent-300 font-semibold">
          <Bell size={11} /> Available {block.release_after_hours}h after the event
        </div>
      </div>
    </div>
  );
}

/* ---------------- Module 8 ---------------- */

function RecommendationsPreview({ block }: { block: Extract<Block, { type: 'recommendations' }> }) {
  const samples = [
    {
      name: 'The Gilded Fork',
      cat: 'Fine dining',
      img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600',
      rating: 4.8,
      distance: '0.2 mi',
    },
    {
      name: 'Velvet Lounge',
      cat: 'Cocktail bar',
      img: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=600',
      rating: 4.7,
      distance: '0.1 mi',
    },
  ];
  return (
    <div>
      <div className="eyebrow mb-3">{block.title}</div>
      <ul className="space-y-2.5">
        {samples.map((s) => (
          <li key={s.name} className="flex items-center gap-3 rounded-xl border border-line bg-surface-raised p-2.5">
            <img src={s.img} alt="" className="w-14 h-14 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink text-sm truncate">{s.name}</div>
              <div className="text-[11px] text-ink-faint">{s.cat}</div>
              <div className="text-[11px] text-ink-muted mt-0.5 flex items-center gap-2">
                {block.show_rating && (
                  <span className="inline-flex items-center gap-0.5">
                    <Star size={10} className="text-accent fill-accent" />
                    <span className="tabular">{s.rating}</span>
                  </span>
                )}
                {block.show_distance && <span>· {s.distance}</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Module 9 ---------------- */

function PushNotificationPreview({ block }: { block: Extract<Block, { type: 'push_notification' }> }) {
  return (
    <div className="rounded-xl bg-surface-raised border border-line p-3 shadow-soft">
      <div className="flex items-center gap-2 text-[10px] text-ink-faint mb-1.5">
        <span className="w-4 h-4 rounded bg-primary text-ink-inverse flex items-center justify-center text-[7px] font-bold">S</span>
        SHOWE · {block.trigger.replace('_', ' ')}
      </div>
      <div className="font-semibold text-ink text-[13px] leading-tight">{block.title}</div>
      <p className="text-[12px] text-ink-muted mt-0.5">{block.message}</p>
    </div>
  );
}

/* ---------------- Module 10 ---------------- */

function MapPreview({ block }: { block: Extract<Block, { type: 'map' }> }) {
  return (
    <div>
      <div className="eyebrow mb-2">{block.title}</div>
      <div className="rounded-xl overflow-hidden border border-line aspect-[4/3] bg-surface-sunken relative">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 40%, rgba(1, 75, 82, 0.18), transparent 50%), linear-gradient(135deg, #ECE7DD 0%, #DCD4C5 100%)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-9 h-9 rounded-full bg-primary text-ink-inverse flex items-center justify-center shadow-medium">
            <MapPin size={15} />
          </span>
        </div>
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-surface-raised/95 backdrop-blur p-2.5 text-[12px]">
          <div className="font-semibold text-ink">{block.address.split(',')[0]}</div>
          <div className="text-ink-faint truncate">{block.address}</div>
        </div>
      </div>
    </div>
  );
}

function DirectionsPreview({ block }: { block: Extract<Block, { type: 'directions' }> }) {
  return (
    <div>
      <div className="eyebrow mb-3">{block.title}</div>
      <ul className="space-y-2">
        {block.by_train && (
          <li className="rounded-lg bg-surface-sunken p-3 text-sm">
            <div className="font-semibold text-ink text-[12.5px] uppercase tracking-wider">By train</div>
            <div className="text-ink-muted mt-0.5">{block.by_train}</div>
          </li>
        )}
        {block.by_car && (
          <li className="rounded-lg bg-surface-sunken p-3 text-sm">
            <div className="font-semibold text-ink text-[12.5px] uppercase tracking-wider">By car</div>
            <div className="text-ink-muted mt-0.5">{block.by_car}</div>
          </li>
        )}
        {block.by_bus && (
          <li className="rounded-lg bg-surface-sunken p-3 text-sm">
            <div className="font-semibold text-ink text-[12.5px] uppercase tracking-wider">By bus</div>
            <div className="text-ink-muted mt-0.5">{block.by_bus}</div>
          </li>
        )}
        {block.parking_info && (
          <li className="rounded-lg bg-surface-sunken p-3 text-sm">
            <div className="font-semibold text-ink text-[12.5px] uppercase tracking-wider">Parking</div>
            <div className="text-ink-muted mt-0.5">{block.parking_info}</div>
          </li>
        )}
      </ul>
    </div>
  );
}

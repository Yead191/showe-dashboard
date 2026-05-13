
import MediaRenderer from '@/helpers/MediaRenderer';
import type { Block } from '@/types/programme';
import { MapPin, Star, ShoppingBag, Heart, Coffee, ArrowRight, Bell, Sparkles, AccessibilityIcon, Camera, X as XIcon, Download, Utensils, BedDouble, Wine } from 'lucide-react';
import { useState, useRef } from 'react';
import { MOCK_RECOMMENDATION } from '@/constants/mock-recommendation';

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
  const heightClass = { short: 'h-40', medium: 'h-56', tall: 'h-80', full: 'h-screen lg:h-[500px]' }[block.height];
  return (
    <div className={`relative w-full ${heightClass} overflow-hidden`}>
      {block.cover_image ? (
        <MediaRenderer src={block.cover_image} className="absolute inset-0 w-full h-full object-cover" />
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
  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null);

  return (
    <div>
      <div className="eyebrow mb-3">{block.title}</div>
      <p className="text-[14px] text-ink-muted leading-relaxed mb-3">{block.body}</p>
      <div className="grid grid-cols-2 gap-2">
        {block.images.map((src, idx) => (
          <button
            key={idx}
            type="button"
            className="w-full aspect-square bg-surface-sunken rounded-lg overflow-hidden cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenMedia(src);
            }}
          >
            <MediaRenderer src={src} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {fullscreenMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" onClick={(e) => { e.stopPropagation(); setFullscreenMedia(null); }}>
          <button
            type="button"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenMedia(null);
            }}
          >
            <XIcon size={20} />
          </button>
          <div className="max-w-4xl max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {fullscreenMedia.startsWith('data:video') || fullscreenMedia.match(/\.(mp4|webm|mov)$/i) ? (
              <video
                src={fullscreenMedia}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            ) : (
              <img src={fullscreenMedia} alt="Fullscreen preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            )}
          </div>
        </div>
      )}
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
              <MediaRenderer src={s.logo} className="h-8 mx-auto object-contain mb-1" />
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
              {m.image && <MediaRenderer src={m.image} className="w-full aspect-square object-cover" />}
              <div className="p-2.5">
                <div className="font-semibold text-ink text-[13px] leading-tight truncate">{m.name}</div>
                <div className="text-[11px] text-ink-faint truncate">{m.role}</div>
                {isOpen && m.bio && (
                  <p className="text-[11.5px] text-ink-muted mt-2 leading-snug">{m.bio}</p>
                )}
                {isOpen && m.link_url && (
                  <a
                    href={m.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-700 transition-colors"
                  >
                    <ArrowRight size={10} />
                    {m.link_label || 'Visit'}
                  </a>
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
        <MediaRenderer src={block.image} className="w-full aspect-[4/3] object-cover" />
      )}
      <div className="p-4">
        <div className="eyebrow !text-accent">{block.role}</div>
        <h3 className="font-display font-bold text-lg text-ink mt-1">{block.name}</h3>
        <p className="text-[13px] text-ink-muted mt-2 leading-relaxed">{block.bio}</p>
        {block.link_url && (
          <a
            href={block.link_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-primary/10 text-primary text-[12px] font-bold hover:bg-primary/20 transition-colors"
          >
            <ArrowRight size={11} />
            {block.link_label || 'Visit'}
          </a>
        )}
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
          <MediaRenderer
            src={block.image}
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
                ${voted === o.id
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
  const [chars, setChars] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  return (
    <div>
      <h4 className="font-display font-bold text-ink leading-tight">{block.prompt}</h4>
      {submitted ? (
        <div className="mt-3 rounded-xl bg-success/10 border border-success/30 p-4 text-center">
          <p className="text-[13px] font-semibold text-success">Thanks for your review! ✓</p>
        </div>
      ) : (
        <>
          <textarea
            rows={3}
            placeholder={block.placeholder}
            maxLength={block.max_chars}
            onChange={(e) => setChars(e.target.value.length)}
            className="mt-2 w-full rounded-lg border border-line bg-surface-raised p-3 text-sm leading-relaxed outline-none focus:border-primary transition-colors"
          />
          <div className="flex items-center justify-between mt-1 mb-3">
            <span className="text-[11px] text-ink-faint">
              {chars} / {block.max_chars}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSubmitted(true); }}
            className="w-full rounded-full bg-primary text-ink-inverse h-10 font-bold text-sm shadow-soft hover:bg-primary-700 transition-colors"
          >
            {block.submit_label || 'Submit'}
          </button>
        </>
      )}
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
            {it.image && <MediaRenderer src={it.image} className="w-14 h-14 rounded-lg object-cover bg-surface-sunken" />}
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
            {s.image && <MediaRenderer src={s.image} className="w-full aspect-video object-cover" />}
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
  const [selectedAmt, setSelectedAmt] = useState<number | null>(null);
  return (
    <div className="rounded-xl border border-line overflow-hidden">
      {block.image && (
        <MediaRenderer src={block.image} className="w-full aspect-video object-cover" />
      )}
      <div className="p-4 bg-surface-sunken">
        {!block.image && <Heart size={18} className="text-accent mb-2" />}
        <h3 className="font-display font-bold text-ink">{block.title}</h3>
        <p className="text-[13px] text-ink-muted mt-1.5">{block.body}</p>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {block.preset_amounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedAmt(amt); }}
              className={`rounded-lg border py-2 text-sm font-bold transition-all ${selectedAmt === amt
                ? 'bg-primary text-ink-inverse border-primary shadow-soft'
                : 'bg-surface-raised text-ink border-line hover:border-primary/50'
                }`}
            >
              £{amt}
            </button>
          ))}
        </div>
        <a
          href={block.cta_url ? `${block.cta_url}${selectedAmt ? `?amount=${selectedAmt}` : ''}` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-3 flex items-center justify-center w-full rounded-full bg-accent text-ink h-10 font-semibold text-sm hover:bg-accent-600 transition-colors"
        >
          {block.cta_label}{selectedAmt ? ` — £${selectedAmt}` : ''}
        </a>
      </div>
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
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedCard, setGeneratedCard] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (const word of words) {
      const testLine = line + word + ' ';
      if (ctx.measureText(testLine).width > maxWidth && line !== '') {
        ctx.fillText(line.trim(), x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY;
  };

  const generateMemoryCard = async () => {
    setGenerating(true);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = 800;
    canvas.height = 1050;

    // ── Background ──
    const bg = ctx.createLinearGradient(0, 0, 800, 1050);
    bg.addColorStop(0, '#012d31');
    bg.addColorStop(0.55, '#011a1d');
    bg.addColorStop(1, '#010e10');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(0, 0, 800, 1050, 28);
    ctx.fill();

    // ── Decorative circles ──
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = '#F5A800';
    ctx.beginPath(); ctx.arc(720, 180, 220, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(80, 900, 160, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    // ── Accent corner bar ──
    ctx.fillStyle = '#F5A800';
    ctx.fillRect(60, 56, 60, 4);

    // ── Header text ──
    ctx.fillStyle = '#F5A800';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('MY SHOWE MEMORY', 60, 86);
    ctx.letterSpacing = '0px';

    // ── Photo ──
    const hasPhoto = !!imagePreview;
    const photoY = 108;
    const photoH = hasPhoto ? 460 : 0;

    if (hasPhoto) {
      const img = new Image();
      img.src = imagePreview!;
      await new Promise<void>((resolve) => { img.onload = () => resolve(); img.onerror = () => resolve(); });

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(60, photoY, 680, photoH, 18);
      ctx.clip();

      const scale = Math.max(680 / img.width, photoH / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const sx = 60 + (680 - sw) / 2;
      const sy = photoY + (photoH - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);

      // gradient vignette at bottom of photo
      const vign = ctx.createLinearGradient(60, photoY + photoH - 120, 60, photoY + photoH);
      vign.addColorStop(0, 'rgba(1,26,29,0)');
      vign.addColorStop(1, 'rgba(1,26,29,0.65)');
      ctx.fillStyle = vign;
      ctx.fillRect(60, photoY, 680, photoH);
      ctx.restore();
    }

    // ── Memory text ──
    const textStartY = hasPhoto ? photoY + photoH + 50 : 160;

    // opening quote
    ctx.fillStyle = 'rgba(245,168,0,0.35)';
    ctx.font = 'italic 72px Georgia, serif';
    ctx.fillText('\u201C', 52, textStartY + 8);

    // memory body
    ctx.fillStyle = '#FBFAF7';
    ctx.font = '400 26px Georgia, serif';
    const lastY = wrapText(ctx, text || block.placeholder, 88, textStartY + 12, 624, 40);

    // closing quote
    ctx.fillStyle = 'rgba(245,168,0,0.35)';
    ctx.font = 'italic 72px Georgia, serif';
    ctx.fillText('\u201D', 680, lastY + 48);

    // ── Divider ──
    const divY = lastY + 100;
    const divGrad = ctx.createLinearGradient(60, divY, 740, divY);
    divGrad.addColorStop(0, 'rgba(245,168,0,0)');
    divGrad.addColorStop(0.5, 'rgba(245,168,0,0.45)');
    divGrad.addColorStop(1, 'rgba(245,168,0,0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(60, divY); ctx.lineTo(740, divY); ctx.stroke();

    // ── Branding ──
    const brandY = divY + 42;
    const logoImg = new Image();
    logoImg.src = '/favicon.ico';
    await new Promise<void>((resolve) => { logoImg.onload = () => resolve(); logoImg.onerror = () => resolve(); });

    if (logoImg.complete && logoImg.naturalWidth > 0) {
      // Draw logo with rounded background
      ctx.save();
      ctx.fillStyle = 'rgba(245,168,0,0.15)';
      ctx.beginPath(); ctx.roundRect(58, brandY - 18, 36, 36, 8); ctx.fill();
      ctx.drawImage(logoImg, 62, brandY - 14, 28, 28);
      ctx.restore();
    }

    const logoOffset = (logoImg.complete && logoImg.naturalWidth > 0) ? 106 : 60;
    ctx.fillStyle = '#FBFAF7';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('Showe', logoOffset, brandY + 8);

    ctx.fillStyle = 'rgba(251,250,247,0.4)';
    ctx.font = '400 14px system-ui, sans-serif';
    ctx.fillText('Captured at the event', logoOffset, brandY + 28);

    // Timestamp right side
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(251,250,247,0.3)';
    ctx.font = '400 13px system-ui, sans-serif';
    ctx.fillText(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), 740, brandY + 8);
    ctx.textAlign = 'left';

    setGeneratedCard(canvas.toDataURL('image/png'));
    setGenerating(false);
  };

  const downloadCard = () => {
    if (!generatedCard) return;
    const a = document.createElement('a');
    a.href = generatedCard;
    a.download = 'my-showe-memory.png';
    a.click();
  };

  const hasContent = text.trim().length > 0 || !!imagePreview;

  if (generatedCard) {
    return (
      <div className="rounded-xl border border-line overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary-700 p-4 border-b border-line/50 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <Sparkles size={13} className="text-accent" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-accent uppercase tracking-wider">Memory Created!</div>
            <p className="text-[11.5px] text-ink-inverse/70">{block.success_message}</p>
          </div>
        </div>
        <div className="p-4 bg-surface-raised space-y-3">
          <img src={generatedCard} alt="Your Showe memory" className="w-full rounded-xl shadow-large border border-line/50" />
          <button
            onClick={(e) => { e.stopPropagation(); downloadCard(); }}
            className="w-full rounded-full bg-primary text-ink-inverse h-11 font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-medium hover:shadow-large hover:scale-[1.01]"
          >
            <Download size={14} /> Save Memory
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setGeneratedCard(null); setText(''); setImagePreview(null); }}
            className="w-full rounded-full border border-line text-ink-muted h-9 font-semibold text-[12px] hover:border-line-strong hover:text-ink transition-colors"
          >
            Create Another
          </button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary-800 p-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-accent/10" />
        <div className="absolute bottom-0 left-1/2 w-40 h-1 bg-accent/30 blur-sm" />
        <div className="relative z-[1]">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={12} className="text-accent" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Memory Capture</span>
          </div>
          <h3 className="font-display font-bold text-ink-inverse leading-tight text-[16px]">{block.title}</h3>
          <p className="text-[12px] text-ink-inverse/65 mt-1 leading-relaxed">{block.prompt}</p>
        </div>
      </div>

      <div className="p-4 bg-surface-raised space-y-3">
        <input type="file" accept="image/*" ref={fileRef} onChange={handleImageFile} className="hidden" />

        {/* Photo upload */}
        {block.allow_image && (
          imagePreview ? (
            <div
              className="relative rounded-xl overflow-hidden border border-line group cursor-pointer"
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
            >
              <img src={imagePreview} alt="" className="w-full aspect-[4/3] object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-[12px] font-bold transition-opacity flex items-center gap-1.5 bg-black/50 rounded-full px-3 py-1.5">
                  <Camera size={13} /> Change photo
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <XIcon size={10} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-line hover:border-primary bg-surface-sunken hover:bg-primary/5 flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-surface-raised group-hover:bg-primary/10 border border-line flex items-center justify-center transition-colors">
                <Camera size={22} className="text-ink-faint group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <div className="text-[13px] font-bold text-ink-muted group-hover:text-primary transition-colors">Add your photo</div>
                <div className="text-[11px] text-ink-faint mt-0.5">Tap to choose from your gallery</div>
              </div>
            </button>
          )
        )}

        {/* Text input */}
        {block.allow_text && (
          <div className="relative">
            <textarea
              rows={3}
              placeholder={block.placeholder}
              value={text}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface-base p-3 text-sm outline-none focus:border-primary transition-colors resize-none"
            />
            <div className="absolute bottom-2 right-3 text-[10px] text-ink-faint">{text.length} chars</div>
          </div>
        )}

        {/* Generate button */}
        {(block.allow_text || block.allow_image) && (
          <button
            type="button"
            disabled={!hasContent || generating}
            onClick={(e) => { e.stopPropagation(); generateMemoryCard(); }}
            className={`w-full rounded-full h-11 font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${hasContent && !generating
              ? 'bg-gradient-to-r from-primary to-primary-700 text-ink-inverse shadow-medium hover:shadow-large hover:scale-[1.01]'
              : 'bg-surface-sunken text-ink-faint border border-line cursor-not-allowed'
              }`}
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-ink-inverse/30 border-t-ink-inverse rounded-full animate-spin" />
                Generating card...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                {block.submit_label || 'Create my memory'}
              </>
            )}
          </button>
        )}

        <p className="text-[10.5px] text-ink-faint text-center">{block.privacy_note}</p>
      </div>

      <canvas ref={canvasRef} className="hidden" />
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
  const allMocks = [
    ...MOCK_RECOMMENDATION.nearby_restaurants.map(m => ({ ...m, _tag: 'Restaurant', _icon: Utensils, _color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' })),
    ...MOCK_RECOMMENDATION.nearby_hotels.map(m => ({ ...m, _tag: 'Hotel', _icon: BedDouble, _color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' })),
    ...MOCK_RECOMMENDATION.nearby_bars.map(m => ({ ...m, _tag: 'Bar', _icon: Wine, _color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' })),
  ];

  const selectedIds = block.selected_items || [];
  const displayItems = selectedIds.length > 0
    ? allMocks.filter(item => selectedIds.includes(item.id))
    : allMocks.slice(0, 2);
  console.log(displayItems)
  return (
    <div>
      <div className="eyebrow mb-3">{block.title}</div>
      <ul className="space-y-2.5 flex flex-col">
        {displayItems.map((s) => {
          const Icon = s._icon;
          return (
            <a key={s.id} href={s?.url} target="_blank" rel="noopener noreferrer" className=' '>
              <li className="flex items-center gap-3 rounded-xl border border-line bg-surface-raised p-2.5">
                <img src={s.image} alt={s.name} className="w-14 h-14 rounded-lg object-cover shadow-sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-ink text-sm truncate">{s.name}</div>
                    <div className={`shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider ${s._color}`}>
                      <Icon size={10} strokeWidth={2.5} />
                      {s._tag}
                    </div>
                  </div>
                  <div className="text-[11px] text-ink-faint">{(s as any).category || (s as any).type}</div>
                  <div className="text-[11px] text-ink-muted mt-0.5 flex items-center gap-2">
                    {block.show_rating && (
                      <span className="inline-flex items-center gap-0.5 font-medium text-ink">
                        <Star size={10} className="text-accent fill-accent" />
                        <span className="tabular">{s.rating}</span>
                      </span>
                    )}
                    {block.show_distance && <span>· {s.distance}</span>}
                  </div>
                </div>
              </li>
            </a>
          );
        })}
        {displayItems.length === 0 && (
          <div className="text-sm text-ink-muted p-4 border border-dashed border-line rounded-xl text-center">
            Select items to display
          </div>
        )}
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

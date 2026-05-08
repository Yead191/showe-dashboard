import { Link } from 'react-router-dom';
import { Sparkles, Layers } from 'lucide-react';
import { Button } from 'antd';
import { PageHeader, } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META } from '@/constants/tiers';

export default function ProgrammesPage() {
  const tier = useAuthStore((s) => s.user?.tier);
  const meta = tier ? TIER_META[tier] : null;

  return (
    <>
      <PageHeader
        eyebrow="Programmes"
        title="Programme workshop"
        description="Build, edit and publish digital programmes attached to your events."
      />

      {/* Coming soon card */}
      <div className="relative rounded-2xl overflow-hidden mb-7 panel-deep p-8 md:p-10">
        <div className="relative z-[1] grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-ink text-[11px] font-bold uppercase tracking-wider mb-5">
              <Sparkles size={12} /> Coming soon
            </div>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink-inverse leading-[1.05]">
              The programme workshop is{' '}
              <span className="text-accent italic font-medium">on its way.</span>
            </h2>
            <p className="mt-4 text-ink-inverse/75 text-[15px] leading-relaxed max-w-md">
              Drag-and-drop blocks. Module-based design. Live mobile preview. Animation specs and analytics
              hooks built in. We’re polishing the workshop now — your existing programmes will migrate
              automatically.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/owner/events">
                <Button type="primary">Manage events instead</Button>
              </Link>
              <Button ghost style={{ color: '#F9F8F4', borderColor: 'rgba(255,255,255,0.25)' }}>
                Get notified when it launches
              </Button>
            </div>

            {meta && (
              <div className="mt-8 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/8 border border-white/10">
                <Layers size={14} className="text-accent" />
                <span className="text-sm text-ink-inverse/85">
                  Your tier <span className="font-semibold text-ink-inverse">{meta.label}</span> will unlock{' '}
                  <span className="font-semibold text-accent">{meta.modules.length} modules</span>.
                </span>
              </div>
            )}
          </div>

          {/* Decorative module preview */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-6 bg-accent/10 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl bg-surface-raised border border-white/10 p-5 shadow-large rotate-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="eyebrow !text-primary">Module 1 · Foundation</div>
                  <span className="chip chip-primary">Active</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Cover block', tag: 'Cover' },
                    { label: 'Welcome note', tag: 'Text' },
                    { label: 'Schedule block', tag: 'Schedule' },
                    { label: 'Accessibility', tag: 'Info' },
                  ].map((b) => (
                    <div
                      key={b.label}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-surface-sunken"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm font-semibold text-ink">{b.label}</span>
                      </div>
                      <span className="chip">{b.tag}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full rounded-xl border-2 border-dashed border-line py-2.5 text-[12.5px] font-semibold text-ink-muted">
                  + Add block
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats from existing programmes */}
      {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Programmes" value={String(totals.programmes)} icon={BookOpen} accent="primary" />
        <StatCard label="Total downloads" value={formatNumber(totals.downloads)} icon={Eye} accent="info" />
        <StatCard label="Avg dwell" value="2m 22s" icon={Clock} accent="success" />
        <StatCard label="Revenue" value={formatGBP(totals.revenue, { compact: true })} icon={MousePointerClick} accent="amber" />
      </div> */}

      {/* Existing programme list (read-only) */}
      {/* <Panel
        className="mt-6"
        title="Existing programmes"
        description="Programmes already attached to your events. The workshop will let you edit these once live."
      >
        {programmes.length === 0 ? (
          <p className="text-sm text-ink-muted py-6 text-center">No programmes yet.</p>
        ) : (
          <ul className="divide-y divide-line -m-1">
            {programmes.map((p) => (
              <li key={p.id} className="flex items-center gap-4 p-3 rounded-xl">
                <img
                  src={p.cover_image}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover bg-surface-sunken"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink truncate">{p.title}</div>
                  <div className="text-[12.5px] text-ink-muted mt-0.5">
                    {p.pages_count} pages · {p.is_free ? 'Free' : formatGBP(p.price_pence / 100)}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-right">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">Downloads</div>
                    <div className="font-display font-bold tabular text-ink">{formatNumber(p.downloads)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">Revenue</div>
                    <div className="font-display font-bold tabular text-ink">{formatGBP(p.revenue, { compact: true })}</div>
                  </div>
                </div>
                <span className="chip chip-primary ml-2">Locked</span>
              </li>
            ))}
          </ul>
        )}
      </Panel> */}
    </>
  );
}

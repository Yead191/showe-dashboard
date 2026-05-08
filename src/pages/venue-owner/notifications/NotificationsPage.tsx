import { useState } from 'react';
import { Send, Lock, Users, Calendar as CalIcon, Sparkles } from 'lucide-react';
import { Button } from 'antd';
import { toast } from 'sonner';
import { PageHeader, Panel, StatCard } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META } from '@/constants/tiers';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const tier = useAuthStore((s) => s.user?.tier);
  const unlocked = tier === 'tier_3' || tier === 'tier_3_plus';
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');

  if (!unlocked) {
    return (
      <>
        <PageHeader eyebrow="Push notifications" title="Reach your audience" description="Send push notifications to programme holders." />
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
                pre-show reminders, or post-show thanks. You’re currently on{' '}
                <span className="font-semibold text-ink">{tier ? TIER_META[tier].label : 'a starter tier'}</span>.
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
      <PageHeader eyebrow="Push notifications" title="Reach your audience" description="Send push notifications to programme holders." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7 stagger">
        <StatCard label="Subscribed users" value="3,420" icon={Users} accent="primary" />
        <StatCard label="Sent this month" value="12" icon={Send} accent="info" />
        <StatCard label="Open rate" value="38%" delta={4.2} icon={Sparkles} accent="amber" />
        <StatCard label="Avg time to read" value="2m 14s" icon={CalIcon} accent="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel className="lg:col-span-2" title="Compose notification">
          <div className="space-y-4">
            <div>
              <label className="field-label">Audience</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-sunken rounded-full border border-line">
                {[
                  { v: 'all', label: 'All programme holders' },
                  { v: 'event', label: 'A specific event' },
                  { v: 'venue', label: 'A specific venue' },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setAudience(o.v)}
                    className={cn(
                      'h-9 rounded-full text-[12.5px] font-semibold transition-all',
                      audience === o.v ? 'bg-primary text-ink-inverse' : 'text-ink-muted hover:text-ink'
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tonight’s curtain time"
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
                placeholder="Quick note: tonight’s show starts at 19:30 — doors at 19:00."
                className="input-base !h-auto py-3 leading-relaxed"
                maxLength={140}
              />
              <div className="mt-1.5 text-[11px] text-ink-faint">{body.length}/140</div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-line">
              <span className="text-sm text-ink-muted">Reaches ~3,420 users</span>
              <div className="flex gap-2">
                <Button>Schedule for later</Button>
                <Button
                  type="primary"
                  icon={<Send size={13} />}
                  onClick={() => {
                    if (!title.trim() || !body.trim()) {
                      toast.error('Add a title and body first.');
                      return;
                    }
                    toast.success('Notification sent (mock).');
                    setTitle('');
                    setBody('');
                  }}
                >
                  Send now
                </Button>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Preview" description="How it looks on a phone">
          <div className="rounded-2xl border border-line bg-surface-sunken p-4">
            <div className="rounded-xl bg-surface-raised p-3 shadow-soft">
              <div className="flex items-center gap-2 text-[11px] text-ink-faint mb-2">
                <span className="w-4 h-4 rounded bg-primary text-ink-inverse flex items-center justify-center text-[8px] font-bold">
                  S
                </span>
                SHOWE · now
              </div>
              <div className="font-semibold text-ink text-[14px]">{title || 'Notification title'}</div>
              <p className="text-[13px] text-ink-muted mt-0.5 leading-snug">
                {body || 'Your notification body will appear here.'}
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

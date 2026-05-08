import { Lock, Eye, Clock, MousePointerClick, Download, Heart, Send, Megaphone, RotateCw } from 'lucide-react';
import { Tabs, Button } from 'antd';
import { useState } from 'react';
import { PageHeader, Panel, StatCard, SectionTitle } from '@/components/ui';
import { TrendChart } from '@/components/charts/TrendChart';
import { BarsChart } from '@/components/charts/BarsChart';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META } from '@/constants/tiers';
import { mockViewsTrend, mockDwellTrend, mockRevenueTrend } from '@/constants/mock-data';
import { formatGBP, formatNumber, formatDwell } from '@/lib/utils';

export default function AnalyticsPage() {
  const tier = useAuthStore((s) => s.user?.tier);
  const [tab, setTab] = useState('basic');

  const isAdvancedUnlocked = tier === 'tier_2' || tier === 'tier_3' || tier === 'tier_3_plus';

  return (
    <>
      <PageHeader
        eyebrow="Insight"
        title="Analytics"
        description="Audience behaviour across your live programmes. Advanced metrics unlock with Tier 2 Engage and above."
      />

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: 'basic', label: 'Basic' },
          {
            key: 'advanced',
            label: (
              <span className="inline-flex items-center gap-1.5">
                Advanced
                {!isAdvancedUnlocked && <Lock size={11} />}
              </span>
            ),
          },
        ]}
        className="mb-5"
      />

      {tab === 'basic' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            <StatCard label="Views" value={formatNumber(18420)} delta={12.4} icon={Eye} accent="primary" />
            <StatCard label="Avg dwell" value={formatDwell(142)} delta={4.8} icon={Clock} accent="info" />
            <StatCard label="Clicks" value={formatNumber(6280)} delta={18.1} icon={MousePointerClick} accent="success" />
            <StatCard label="Downloads" value={formatNumber(2018)} delta={-2.3} icon={Download} accent="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            <Panel className="lg:col-span-2" title="Views, last 7 days">
              <TrendChart data={mockViewsTrend} formatter={formatNumber} height={260} />
            </Panel>
            <Panel title="Avg dwell time">
              <TrendChart data={mockDwellTrend} color="info" formatter={(v) => `${v}s`} height={260} />
            </Panel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            <Panel className="lg:col-span-2" title="Programme revenue, last 7 days">
              <BarsChart data={mockRevenueTrend} formatter={(v) => formatGBP(v)} height={260} highlight={5} />
            </Panel>
            <Panel title="Top sources">
              <ul className="space-y-3">
                {[
                  { label: 'QR scans at venue', value: 64 },
                  { label: 'Direct link', value: 22 },
                  { label: 'Email', value: 9 },
                  { label: 'Social shares', value: 5 },
                ].map((s) => (
                  <li key={s.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-ink-muted">{s.label}</span>
                      <span className="font-display font-bold tabular text-ink">{s.value}%</span>
                    </div>
                    <div className="h-2 bg-surface-sunken rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${s.value}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </>
      )}

      {tab === 'advanced' &&
        (isAdvancedUnlocked ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
              <StatCard label="Content interactions" value={formatNumber(8420)} delta={22.4} icon={MousePointerClick} accent="primary" />
              <StatCard label="Favourites" value={formatNumber(1240)} delta={8.1} icon={Heart} accent="amber" />
              <StatCard label="Sponsor clicks" value={formatNumber(640)} delta={14.2} icon={Megaphone} accent="info" />
              <StatCard label="Revisit rate" value="32%" delta={3.4} icon={RotateCw} accent="success" />
            </div>

            <Panel className="mt-6" title="Timed responses (Module 4 & 4+)" description="Tap reactions captured during performances">
              <BarsChart
                data={[
                  { date: 'Awe', value: 1240 },
                  { date: 'Tense', value: 980 },
                  { date: 'Moved', value: 1480 },
                  { date: 'Surprised', value: 720 },
                  { date: 'Joyful', value: 540 },
                ]}
                formatter={formatNumber}
                height={240}
                highlight={2}
              />
            </Panel>

            <Panel className="mt-4" title="Follow actions" description="What users did after closing the programme">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Followed venue', value: '24%', icon: Send },
                  { label: 'Saved for later', value: '18%', icon: Heart },
                  { label: 'Shared programme', value: '12%', icon: Send },
                  { label: 'Returned next day', value: '32%', icon: RotateCw },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl bg-surface-sunken p-4">
                    <m.icon size={14} className="text-ink-faint mb-2" />
                    <div className="font-display font-extrabold text-2xl tabular text-ink leading-none">{m.value}</div>
                    <div className="text-[12px] text-ink-muted mt-1">{m.label}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        ) : (
          <LockedAdvanced tier={tier} />
        ))}
    </>
  );
}

function LockedAdvanced({ tier }: { tier?: string }) {
  const meta = tier ? TIER_META[tier as keyof typeof TIER_META] : null;
  return (
    <Panel padded={false} className="overflow-hidden">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-0">
        <div className="p-8 md:p-10">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 text-[#8A5C00] flex items-center justify-center mb-5">
            <Lock size={20} />
          </div>
          <div className="eyebrow mb-2">Tier-gated</div>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-ink leading-tight">
            Advanced analytics is on Tier 2 Engage and above.
          </h2>
          <p className="mt-3 text-ink-muted">
            You’re currently on{' '}
            <span className="font-semibold text-ink">{meta?.label ?? 'a starter tier'}</span>. Upgrade to unlock content interactions, favourites, follow actions, sponsor clicks, timed responses (Module 4 & 4+) and revisit behaviour.
          </p>
          <div className="mt-6 flex gap-2">
            <Button type="primary">Upgrade to Tier 2</Button>
            <Button>Compare tiers</Button>
          </div>
        </div>
        <div className="bg-surface-sunken p-8 md:p-10 border-l border-line">
          <SectionTitle title="What you’ll unlock" />
          <ul className="space-y-3">
            {[
              'Content interactions — taps per block',
              'Favourites and saved programmes',
              'Follow actions (venue, host, programmes)',
              'Sponsor click-through tracking',
              'Timed responses (Module 4 & 4+)',
              'Revisit behaviour over 7 days',
              'Advanced reporting exports',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-ink">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

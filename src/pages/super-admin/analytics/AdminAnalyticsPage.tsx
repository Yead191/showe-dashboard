import { Eye, Users, ShoppingBag, Sparkles, Globe } from 'lucide-react';
import { PageHeader, Panel, StatCard } from '@/components/ui';
import { TrendChart } from '@/components/charts/TrendChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { mockViewsTrend, mockVenueOwners } from '@/constants';
import { TIER_META } from '@/constants/tiers';
import { formatGBP, formatNumber } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const tierCounts: Record<string, number> = {};
  for (const o of mockVenueOwners) tierCounts[o.tier] = (tierCounts[o.tier] ?? 0) + 1;
  const tierData = Object.entries(tierCounts).map(([k, v]) => ({
    name: TIER_META[k as keyof typeof TIER_META].short,
    value: v,
    color: TIER_META[k as keyof typeof TIER_META].color,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Insight"
        title="Platform analytics"
        description="Behaviour and growth across every venue and end-user on SHOWE."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Active end-users" value={formatNumber(2420)} delta={12.4} icon={Users} accent="primary" />
        <StatCard label="Programme views" value={formatNumber(184200)} delta={18.2} icon={Eye} accent="info" />
        <StatCard label="Programmes sold" value={formatNumber(1890)} delta={6.4} icon={ShoppingBag} accent="amber" />
        <StatCard label="Avg downloads/event" value="48" delta={4.8} icon={Sparkles} accent="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Panel className="lg:col-span-2" eyebrow="Last 7 days" title="Programme views, network-wide">
          <TrendChart data={mockViewsTrend} formatter={formatNumber} height={260} color="primary" name="Views" />
        </Panel>

        <Panel eyebrow="Distribution" title="Tier mix">
          <div className="flex items-center justify-center mb-2">
            <DonutChart
              data={tierData}
              centerLabel="Venues"
              centerValue={String(mockVenueOwners.length)}
              size={210}
            />
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Panel className="lg:col-span-2" eyebrow="By city" title="Top performing cities">
          <ul className="space-y-3">
            {[
              { label: 'London', revenue: 18420, share: 42 },
              { label: 'Bath', revenue: 12200, share: 28 },
              { label: 'Brighton', revenue: 5440, share: 12 },
              { label: 'Bristol', revenue: 3800, share: 9 },
              { label: 'Cardiff', revenue: 2120, share: 5 },
            ].map((c) => (
              <li key={c.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="inline-flex items-center gap-2">
                    <Globe size={12} className="text-ink-faint" />
                    <span className="font-medium text-ink">{c.label}</span>
                  </span>
                  <span className="font-display font-bold tabular text-ink">{formatGBP(c.revenue)}</span>
                </div>
                <div className="h-2 bg-surface-sunken rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${c.share}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel eyebrow="Revenue mix" title="Where money comes from">
          <DonutChart
            data={[
              { name: 'Subscriptions', value: 6840, color: '#014B52' },
              { name: 'Programme fees', value: 1240, color: '#F5A800' },
              { name: 'Sponsor revenue', value: 720, color: '#7A39BB' },
            ]}
            centerLabel="MRR + fees"
            centerValue={formatGBP(8800, { compact: true })}
            size={210}
          />
        </Panel>
      </div>
    </>
  );
}

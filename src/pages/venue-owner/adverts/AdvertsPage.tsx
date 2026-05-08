import { Megaphone, Lock, Plus, MoreHorizontal, ExternalLink } from 'lucide-react';
import { Button, Dropdown, Tabs } from 'antd';
import { PageHeader, Panel, StatCard, StatusBadge } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META } from '@/constants/tiers';
import { formatNumber, formatGBP } from '@/lib/utils';

export default function AdvertsPage() {
  const tier = useAuthStore((s) => s.user?.tier);
  const unlocked = tier === 'tier_2' || tier === 'tier_3' || tier === 'tier_3_plus';

  if (!unlocked) {
    return (
      <>
        <PageHeader
          eyebrow="Adverts"
          title="Sponsor & advertising"
          description="Sell sponsor slots inside your programmes."
        />
        <Panel padded>
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-[#8A5C00] flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <div className="eyebrow mb-2">Tier 2 Engage</div>
              <h2 className="font-display font-extrabold text-2xl text-ink">
                Adverts are unlocked from Tier 2 onwards.
              </h2>
              <p className="mt-2 text-ink-muted max-w-xl">
                Sell sponsor placements inside your programmes (Module 7). You’re on{' '}
                <span className="font-semibold text-ink">{tier ? TIER_META[tier].label : 'a starter tier'}</span>.
              </p>
              <div className="mt-5 flex gap-2">
                <Button type="primary">Upgrade tier</Button>
              </div>
            </div>
          </div>
        </Panel>
      </>
    );
  }

  const sponsors = [
    {
      id: 'spo_1',
      name: 'The Gilded Fork',
      slot: 'Cover sponsor · Hamlet',
      impressions: 4280,
      clicks: 312,
      revenue: 480,
      status: 'active' as const,
    },
    {
      id: 'spo_2',
      name: 'Bath Spa Hotel',
      slot: 'Footer · Midsummer',
      impressions: 1820,
      clicks: 92,
      revenue: 220,
      status: 'active' as const,
    },
    {
      id: 'spo_3',
      name: 'Harlem Coffee',
      slot: 'Cast page · New Voices',
      impressions: 940,
      clicks: 48,
      revenue: 90,
      status: 'pending' as const,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Adverts"
        title="Sponsor & advertising"
        description="Manage sponsor slots inside your programmes (Module 7)."
        actions={
          <Button type="primary" icon={<Plus size={14} />}>
            New sponsor slot
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7 stagger">
        <StatCard label="Active slots" value="6" icon={Megaphone} accent="primary" />
        <StatCard label="Impressions, 7 d" value={formatNumber(7040)} delta={12.4} icon={ExternalLink} accent="info" />
        <StatCard label="Click-throughs" value={formatNumber(452)} delta={8.2} icon={ExternalLink} accent="amber" />
        <StatCard label="Sponsor revenue" value={formatGBP(790)} delta={14.4} icon={ExternalLink} accent="success" />
      </div>

      <Panel padded={false}>
        <div className="px-5 pt-4 border-b border-line">
          <Tabs items={[{ key: 'all', label: 'All slots' }, { key: 'active', label: 'Active' }, { key: 'pending', label: 'Pending' }]} />
        </div>
        <ul className="divide-y divide-line">
          {sponsors.map((s) => (
            <li key={s.id} className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-surface-sunken flex items-center justify-center text-ink-muted">
                <Megaphone size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink">{s.name}</div>
                <div className="text-[12.5px] text-ink-muted mt-0.5">{s.slot}</div>
              </div>
              <div className="hidden md:flex items-center gap-8 text-right">
                <Stat label="Impressions" value={formatNumber(s.impressions)} />
                <Stat label="Clicks" value={formatNumber(s.clicks)} />
                <Stat label="Revenue" value={formatGBP(s.revenue)} />
              </div>
              <StatusBadge status={s.status} />
              <Dropdown
                menu={{ items: [{ key: 'edit', label: 'Edit' }, { key: 'pause', label: 'Pause' }] }}
                trigger={['click']}
              >
                <Button type="text" icon={<MoreHorizontal size={15} />} />
              </Dropdown>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">{label}</div>
      <div className="font-display font-bold tabular text-ink text-sm leading-tight mt-0.5">{value}</div>
    </div>
  );
}

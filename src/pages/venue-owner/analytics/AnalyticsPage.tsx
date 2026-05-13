import { useState } from 'react';
import { Eye, Clock, MousePointerClick, Download, } from 'lucide-react';
import { PageHeader, Panel, StatCard, } from '@/components/ui';
import { TrendChart } from '@/components/charts/TrendChart';
import { BarsChart } from '@/components/charts/BarsChart';
import { mockViewsTrend, mockDwellTrend, mockRevenueTrend } from '@/constants/mock-data';
import { formatGBP, formatNumber, formatDwell } from '@/lib/utils';
import { useProgrammesStore } from '@/features/programmes/store/programmes.store';
import { Select } from 'antd';

export default function AnalyticsPage() {
  const allProgrammes = useProgrammesStore((s) => s.programmes);
  const [programmeId, setProgrammeId] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('7d');

  const programmeOptions = [
    { label: 'All programmes', value: 'all' },
    ...Object.values(allProgrammes).map(p => ({ label: p.title, value: p.id }))
  ];

  const timeframeOptions = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'This year', value: '1y' }
  ];

  const timeframeLabel = timeframeOptions.find(t => t.value === timeframe)?.label.toLowerCase();

  return (
    <>
      <PageHeader
        eyebrow="Insight"
        title="Analytics"
        description="Audience behaviour across your live programmes. Advanced metrics unlock with Tier 2 Engage and above."
        actions={
          <>
            <Select 
              value={programmeId} 
              onChange={setProgrammeId} 
              options={programmeOptions} 
              className="w-48" 
              popupMatchSelectWidth={false}
            />
            <Select 
              value={timeframe} 
              onChange={setTimeframe} 
              options={timeframeOptions} 
              className="w-36" 
            />
          </>
        }
      />

      <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          <StatCard label="Views" value={formatNumber(18420)} delta={12.4} icon={Eye} accent="primary" />
          <StatCard label="Avg dwell" value={formatDwell(142)} delta={4.8} icon={Clock} accent="info" />
          <StatCard label="Clicks" value={formatNumber(6280)} delta={18.1} icon={MousePointerClick} accent="success" />
          <StatCard label="Downloads" value={formatNumber(2018)} delta={-2.3} icon={Download} accent="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <Panel className="lg:col-span-2" title={`Views, ${timeframeLabel}`}>
            <TrendChart data={mockViewsTrend} formatter={formatNumber} height={260} />
          </Panel>
          <Panel title="Avg dwell time">
            <TrendChart data={mockDwellTrend} color="info" formatter={(v) => `${v}s`} height={260} />
          </Panel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <Panel className="lg:col-span-2" title={`Programme revenue, ${timeframeLabel}`}>
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
    </>
  );
}


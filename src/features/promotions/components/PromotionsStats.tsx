import { Megaphone, Eye, MousePointerClick, PoundSterling, Trophy } from 'lucide-react';
import { StatCard } from '@/components/ui';
import { formatNumber, formatGBP } from '@/lib/utils';
import type { AdsAnalytics } from '@/store/api/organizationApi/adsApi';
import type { Ad } from '../types';

interface PromotionsStatsProps {
  analytics?: AdsAnalytics;
  ads: Ad[];
  isLoading?: boolean;
}

export function PromotionsStats({ analytics, ads, isLoading }: PromotionsStatsProps) {
  const activeCount = analytics?.activeAdsCount ?? ads.filter((a) => a.active).length;
  const totalImpressions = analytics?.totalImpressions ?? 0;
  const totalClicks = analytics?.totalClicks ?? 0;
  const totalViews = analytics?.totalViews ?? 0;
  const totalRevenue = analytics?.totalRevenue ?? 0;

  const topAd = ads.length > 0
    ? ads.reduce((best, a) => (a.clicks > best.clicks ? a : best), ads[0])
    : null;

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-5 gap-4 mb-7 stagger ${isLoading ? 'opacity-70' : ''}`}>
      <StatCard
        label="Active ads"
        value={activeCount.toString()}
        icon={Megaphone}
        accent="primary"
      />
      <StatCard
        label="Impressions"
        value={formatNumber(totalImpressions)}
        icon={Eye}
        accent="info"
      />
      <StatCard
        label="Total views"
        value={formatNumber(totalViews)}
        icon={Eye}
        accent="purple"
      />
      <StatCard
        label="Click-throughs"
        value={formatNumber(totalClicks)}
        icon={MousePointerClick}
        accent="amber"
      />
      <StatCard
        label="Sponsor revenue"
        value={formatGBP(totalRevenue)}
        icon={PoundSterling}
        accent="success"
      />

      {topAd && (
        <div className="col-span-2 lg:col-span-5 rounded-2xl border border-line bg-surface-raised p-4 flex items-center gap-4 transition-all duration-300 hover:shadow-medium hover:-translate-y-0.5">
          <span className="inline-flex items-center justify-center rounded-full w-10 h-10 bg-[#FFB30014] text-[#8A5C00] shrink-0">
            <Trophy size={18} strokeWidth={2.25} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="eyebrow !text-ink-faint mb-0.5">Top performing ad · most clicks</p>
            <p className="font-semibold text-ink truncate">{topAd.title}</p>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-right shrink-0">
            <TopStat label="Clicks" value={formatNumber(topAd.clicks)} />
            <TopStat label="Views" value={formatNumber(topAd.views)} />
            <TopStat label="Impressions" value={formatNumber(topAd.impressions)} />
          </div>
        </div>
      )}
    </div>
  );
}

function TopStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[70px]">
      <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">{label}</div>
      <div className="font-display font-bold tabular text-ink text-sm leading-tight mt-0.5">{value}</div>
    </div>
  );
}

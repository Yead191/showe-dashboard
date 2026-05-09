import { Megaphone, ExternalLink } from 'lucide-react';
import { StatCard } from '@/components/ui';
import { formatNumber, formatGBP } from '@/lib/utils';
import type { Sponsor } from '../types';

interface PromotionsStatsProps {
  sponsors: Sponsor[];
}

export function PromotionsStats({ sponsors }: PromotionsStatsProps) {
  const activeCount = sponsors.filter(s => s.status === 'active').length;
  const totalImpressions = sponsors.reduce((acc, s) => acc + s.impressions, 0);
  const totalClicks = sponsors.reduce((acc, s) => acc + s.clicks, 0);
  const totalRevenue = sponsors.reduce((acc, s) => acc + s.revenue, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7 stagger">
      <StatCard label="Active slots" value={activeCount.toString()} icon={Megaphone} accent="primary" />
      <StatCard 
        label="Impressions, 7 d" 
        value={formatNumber(totalImpressions)} 
        delta={12.4} 
        icon={ExternalLink} 
        accent="info" 
      />
      <StatCard 
        label="Click-throughs" 
        value={formatNumber(totalClicks)} 
        delta={8.2} 
        icon={ExternalLink} 
        accent="amber" 
      />
      <StatCard 
        label="Sponsor revenue" 
        value={formatGBP(totalRevenue)} 
        delta={14.4} 
        icon={ExternalLink} 
        accent="success" 
      />
    </div>
  );
}

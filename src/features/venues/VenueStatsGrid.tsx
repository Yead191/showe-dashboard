import { Calendar, Download, FolderKanban, PoundSterling } from 'lucide-react';
import type { Venue } from '@/types/venue';
import { StatCard } from '@/components/ui';
import { formatGBP, formatNumber } from '@/lib/utils';

interface VenueStatsGridProps {
  venue: Venue;
}

export function VenueStatsGrid({ venue }: VenueStatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Events"
        value={formatNumber(venue.events_count)}
        icon={Calendar}
        accent="primary"
      />
      <StatCard
        label="Programmes"
        value={formatNumber(venue.programmes_count)}
        icon={FolderKanban}
        accent="info"
      />
      <StatCard
        label="Downloads"
        value={formatNumber(venue.total_downloads, true)}
        icon={Download}
        accent="purple"
      />
      <StatCard
        label="Revenue"
        value={formatGBP(venue.total_revenue, { compact: true })}
        icon={PoundSterling}
        accent="success"
      />
    </div>
  );
}

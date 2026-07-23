import { Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowUpRight,
  Calendar,
  Download,
  MapPin,
  MoreHorizontal,
} from 'lucide-react';
import type { Venue } from '@/types/venue';
import { TierBadge, StatusBadge } from '@/components/ui';
import { formatGBP, formatNumber } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { getImageUrl } from '@/helpers/getImageUrl';

interface VenueCardProps {
  venue: Venue;
  onEdit: (venue: Venue) => void;
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-1 text-ink-faint text-[11px] uppercase tracking-wider font-bold mb-1">
        <Icon size={11} /> {label}
      </div>
      <div className="font-display font-extrabold text-base text-ink tabular leading-tight">
        {value}
      </div>
    </div>
  );
}

export function VenueCard({ venue, onEdit }: VenueCardProps) {
  const navigate = useNavigate();
  const setActiveVenueId = useAuthStore((s) => s.setActiveVenueId);

  const goToDetail = () => navigate(`/owner/venues/${venue.id}`);

  return (
    <article className="group relative rounded-2xl border border-line bg-surface-raised overflow-hidden shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-300 ease-smooth">
      <div className="relative h-40 overflow-hidden">
        <img
          src={getImageUrl(venue.cover_image)}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-smooth"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <TierBadge tier={venue.tier} showFull />
        </div>
        <div className="absolute top-3 right-3">
          <Dropdown
            menu={{
              items: [
                { key: 'view', label: 'View venue page' },
                { key: 'edit', label: 'Edit details' },
                { key: 'switch', label: 'Set as active venue' },
                { type: 'divider' },
                { key: 'archive', label: 'Archive', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'view') {
                  goToDetail();
                } else if (key === 'edit') {
                  onEdit(venue);
                } else if (key === 'switch') {
                  setActiveVenueId(venue.id);
                  toast.success(`Switched to ${venue.name}`);
                }
              },
            }}
            trigger={['click']}
          >
            <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-ink hover:bg-white transition-colors">
              <MoreHorizontal size={15} />
            </button>
          </Dropdown>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="text-ink-inverse">
            <h3 className="font-display font-extrabold text-lg leading-tight drop-shadow">
              {venue.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[12.5px] mt-0.5 text-white/85">
              <MapPin size={11} />
              {venue.address_line1}, {venue.city}
            </div>
          </div>
          <StatusBadge status={venue.status} />
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-3 gap-4">
          <Stat icon={Calendar} label="Events" value={formatNumber(venue.events_count)} />
          <Stat icon={Download} label="Downloads" value={formatNumber(venue.total_downloads, true)} />
          <Stat icon={ArrowUpRight} label="Revenue" value={formatGBP(venue.total_revenue, { compact: true })} />
        </div>

        <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
          <div className="text-[12px] text-ink-muted">
            {venue.programmes_count} programme{venue.programmes_count !== 1 ? 's' : ''}
          </div>
          <button
            onClick={goToDetail}
            className="text-[13px] font-semibold text-primary hover:text-primary-700 inline-flex items-center gap-1 hover:gap-1.5 transition-all"
          >
            Open <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}

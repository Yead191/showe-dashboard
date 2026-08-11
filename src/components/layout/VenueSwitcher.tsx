import { useMemo } from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Building2, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { TierBadge } from '@/components/ui/TierBadge';

export function VenueSwitcher() {
  const user = useAuthStore((s) => s.user);
  const setActiveVenueId = useAuthStore((s) => s.setActiveVenueId);
  const navigate = useNavigate();

  const venues = user?.venues ?? [];
  const activeVenue = venues.find((v) => v.id === user?.active_venue_id);

  const items: MenuProps['items'] = useMemo(() => {
    const base: MenuProps['items'] = [
      {
        key: 'all',
        label: (
          <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Building2 size={14} />
              </span>
              <div>
                <div className="font-semibold text-sm text-ink">All venues</div>
                <div className="text-[11px] text-ink-faint">
                  {venues.length} venue{venues.length !== 1 ? 's' : ''} · aggregate view
                </div>
              </div>
            </div>
            {!user?.active_venue_id && <Check size={14} className="text-accent" />}
          </div>
        ),
      },
      { type: 'divider' },
      ...venues.map((v) => ({
        key: v.id,
        label: (
          <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={v.cover_image}
                alt=""
                className="w-7 h-7 rounded-lg object-cover bg-surface-sunken"
              />
              <div className="min-w-0">
                <div className="font-semibold text-sm text-ink truncate max-w-[180px]">
                  {v.name}
                </div>
                <div className="text-[11px] text-ink-faint truncate">{v.city}</div>
              </div>
            </div>
            {v.id === user?.active_venue_id ? (
              <Check size={14} className="text-accent" />
            ) : (
              <TierBadge tier={v.tier} />
            )}
          </div>
        ),
      })),
      { type: 'divider' },
      {
        key: 'new',
        label: (
          <div className="flex items-center gap-2.5 py-1 text-primary font-semibold">
            <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus size={14} />
            </span>
            <span className="text-sm">Add a new venue</span>
          </div>
        ),
      },
    ];
    return base;
  }, [venues, user?.active_venue_id]);

  function onClick({ key }: { key: string }) {
    if (key === 'all') setActiveVenueId(null);
    else if (key === 'new') navigate('/owner/venues');
    else setActiveVenueId(key);
  }

  if (!user || user.role !== 'ORGANIZATION') return null;

  return (
    <Dropdown
      menu={{ items, onClick }}
      trigger={['click']}
      placement="bottomLeft"
      overlayStyle={{ minWidth: 320 }}
    >
      <button
        className={cn(
          'inline-flex items-center gap-2.5 h-10 pl-2 pr-3 rounded-full',
          'bg-surface-raised border border-line hover:border-line-strong shadow-soft',
          'transition-all duration-200 ease-smooth hover:-translate-y-px max-w-[280px]'
        )}
      >
        {activeVenue ? (
          <img
            src={activeVenue.cover_image}
            alt=""
            className="w-7 h-7 rounded-full object-cover bg-surface-sunken"
          />
        ) : (
          <span className="w-7 h-7 rounded-full bg-primary text-ink-inverse flex items-center justify-center">
            <Building2 size={13} />
          </span>
        )}
        <div className="text-left min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold leading-none">
            {activeVenue ? 'Venue' : 'Aggregate'}
          </div>
          <div className="text-sm font-semibold text-ink truncate leading-tight mt-0.5">
            {activeVenue?.name ?? 'All venues'}
          </div>
        </div>
        <ChevronsUpDown size={14} className="text-ink-faint shrink-0" />
      </button>
    </Dropdown>
  );
}

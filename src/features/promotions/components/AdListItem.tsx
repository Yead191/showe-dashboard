import { Megaphone, MoreHorizontal, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { Button, Dropdown } from 'antd';
import { formatNumber, formatGBP, formatDate } from '@/lib/utils';
import { getImageUrl } from '@/helpers/getImageUrl';
import type { Ad } from '../types';

interface AdListItemProps {
  ad: Ad;
  onView: (ad: Ad) => void;
  onEdit: (ad: Ad) => void;
  onToggleActive: (ad: Ad) => void;
  onDelete: (ad: Ad) => void;
}

export function AdListItem({ ad, onView, onEdit, onToggleActive, onDelete }: AdListItemProps) {
  const imageSrc = ad.imageUrl ? getImageUrl(ad.imageUrl) : '';

  return (
    <li className="flex items-center gap-4 p-4 hover:bg-surface-sunken/40 transition-colors group">
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-line bg-surface-sunken">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={ad.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-muted group-hover:text-primary group-hover:bg-primary/10 transition-colors">
            <Megaphone size={16} />
          </div>
        )}
      </div>

      {/* Title + URL */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink truncate">{ad.title}</div>
        <div className="flex items-center gap-1 mt-0.5 text-[12px] text-ink-muted truncate">
          <ExternalLink size={10} className="shrink-0" />
          <span className="truncate">{ad.redirectUrl}</span>
        </div>
        <div className="text-[11px] text-ink-faint mt-0.5 hidden sm:block">
          {formatDate(ad.startDate)} → {formatDate(ad.endDate)}
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6 text-right">
        {/* <Stat label="Impressions" value={formatNumber(ad.impressions)} /> */}
        <Stat label="Impressions" value={formatNumber(ad.views)} />
        <Stat label="Clicks" value={formatNumber(ad.clicks)} />
        <Stat label="Revenue" value={formatGBP(ad.revenue)} />
      </div>

      {/* Active badge */}
      <span
        className={`
          hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
          text-[11px] font-semibold uppercase tracking-wider shrink-0
          ${ad.active
            ? 'bg-[rgba(67,122,34,0.12)] text-[#437A22]'
            : 'bg-[rgba(40,37,29,0.08)] text-[#6C665D]'}
        `}
      >
        {ad.active
          ? <><CheckCircle2 size={11} /> Active</>
          : <><XCircle size={11} /> Inactive</>
        }
      </span>

      {/* Actions menu */}
      <Dropdown
        menu={{
          items: [
            { key: 'view', label: 'View details' },
            { key: 'edit', label: 'Edit ad' },
            { key: 'toggle', label: ad.active ? 'Deactivate' : 'Activate' },
            { type: 'divider' },
            { key: 'delete', label: 'Delete ad', danger: true },
          ],
          onClick: ({ key }) => {
            if (key === 'view') onView(ad);
            if (key === 'edit') onEdit(ad);
            if (key === 'toggle') onToggleActive(ad);
            if (key === 'delete') onDelete(ad);
          },
        }}
        trigger={['click']}
      >
        <Button type="text" icon={<MoreHorizontal size={15} />} className="shrink-0" />
      </Dropdown>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[72px]">
      <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">{label}</div>
      <div className="font-display font-bold tabular text-ink text-sm leading-tight mt-0.5">{value}</div>
    </div>
  );
}

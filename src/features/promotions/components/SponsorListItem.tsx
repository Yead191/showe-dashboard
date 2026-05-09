import { Megaphone, MoreHorizontal } from 'lucide-react';
import { Button, Dropdown } from 'antd';
import { StatusBadge } from '@/components/ui';
import { formatNumber, formatGBP } from '@/lib/utils';
import type { Sponsor } from '../types';

interface SponsorListItemProps {
  sponsor: Sponsor;
  onEdit: (s: Sponsor) => void;
  onPause: (s: Sponsor) => void;
}

export function SponsorListItem({
  sponsor: s,
  onEdit,
  onPause,
}: SponsorListItemProps) {
  return (
    <li className="flex items-center gap-4 p-4 hover:bg-surface-sunken/40 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-surface-sunken flex items-center justify-center text-ink-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <Megaphone size={16} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink truncate">{s.name}</div>
        <div className="text-[12.5px] text-ink-muted mt-0.5 truncate">{s.slot}</div>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-right">
        <Stat label="Impressions" value={formatNumber(s.impressions)} />
        <Stat label="Clicks" value={formatNumber(s.clicks)} />
        <Stat label="Revenue" value={formatGBP(s.revenue)} />
      </div>
      
      <StatusBadge status={s.status} className="shrink-0" />
      
      <Dropdown
        menu={{ 
          items: [
            { key: 'edit', label: 'Edit campaign' }, 
            { 
              key: 'pause', 
              label: s.status === 'active' ? 'Pause slot' : 'Resume slot',
              danger: s.status === 'active' 
            }
          ],
          onClick: ({ key }) => {
            if (key === 'edit') onEdit(s);
            if (key === 'pause') onPause(s);
          }
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
    <div className="min-w-[80px]">
      <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">{label}</div>
      <div className="font-display font-bold tabular text-ink text-sm leading-tight mt-0.5">{value}</div>
    </div>
  );
}

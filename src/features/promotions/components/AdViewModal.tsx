import { Modal, Button } from 'antd';
import {
  ExternalLink,
  Calendar,
  MousePointerClick,
  Eye,
  Megaphone,
  PoundSterling,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatNumber, formatGBP, formatDate } from '@/lib/utils';
import type { Ad } from '../types';

interface AdViewModalProps {
  open: boolean;
  ad: Ad | null;
  onClose: () => void;
  onEdit: (ad: Ad) => void;
}

export function AdViewModal({ open, ad, onClose, onEdit }: AdViewModalProps) {
  if (!ad) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span className="font-display font-bold text-ink">Ad details</span>
      }
      centered
      width={520}
      footer={
        <div className="flex justify-between items-center pt-1">
          <Button onClick={onClose}>Close</Button>
          <Button type="primary" onClick={() => { onClose(); onEdit(ad); }}>
            Edit ad
          </Button>
        </div>
      }
      className="premium-modal"
    >
      <div className="space-y-5 pt-2">
        {/* Image */}
        {ad.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-line">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-44 object-cover"
            />
          </div>
        )}

        {/* Title + Status */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-bold text-lg text-ink leading-tight">{ad.title}</h3>
          <span
            className={`
              inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shrink-0
              ${ad.active
                ? 'bg-[rgba(67,122,34,0.12)] text-[#437A22]'
                : 'bg-[rgba(40,37,29,0.08)] text-[#6C665D]'}
            `}
          >
            {ad.active
              ? <><CheckCircle2 size={12} /> Active</>
              : <><XCircle size={12} /> Inactive</>
            }
          </span>
        </div>

        {/* Redirect URL */}
        <div className="rounded-xl border border-line bg-surface-sunken/30 px-4 py-3 flex items-center gap-3">
          <ExternalLink size={15} className="text-ink-muted shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-ink-faint font-bold mb-0.5">Redirect URL</p>
            <a
              href={ad.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary font-medium truncate block hover:underline"
            >
              {ad.redirectUrl}
            </a>
          </div>
        </div>

        {/* Dates */}
        <div className="rounded-xl border border-line bg-surface-sunken/30 px-4 py-3 flex items-center gap-3">
          <Calendar size={15} className="text-ink-muted shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-faint font-bold mb-0.5">Campaign period</p>
            <p className="text-sm font-semibold text-ink">
              {formatDate(ad.startDate)} → {formatDate(ad.endDate)}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <ViewStat
            icon={<Megaphone size={14} />}
            label="Impressions"
            value={formatNumber(ad.impressions)}
            accent="info"
          />
          <ViewStat
            icon={<Eye size={14} />}
            label="Views"
            value={formatNumber(ad.views)}
            accent="purple"
          />
          <ViewStat
            icon={<MousePointerClick size={14} />}
            label="Clicks"
            value={formatNumber(ad.clicks)}
            accent="amber"
          />
          <ViewStat
            icon={<PoundSterling size={14} />}
            label="Revenue"
            value={formatGBP(ad.revenue)}
            accent="success"
          />
        </div>
      </div>
    </Modal>
  );
}

const ACCENT_CLASSES: Record<string, string> = {
  info:   'bg-[#00649414] text-info',
  purple: 'bg-[#7A39BB14] text-purple',
  amber:  'bg-accent-50 text-[#8A5C00]',
  success:'bg-[#43762212] text-success',
};

function ViewStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-raised p-3.5 flex items-center gap-3">
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${ACCENT_CLASSES[accent]}`}>
        {icon}
      </span>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">{label}</p>
        <p className="font-display font-bold text-ink text-base leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

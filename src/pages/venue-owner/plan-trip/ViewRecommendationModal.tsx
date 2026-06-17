import { Modal, Button } from 'antd';
import { Star, MapPin, ExternalLink, Pencil, Banknote, Ruler, MousePointerClick } from 'lucide-react';
import type { Recommendation } from '@/constants/mock-recommendation';

interface ViewRecommendationModalProps {
  open: boolean;
  recommendation: Recommendation | null;
  onCancel: () => void;
  onEdit: (item: Recommendation) => void;
}

export function ViewRecommendationModal({
  open,
  recommendation,
  onCancel,
  onEdit,
}: ViewRecommendationModalProps) {
  if (!recommendation) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={null}
      width={620}
      centered
      className="premium-modal"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Close</Button>
          {recommendation.url && (
            <Button
              icon={<ExternalLink size={14} />}
              onClick={() => window.open(recommendation.url, '_blank', 'noopener,noreferrer')}
            >
              Visit website
            </Button>
          )}
          <Button
            type="primary"
            icon={<Pencil size={14} />}
            onClick={() => onEdit(recommendation)}
          >
            Edit
          </Button>
        </div>
      }
    >
      <div className="-mx-6 -mt-6">
        <div className="relative h-56 overflow-hidden rounded-t-2xl bg-surface-sunken">
          <img
            src={recommendation.image}
            alt={recommendation.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-5">
            <span className="chip chip-accent inline-flex">{recommendation.category}</span>
            <h2 className="mt-2 font-display font-extrabold text-2xl text-white leading-tight">
              {recommendation.name}
            </h2>
          </div>
        </div>
      </div>

      <div className="pt-5 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-line bg-surface-sunken/60 p-3">
            <div className="field-label flex items-center gap-1.5">
              <Star size={11} /> Rating
            </div>
            <div className="mt-1 inline-flex items-center gap-1">
              <Star size={14} className="text-accent fill-accent" />
              <span className="font-display font-bold tabular text-ink text-lg">
                {recommendation.rating.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-line bg-surface-sunken/60 p-3">
            <div className="field-label flex items-center gap-1.5">
              <Ruler size={11} /> Distance
            </div>
            <div className="mt-1 font-display font-bold tabular text-ink text-lg">
              {recommendation.distance}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-surface-sunken/60 p-3">
            <div className="field-label flex items-center gap-1.5">
              <Banknote size={11} /> Price
            </div>
            <div className="mt-1 font-display font-bold tabular text-ink text-lg">
              {recommendation.price}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-surface-sunken/60 p-3">
            <div className="field-label flex items-center gap-1.5">
              <MousePointerClick size={11} /> Clicks
            </div>
            <div className="mt-1 font-display font-bold tabular text-ink text-lg">
              {recommendation.total_clicks.toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <div className="field-label flex items-center gap-1.5">
            <MapPin size={11} /> Location
          </div>
          <p className="mt-1.5 text-sm text-ink leading-relaxed">{recommendation.location}</p>
        </div>

        {recommendation.url && (
          <div>
            <div className="field-label flex items-center gap-1.5">
              <ExternalLink size={11} /> Website
            </div>
            <a
              href={recommendation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-primary hover:underline break-all"
            >
              {recommendation.url}
            </a>
          </div>
        )}

        {recommendation.description && (
          <div>
            <div className="field-label">About</div>
            <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">
              {recommendation.description}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
